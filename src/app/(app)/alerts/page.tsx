import { createClient } from '@/lib/supabase/server';
import AlertsClient from './AlertsClient';

export type AlertItem = {
  id: string;
  type: 'low_balance' | 'budget_exceeded' | 'upcoming_renewal' | 'overdue_renewal' | 'rotation_due' | 'low_runway' | 'open_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  link: string;
};

export default async function AlertsPage() {
  const supabase = await createClient();

  const [
    { data: wallets },
    { data: usageLogs },
    { data: subscriptions },
    { data: credentials },
    { data: incidents },
  ] = await Promise.all([
    supabase.from('wallets').select('*, tools(id, name)'),
    supabase.from('usage_logs').select('*, tools(id, name)').order('month', { ascending: false }),
    supabase.from('billing_subscriptions').select('*, tools(id, name)'),
    supabase.from('credential_reference').select('*, tools(id, name)'),
    supabase.from('incident_logs').select('*, tools(id, name)').neq('status', 'resolved'),
  ]);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const alerts: AlertItem[] = [];

  // 1. Low wallet balance
  for (const w of wallets ?? []) {
    const balance = Number(w.current_balance);
    const threshold = Number(w.low_threshold);
    if (balance <= threshold) {
      const isZero = balance <= 0;
      alerts.push({
        id: `low_balance_${w.id}`,
        type: 'low_balance',
        severity: isZero ? 'critical' : balance <= threshold * 0.5 ? 'high' : 'medium',
        title: 'Low Wallet Balance',
        message: `${(w as any).tools?.name} — balance ${w.currency} ${balance.toFixed(2)} is at or below threshold of ${w.currency} ${threshold.toFixed(2)}`,
        link: `/wallets/${w.id}`,
      });
    }
  }

  // 2. Budget exceeded (current month)
  const currentUsage = (usageLogs ?? []).filter(l => l.month.startsWith(currentMonth));
  for (const l of currentUsage) {
    if (l.budget_limit && Number(l.usage_amount) > Number(l.budget_limit)) {
      const pct = ((Number(l.usage_amount) / Number(l.budget_limit)) * 100).toFixed(0);
      alerts.push({
        id: `budget_${l.id}`,
        type: 'budget_exceeded',
        severity: Number(pct) >= 150 ? 'critical' : Number(pct) >= 120 ? 'high' : 'medium',
        title: 'Budget Exceeded',
        message: `${(l as any).tools?.name} — ${l.currency} ${Number(l.usage_amount).toFixed(2)} spent vs budget of ${Number(l.budget_limit).toFixed(2)} (${pct}%)`,
        link: `/usage`,
      });
    }
  }

  // 3. Upcoming renewals (within 30 days) and overdue
  for (const s of subscriptions ?? []) {
    if (!s.renewal_date) continue;
    const days = Math.ceil((new Date(s.renewal_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      alerts.push({
        id: `overdue_renewal_${s.id}`,
        type: 'overdue_renewal',
        severity: 'high',
        title: 'Renewal Overdue',
        message: `${(s as any).tools?.name} — ${s.plan_name ?? 'subscription'} renewal was due ${Math.abs(days)} days ago`,
        link: `/billing`,
      });
    } else if (days <= 30) {
      alerts.push({
        id: `renewal_${s.id}`,
        type: 'upcoming_renewal',
        severity: days <= 7 ? 'high' : 'low',
        title: 'Upcoming Renewal',
        message: `${(s as any).tools?.name} — ${s.plan_name ?? 'subscription'} renews in ${days} day${days !== 1 ? 's' : ''} on ${new Date(s.renewal_date).toLocaleDateString()}`,
        link: `/billing`,
      });
    }
  }

  // 4. Credential rotation due
  for (const c of credentials ?? []) {
    if (!c.last_rotated || !c.rotation_policy) continue;
    const match = c.rotation_policy.match(/(\d+)/);
    if (!match) continue;
    const policyDays = parseInt(match[1]);
    const daysSince = Math.floor((now.getTime() - new Date(c.last_rotated).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > policyDays) {
      alerts.push({
        id: `rotation_${c.id}`,
        type: 'rotation_due',
        severity: daysSince > policyDays * 1.5 ? 'high' : 'medium',
        title: 'Credential Rotation Due',
        message: `${(c as any).tools?.name} — last rotated ${daysSince} days ago, policy is every ${policyDays} days`,
        link: `/credentials`,
      });
    }
  }

  // 5. Open / investigating incidents (high or critical)
  for (const inc of incidents ?? []) {
    if (inc.severity === 'critical' || inc.severity === 'high') {
      alerts.push({
        id: `incident_${inc.id}`,
        type: 'open_incident',
        severity: inc.severity as 'high' | 'critical',
        title: `${inc.severity === 'critical' ? 'Critical' : 'High'} Incident Open`,
        message: `${(inc as any).tools?.name} — ${inc.type.replace('_', ' ')} is ${inc.status}: ${inc.description ?? 'no description'}`,
        link: `/incidents/${inc.id}`,
      });
    }
  }

  // Sort by severity
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return <AlertsClient alerts={alerts} />;
}
