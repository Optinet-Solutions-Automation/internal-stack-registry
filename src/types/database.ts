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

export interface Purchase {
  id: string;
  name: string;
  purchase_date: string;
  amount: number;
  currency: string;
  description: string | null;
  vendor: string | null;
  category: string | null;
  assigned_to: string | null;
  warranty_id: string | null;
  warranty_expires: string | null;
  receipt_url: string | null;
  warranty_receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: { id: string; user_id: string; role: UserRole; created_at: string };
        Insert: { id?: string; user_id: string; role: UserRole; created_at?: string };
        Update: { id?: string; user_id?: string; role?: UserRole; created_at?: string };
        Relationships: [];
      };
      tools: {
        Row: { id: string; name: string; category: string | null; billing_type: BillingType; vendor: string | null; owner: string | null; environment: string | null; critical: boolean; risk_level: RiskLevel; status: ToolStatus; description: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; category?: string | null; billing_type: BillingType; vendor?: string | null; owner?: string | null; environment?: string | null; critical?: boolean; risk_level?: RiskLevel; status?: ToolStatus; description?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; category?: string | null; billing_type?: BillingType; vendor?: string | null; owner?: string | null; environment?: string | null; critical?: boolean; risk_level?: RiskLevel; status?: ToolStatus; description?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      billing_subscriptions: {
        Row: { id: string; tool_id: string; plan_name: string | null; monthly_cost: number; currency: string; payment_frequency: PaymentFrequency; renewal_date: string | null; billing_owner: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; tool_id: string; plan_name?: string | null; monthly_cost: number; currency?: string; payment_frequency: PaymentFrequency; renewal_date?: string | null; billing_owner?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; tool_id?: string; plan_name?: string | null; monthly_cost?: number; currency?: string; payment_frequency?: PaymentFrequency; renewal_date?: string | null; billing_owner?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      wallets: {
        Row: { id: string; tool_id: string; current_balance: number; currency: string; low_threshold: number; created_at: string; updated_at: string };
        Insert: { id?: string; tool_id: string; current_balance?: number; currency?: string; low_threshold?: number; created_at?: string; updated_at?: string };
        Update: { id?: string; tool_id?: string; current_balance?: number; currency?: string; low_threshold?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      topup_transactions: {
        Row: { id: string; wallet_id: string; amount: number; currency: string; topped_up_by: string | null; notes: string | null; created_at: string };
        Insert: { id?: string; wallet_id: string; amount: number; currency: string; topped_up_by?: string | null; notes?: string | null; created_at?: string };
        Update: { id?: string; wallet_id?: string; amount?: number; currency?: string; topped_up_by?: string | null; notes?: string | null; created_at?: string };
        Relationships: [];
      };
      usage_logs: {
        Row: { id: string; tool_id: string; month: string; usage_amount: number; currency: string; budget_limit: number | null; created_at: string };
        Insert: { id?: string; tool_id: string; month: string; usage_amount: number; currency?: string; budget_limit?: number | null; created_at?: string };
        Update: { id?: string; tool_id?: string; month?: string; usage_amount?: number; currency?: string; budget_limit?: number | null; created_at?: string };
        Relationships: [];
      };
      projects: {
        Row: { id: string; name: string; owner: string | null; stage: ProjectStage; description: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; owner?: string | null; stage?: ProjectStage; description?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; owner?: string | null; stage?: ProjectStage; description?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      tool_project_mapping: {
        Row: { id: string; tool_id: string; project_id: string; role: string | null; created_at: string };
        Insert: { id?: string; tool_id: string; project_id: string; role?: string | null; created_at?: string };
        Update: { id?: string; tool_id?: string; project_id?: string; role?: string | null; created_at?: string };
        Relationships: [];
      };
      credential_reference: {
        Row: { id: string; tool_id: string; login_type: string | null; credential_location: string | null; last_rotated: string | null; rotation_policy: string | null; owner: string | null; compliance_notes: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; tool_id: string; login_type?: string | null; credential_location?: string | null; last_rotated?: string | null; rotation_policy?: string | null; owner?: string | null; compliance_notes?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; tool_id?: string; login_type?: string | null; credential_location?: string | null; last_rotated?: string | null; rotation_policy?: string | null; owner?: string | null; compliance_notes?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      incident_logs: {
        Row: { id: string; tool_id: string; type: IncidentType; severity: IncidentSeverity; description: string | null; root_cause: string | null; financial_impact: number | null; resolution_steps: string | null; preventive_measures: string | null; status: IncidentStatus; resolved_by: string | null; occurred_at: string; resolved_at: string | null; created_at: string };
        Insert: { id?: string; tool_id: string; type: IncidentType; severity: IncidentSeverity; description?: string | null; root_cause?: string | null; financial_impact?: number | null; resolution_steps?: string | null; preventive_measures?: string | null; status?: IncidentStatus; resolved_by?: string | null; occurred_at: string; resolved_at?: string | null; created_at?: string };
        Update: { id?: string; tool_id?: string; type?: IncidentType; severity?: IncidentSeverity; description?: string | null; root_cause?: string | null; financial_impact?: number | null; resolution_steps?: string | null; preventive_measures?: string | null; status?: IncidentStatus; resolved_by?: string | null; occurred_at?: string; resolved_at?: string | null; created_at?: string };
        Relationships: [];
      };
      purchases: {
        Row: { id: string; name: string; purchase_date: string; amount: number; currency: string; description: string | null; vendor: string | null; category: string | null; assigned_to: string | null; warranty_id: string | null; warranty_expires: string | null; receipt_url: string | null; warranty_receipt_url: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; purchase_date: string; amount: number; currency?: string; description?: string | null; vendor?: string | null; category?: string | null; assigned_to?: string | null; warranty_id?: string | null; warranty_expires?: string | null; receipt_url?: string | null; warranty_receipt_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; purchase_date?: string; amount?: number; currency?: string; description?: string | null; vendor?: string | null; category?: string | null; assigned_to?: string | null; warranty_id?: string | null; warranty_expires?: string | null; receipt_url?: string | null; warranty_receipt_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
