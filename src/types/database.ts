export type BillingType = 'subscription' | 'wallet' | 'usage' | 'free';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ToolStatus = 'active' | 'inactive' | 'deprecated';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annual';
export type ProjectStage = 'planning' | 'active' | 'maintenance' | 'archived';
export type IncidentType = 'outage' | 'cost_spike' | 'security';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type UserRole = 'super_admin' | 'finance_admin' | 'devops' | 'viewer';

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string | null;
  billing_type: BillingType;
  vendor: string | null;
  owner: string | null;
  environment: string | null;
  critical: boolean;
  risk_level: RiskLevel;
  status: ToolStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingSubscription {
  id: string;
  tool_id: string;
  plan_name: string | null;
  monthly_cost: number;
  currency: string;
  payment_frequency: PaymentFrequency;
  renewal_date: string | null;
  billing_owner: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  tool_id: string;
  current_balance: number;
  currency: string;
  low_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface TopupTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  topped_up_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface UsageLog {
  id: string;
  tool_id: string;
  month: string;
  usage_amount: number;
  currency: string;
  budget_limit: number | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  owner: string | null;
  stage: ProjectStage;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolProjectMapping {
  id: string;
  tool_id: string;
  project_id: string;
  role: string | null;
  created_at: string;
}

export interface CredentialReference {
  id: string;
  tool_id: string;
  login_type: string | null;
  credential_location: string | null;
  last_rotated: string | null;
  rotation_policy: string | null;
  owner: string | null;
  compliance_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentLog {
  id: string;
  tool_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string | null;
  root_cause: string | null;
  financial_impact: number | null;
  resolution_steps: string | null;
  preventive_measures: string | null;
  status: IncidentStatus;
  resolved_by: string | null;
  occurred_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_roles: { Row: UserRoleRow };
      tools: { Row: Tool };
      billing_subscriptions: { Row: BillingSubscription };
      wallets: { Row: Wallet };
      topup_transactions: { Row: TopupTransaction };
      usage_logs: { Row: UsageLog };
      projects: { Row: Project };
      tool_project_mapping: { Row: ToolProjectMapping };
      credential_reference: { Row: CredentialReference };
      incident_logs: { Row: IncidentLog };
    };
  };
}
