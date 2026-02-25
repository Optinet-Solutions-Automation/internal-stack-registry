import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type {
  BillingSubscription, Wallet, TopupTransaction,
  UsageLog, Project, CredentialReference, IncidentLog,
  RiskLevel, ToolStatus, BillingType, IncidentSeverity, IncidentStatus,
} from '@/types/database';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const RISK_CLS: Record<RiskLevel, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};
const STATUS_CLS: Record<ToolStatus, string> = {
  active: 'bg-green-900 text-green-300',
  inactive: 'bg-gray-800 text-gray-400',
  deprecated: 'bg-red-900 text-red-300',
};
const BILLING_CLS: Record<BillingType, string> = {
  subscription: 'bg-blue-900 text-blue-300',
  wallet: 'bg-purple-900 text-purple-300',
  usage: 'bg-yellow-900 text-yellow-300',
  free: 'bg-gray-800 text-gray-400',
};
const SEVERITY_CLS: Record<IncidentSeverity, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};
const INC_STATUS_CLS: Record<IncidentStatus, string> = {
  open: 'bg-red-900 text-red-300',
  investigating: 'bg-yellow-900 text-yellow-300',
  resolved: 'bg-green-900 text-green-300',
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 w-36">{label}</span>
      <span className="text-sm text-gray-200 text-right">{children}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [
    { data: tool },
    { data: subscription },
    { data: wallet },
    { data: usageLogs },
    { data: mappings },
    { data: credential },
    { data: incidents },
  ] = await Promise.all([
    supabase.from('tools').select('*').eq('id', params.id).single(),
    supabase.from('billing_subscriptions').select('*').eq('tool_id', params.id).maybeSingle(),
    supabase.from('wallets').select('*, topup_transactions(amount, currency, topped_up_by, created_at)').eq('tool_id', params.id).maybeSingle(),
    supabase.from('usage_logs').select('*').eq('tool_id', params.id).order('month', { ascending: false }).limit(6),
    supabase.from('tool_project_mapping').select('*, projects(id, name, stage, owner)').eq('tool_id', params.id),
    supabase.from('credential_reference').select('*').eq('tool_id', params.id).maybeSingle(),
    supabase.from('incident_logs').select('*').eq('tool_id', params.id).order('occurred_at', { ascending: false }).limit(10),
  ]);

  if (!tool) notFound();

  const walletData = wallet as (Wallet & { topup_transactions: TopupTransaction[] }) | null;
  const currentUsage = usageLogs?.[0] as UsageLog | undefined;
  const prevUsage = usageLogs?.[1] as UsageLog | undefined;

  // Burn rate: average of last 2 months
  const burnRate = prevUsage && currentUsage
    ? (currentUsage.usage_amount + prevUsage.usage_amount) / 2
    : currentUsage?.usage_amount ?? null;

  const runway = walletData && burnRate && burnRate > 0
    ? (walletData.current_balance / burnRate).toFixed(1)
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Tools
        </Link>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">{tool.name}</h1>
          {tool.critical && (
            <span className="bg-red-900 text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full">Critical</span>
          )}
          <Badge label={tool.status} cls={STATUS_CLS[tool.status]} />
          <Badge label={tool.billing_type} cls={BILLING_CLS[tool.billing_type]} />
        </div>
        {tool.description && (
          <p className="mt-2 text-sm text-gray-400">{tool.description}</p>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Overview */}
        <Section title="Overview">
          <Row label="Vendor">{tool.vendor ?? '—'}</Row>
          <Row label="Owner">{tool.owner ?? '—'}</Row>
          <Row label="Environment">{tool.environment ?? '—'}</Row>
          <Row label="Risk Level"><Badge label={tool.risk_level} cls={RISK_CLS[tool.risk_level]} /></Row>
          <Row label="Critical">{tool.critical ? 'Yes' : 'No'}</Row>
          <Row label="Category">{tool.category ?? '—'}</Row>
          <Row label="Added">{new Date(tool.created_at).toLocaleDateString()}</Row>
        </Section>

        {/* Billing */}
        <Section title="Billing">
          {tool.billing_type === 'subscription' && subscription ? (
            <>
              <Row label="Plan">{(subscription as BillingSubscription).plan_name ?? '—'}</Row>
              <Row label="Monthly Cost">
                {(subscription as BillingSubscription).currency} {Number((subscription as BillingSubscription).monthly_cost).toFixed(2)}
              </Row>
              <Row label="Frequency">{(subscription as BillingSubscription).payment_frequency}</Row>
              <Row label="Renewal">
                {(subscription as BillingSubscription).renewal_date
                  ? new Date((subscription as BillingSubscription).renewal_date!).toLocaleDateString()
                  : '—'}
              </Row>
              <Row label="Billing Owner">{(subscription as BillingSubscription).billing_owner ?? '—'}</Row>
            </>
          ) : tool.billing_type === 'wallet' && walletData ? (
            <>
              <Row label="Current Balance">
                <span className={walletData.current_balance <= walletData.low_threshold ? 'text-red-400 font-semibold' : ''}>
                  {walletData.currency} {Number(walletData.current_balance).toFixed(2)}
                </span>
              </Row>
              <Row label="Low Threshold">{walletData.currency} {Number(walletData.low_threshold).toFixed(2)}</Row>
              {burnRate !== null && <Row label="Avg Burn Rate">{walletData.currency} {Number(burnRate).toFixed(2)} / mo</Row>}
              {runway && <Row label="Est. Runway">{runway} months</Row>}
            </>
          ) : (
            <p className="text-sm text-gray-500">No billing data linked.</p>
          )}
        </Section>

        {/* Usage */}
        {(tool.billing_type === 'usage' || tool.billing_type === 'wallet') && (
          <Section title="Usage (Last 6 Months)">
            {usageLogs && usageLogs.length > 0 ? (
              <div className="space-y-2">
                {usageLogs.map(log => {
                  const l = log as UsageLog;
                  const pct = l.budget_limit ? Math.min((l.usage_amount / l.budget_limit) * 100, 100) : null;
                  return (
                    <div key={l.id}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{new Date(l.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <span>
                          {l.currency} {Number(l.usage_amount).toFixed(2)}
                          {l.budget_limit ? ` / ${Number(l.budget_limit).toFixed(2)}` : ''}
                        </span>
                      </div>
                      {pct !== null && (
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No usage data logged.</p>
            )}
          </Section>
        )}

        {/* Projects */}
        <Section title="Linked Projects">
          {mappings && mappings.length > 0 ? (
            <div className="space-y-3">
              {mappings.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/projects/${m.projects.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                      {m.projects.name}
                    </Link>
                    {m.role && <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>}
                  </div>
                  <Badge label={m.projects.stage} cls="bg-gray-800 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not linked to any projects.</p>
          )}
        </Section>

        {/* Credentials */}
        <Section title="Credential Reference">
          {credential ? (
            <>
              <Row label="Login Type">{(credential as CredentialReference).login_type ?? '—'}</Row>
              <Row label="Location">{(credential as CredentialReference).credential_location ?? '—'}</Row>
              <Row label="Owner">{(credential as CredentialReference).owner ?? '—'}</Row>
              <Row label="Rotation Policy">{(credential as CredentialReference).rotation_policy ?? '—'}</Row>
              <Row label="Last Rotated">
                {(credential as CredentialReference).last_rotated
                  ? new Date((credential as CredentialReference).last_rotated!).toLocaleDateString()
                  : '—'}
              </Row>
              {(credential as CredentialReference).compliance_notes && (
                <Row label="Notes">{(credential as CredentialReference).compliance_notes}</Row>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No credential reference added.</p>
          )}
        </Section>

      </div>

      {/* Incidents — full width */}
      <Section title="Incident History">
        {incidents && incidents.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Type</th>
                <th className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Description</th>
                <th className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Severity</th>
                <th className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(incidents as IncidentLog[]).map(inc => (
                <tr key={inc.id}>
                  <td className="py-3 pr-4 capitalize text-gray-300">{inc.type.replace('_', ' ')}</td>
                  <td className="py-3 pr-4 text-gray-400">{inc.description ?? '—'}</td>
                  <td className="py-3 pr-4"><Badge label={inc.severity} cls={SEVERITY_CLS[inc.severity]} /></td>
                  <td className="py-3 pr-4"><Badge label={inc.status} cls={INC_STATUS_CLS[inc.status]} /></td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(inc.occurred_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No incidents recorded.</p>
        )}
      </Section>
    </div>
  );
}
