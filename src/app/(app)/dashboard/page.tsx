import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

function StatCard({
  label, value, sub, href, highlight,
}: {
  label: string; value: string; sub?: string; href?: string; highlight?: 'red' | 'yellow' | 'green';
}) {
  const valCls = highlight === 'red' ? 'text-red-400' : highlight === 'yellow' ? 'text-yellow-400' : highlight === 'green' ? 'text-green-400' : 'text-white';
  const card = (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-1 hover:border-gray-700 transition-colors">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${valCls}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</h2>;
}

// Simple CSS bar chart
function BarChart({ data }: { data: { label: string; value: number; currency: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{d.label}</span>
          <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded flex items-center px-2 transition-all"
              style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? '2rem' : '0' }}
            >
              {d.value > 0 && (
                <span className="text-xs text-white font-medium whitespace-nowrap">
                  {d.currency} {d.value.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: tools },
    { data: subscriptions },
    { data: wallets },
    { data: usageLogs },
    { data: incidents },
    { data: credentials },
  ] = (await Promise.all([
    supabase.from('tools').select('id, name, critical, risk_level, status, billing_type'),
    supabase.from('billing_subscriptions').select('monthly_cost, currency, renewal_date, tools(name)'),
    supabase.from('wallets').select('current_balance, low_threshold, currency, tools(id, name)'),
    supabase.from('usage_logs').select('usage_amount, budget_limit, currency, month, tools(id, name)').order('month', { ascending: false }),
    supabase.from('incident_logs').select('id, severity, status, type, tools(name)').neq('status', 'resolved'),
    supabase.from('credential_reference').select('last_rotated, rotation_policy, tools(name)'),
  ])) as Array<{ data: any[] | null; error: any }>;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  // Cost metrics
  const totalFixed = (subscriptions ?? []).reduce((s, sub) => s + Number(sub.monthly_cost), 0);
  const currentUsage = (usageLogs ?? []).filter(l => l.month.startsWith(currentMonth));
  const totalVariable = currentUsage.reduce((s, l) => s + Number(l.usage_amount), 0);
  const totalWalletBalance = (wallets ?? []).reduce((s, w) => s + Number(w.current_balance), 0);

  // Risk metrics
  const activeTools = (tools ?? []).filter(t => t.status === 'active');
  const criticalTools = activeTools.filter(t => t.critical);
  const highRiskTools = activeTools.filter(t => t.risk_level === 'high' || t.risk_level === 'critical');
  const lowBalanceWallets = (wallets ?? []).filter(w => Number(w.current_balance) <= Number(w.low_threshold));
  const overBudgetTools = currentUsage.filter(l => l.budget_limit && Number(l.usage_amount) > Number(l.budget_limit));
  const openIncidents = (incidents ?? []).filter(i => i.status === 'open' || i.status === 'investigating');
  const criticalIncidents = openIncidents.filter(i => i.severity === 'critical');

  // Upcoming renewals
  const upcomingRenewals = (subscriptions ?? []).filter(s => {
    if (!s.renewal_date) return false;
    const days = Math.ceil((new Date(s.renewal_date).getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  });

  // Overdue credentials
  const overdueCredentials = (credentials ?? []).filter(c => {
    if (!c.last_rotated || !c.rotation_policy) return false;
    const match = c.rotation_policy.match(/(\d+)/);
    if (!match) return false;
    const policyDays = parseInt(match[1]);
    const daysSince = Math.floor((now.getTime() - new Date(c.last_rotated).getTime()) / 86400000);
    return daysSince > policyDays;
  });

  // Usage trend — last 6 months aggregated
  const monthTotals: Record<string, number> = {};
  for (const log of usageLogs ?? []) {
    const m = log.month.slice(0, 7);
    monthTotals[m] = (monthTotals[m] ?? 0) + Number(log.usage_amount);
  }
  const trendData = Object.entries(monthTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([m, v]) => ({
      label: new Date(`${m}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: v,
      currency: 'USD',
    }));

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Cost overview */}
      <div className="space-y-3">
        <SectionTitle>Cost Overview</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Fixed / Month"      value={`USD ${totalFixed.toFixed(2)}`}        sub={`${subscriptions?.length ?? 0} subscriptions`} href="/billing" />
          <StatCard label="Variable This Month" value={totalVariable > 0 ? `USD ${totalVariable.toFixed(2)}` : '—'} sub="from usage logs" href="/usage" />
          <StatCard label="Total Wallet Balance" value={`USD ${totalWalletBalance.toFixed(2)}`} sub={`${wallets?.length ?? 0} wallets`} href="/wallets" />
          <StatCard label="Total / Month Est."  value={`USD ${(totalFixed + totalVariable).toFixed(2)}`} sub="fixed + variable" />
        </div>
      </div>

      {/* Risk overview */}
      <div className="space-y-3">
        <SectionTitle>Risk & Health</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Critical Tools"       value={String(criticalTools.length)}         sub={`${highRiskTools.length} high risk`}       href="/tools"       highlight={criticalTools.length > 0 ? 'red' : undefined} />
          <StatCard label="Low Balance Wallets"  value={String(lowBalanceWallets.length)}      sub="below threshold"                          href="/wallets"     highlight={lowBalanceWallets.length > 0 ? 'red' : undefined} />
          <StatCard label="Over Budget"          value={String(overBudgetTools.length)}        sub="this month"                               href="/usage"       highlight={overBudgetTools.length > 0 ? 'yellow' : undefined} />
          <StatCard label="Open Incidents"       value={String(openIncidents.length)}          sub={`${criticalIncidents.length} critical`}    href="/incidents"   highlight={criticalIncidents.length > 0 ? 'red' : openIncidents.length > 0 ? 'yellow' : undefined} />
        </div>
      </div>

      {/* Action items */}
      <div className="space-y-3">
        <SectionTitle>Action Items</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Renewals in 30 Days"  value={String(upcomingRenewals.length)}       sub="subscriptions"  href="/billing"     highlight={upcomingRenewals.length > 0 ? 'yellow' : undefined} />
          <StatCard label="Credentials Overdue"  value={String(overdueCredentials.length)}     sub="rotation due"   href="/credentials" highlight={overdueCredentials.length > 0 ? 'yellow' : undefined} />
          <StatCard label="Active Tools"         value={String(activeTools.length)}             sub={`of ${tools?.length ?? 0} total`} href="/tools" />
          <StatCard label="Total Alerts"
            value={String(
              lowBalanceWallets.length + overBudgetTools.length +
              upcomingRenewals.length + overdueCredentials.length + openIncidents.length
            )}
            sub="across all modules" href="/alerts"
            highlight={criticalIncidents.length > 0 || lowBalanceWallets.length > 0 ? 'red' : undefined}
          />
        </div>
      </div>

      {/* Two column: trend + quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Variable Spend Trend</h2>
          {trendData.length > 0 ? (
            <BarChart data={trendData} />
          ) : (
            <p className="text-sm text-gray-500">No usage data logged yet.</p>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Access</h2>
          <div className="space-y-2">
            {[
              { href: '/tools',       label: 'Tools Registry',         count: `${activeTools.length} active` },
              { href: '/billing',     label: 'Billing & Subscriptions', count: `USD ${totalFixed.toFixed(2)}/mo` },
              { href: '/wallets',     label: 'Wallets',                count: `USD ${totalWalletBalance.toFixed(2)} total` },
              { href: '/incidents',   label: 'Open Incidents',         count: `${openIncidents.length} open`, warn: openIncidents.length > 0 },
              { href: '/alerts',      label: 'All Alerts',             count: `${lowBalanceWallets.length + overBudgetTools.length + upcomingRenewals.length + overdueCredentials.length + openIncidents.length} active`, warn: criticalIncidents.length > 0 },
              { href: '/credentials', label: 'Credentials',            count: `${overdueCredentials.length} overdue`, warn: overdueCredentials.length > 0 },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm text-gray-200">{item.label}</span>
                <span className={`text-xs font-medium ${item.warn ? 'text-red-400' : 'text-gray-400'}`}>{item.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
