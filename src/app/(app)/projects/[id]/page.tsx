import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ProjectStage, BillingType, RiskLevel, ToolStatus } from '@/types/database';

const STAGE_CLS: Record<ProjectStage, string> = {
  planning:    'bg-gray-800 text-gray-400',
  active:      'bg-green-900 text-green-300',
  maintenance: 'bg-yellow-900 text-yellow-300',
  archived:    'bg-gray-800 text-gray-500',
};
const RISK_CLS: Record<RiskLevel, string> = {
  low: 'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};
const BILLING_CLS: Record<BillingType, string> = {
  subscription: 'bg-blue-900 text-blue-300',
  wallet:       'bg-purple-900 text-purple-300',
  usage:        'bg-yellow-900 text-yellow-300',
  free:         'bg-gray-800 text-gray-400',
};
const STATUS_CLS: Record<ToolStatus, string> = {
  active:     'bg-green-900 text-green-300',
  inactive:   'bg-gray-800 text-gray-400',
  deprecated: 'bg-red-900 text-red-300',
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  );
}

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
      <span className="text-sm text-gray-500 shrink-0 w-32">{label}</span>
      <span className="text-sm text-gray-200 text-right">{children}</span>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: project }, { data: mappings }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', params.id).single(),
    supabase
      .from('tool_project_mapping')
      .select(`
        id, role,
        tools(
          id, name, category, billing_type, risk_level, status, critical, vendor,
          billing_subscriptions(monthly_cost, currency),
          wallets(current_balance, currency)
        )
      `)
      .eq('project_id', params.id),
  ]);

  if (!project) notFound();

  type MappedTool = {
    id: string;
    role: string | null;
    tools: {
      id: string;
      name: string;
      category: string | null;
      billing_type: BillingType;
      risk_level: RiskLevel;
      status: ToolStatus;
      critical: boolean;
      vendor: string | null;
      billing_subscriptions: { monthly_cost: number; currency: string }[];
      wallets: { current_balance: number; currency: string }[];
    } | null;
  };

  const toolMappings = (mappings ?? []) as MappedTool[];
  const activeTools = toolMappings.filter(m => m.tools?.status === 'active');

  const totalFixed = activeTools.reduce((sum, m) => {
    const sub = m.tools?.billing_subscriptions?.[0];
    return sum + (sub?.monthly_cost ?? 0);
  }, 0);

  const totalWalletBalance = activeTools.reduce((sum, m) => {
    const wallet = m.tools?.wallets?.[0];
    return sum + (wallet?.current_balance ?? 0);
  }, 0);

  const criticalCount = activeTools.filter(m => m.tools?.critical).length;
  const highRiskCount = activeTools.filter(m =>
    m.tools?.risk_level === 'high' || m.tools?.risk_level === 'critical'
  ).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Projects
        </Link>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <Badge label={project.stage} cls={STAGE_CLS[project.stage as ProjectStage]} />
        </div>
        {project.description && (
          <p className="mt-2 text-sm text-gray-400">{project.description}</p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tools',        value: toolMappings.length.toString() },
          { label: 'Est. Monthly Cost',  value: totalFixed > 0 ? `USD ${totalFixed.toFixed(2)}` : '—' },
          { label: 'Wallet Balances',    value: totalWalletBalance > 0 ? `USD ${totalWalletBalance.toFixed(2)}` : '—' },
          { label: 'Critical / High Risk', value: `${criticalCount} / ${highRiskCount}` },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="mt-1.5 text-xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Overview + Linked Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="Overview">
          <Row label="Owner">{project.owner ?? '—'}</Row>
          <Row label="Stage"><Badge label={project.stage} cls={STAGE_CLS[project.stage as ProjectStage]} /></Row>
          <Row label="Created">{new Date(project.created_at).toLocaleDateString()}</Row>
        </Section>

        {/* Cost breakdown */}
        <div className="lg:col-span-2">
          <Section title="Cost Breakdown">
            {activeTools.length === 0 ? (
              <p className="text-sm text-gray-500">No active tools linked.</p>
            ) : (
              <div className="space-y-2">
                {activeTools.map(m => {
                  const tool = m.tools!;
                  const sub = tool.billing_subscriptions?.[0];
                  const wallet = tool.wallets?.[0];
                  return (
                    <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-2">
                        {tool.critical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                        <Link href={`/tools/${tool.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                          {tool.name}
                        </Link>
                        {m.role && <span className="text-xs text-gray-600">· {m.role}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge label={tool.billing_type} cls={BILLING_CLS[tool.billing_type]} />
                        <span className="text-sm text-gray-300 w-28 text-right">
                          {sub
                            ? `${sub.currency} ${Number(sub.monthly_cost).toFixed(2)}/mo`
                            : wallet
                            ? `${wallet.currency} ${Number(wallet.current_balance).toFixed(2)} bal`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {totalFixed > 0 && (
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-sm font-semibold text-gray-300">Total Fixed / Month</span>
                    <span className="text-sm font-bold text-white">USD {totalFixed.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* All linked tools table */}
      <Section title="All Linked Tools">
        {toolMappings.length === 0 ? (
          <p className="text-sm text-gray-500">No tools linked to this project.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tool', 'Category', 'Billing', 'Risk', 'Status', 'Role'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {toolMappings.map(m => {
                const tool = m.tools;
                if (!tool) return null;
                return (
                  <tr key={m.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {tool.critical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                        <Link href={`/tools/${tool.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                          {tool.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{tool.category ?? '—'}</td>
                    <td className="py-3 pr-4"><Badge label={tool.billing_type} cls={BILLING_CLS[tool.billing_type]} /></td>
                    <td className="py-3 pr-4"><Badge label={tool.risk_level} cls={RISK_CLS[tool.risk_level]} /></td>
                    <td className="py-3 pr-4"><Badge label={tool.status} cls={STATUS_CLS[tool.status]} /></td>
                    <td className="py-3 text-gray-400 text-xs">{m.role ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
