-- ============================================================
-- Internal Stack Registry — Initial Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type billing_type as enum ('subscription', 'wallet', 'usage', 'free');
create type risk_level as enum ('low', 'medium', 'high', 'critical');
create type tool_status as enum ('active', 'inactive', 'deprecated');
create type payment_frequency as enum ('monthly', 'quarterly', 'annual');
create type project_stage as enum ('planning', 'active', 'maintenance', 'archived');
create type incident_type as enum ('outage', 'cost_spike', 'security');
create type incident_severity as enum ('low', 'medium', 'high', 'critical');
create type incident_status as enum ('open', 'investigating', 'resolved');
create type user_role as enum ('super_admin', 'finance_admin', 'devops', 'viewer');

-- ============================================================
-- TABLES
-- ============================================================

-- User roles (maps auth.users → role)
create table user_roles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  role        user_role not null default 'viewer',
  created_at  timestamptz not null default now(),
  unique(user_id)
);

-- Tools
create table tools (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text,
  billing_type billing_type not null default 'free',
  vendor      text,
  owner       text,
  environment text,
  critical    boolean not null default false,
  risk_level  risk_level not null default 'low',
  status      tool_status not null default 'active',
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Billing subscriptions
create table billing_subscriptions (
  id                uuid primary key default uuid_generate_v4(),
  tool_id           uuid references tools(id) on delete cascade not null,
  plan_name         text,
  monthly_cost      numeric(12,2) not null default 0,
  currency          text not null default 'USD',
  payment_frequency payment_frequency not null default 'monthly',
  renewal_date      date,
  billing_owner     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Wallets
create table wallets (
  id              uuid primary key default uuid_generate_v4(),
  tool_id         uuid references tools(id) on delete cascade not null unique,
  current_balance numeric(12,2) not null default 0,
  currency        text not null default 'USD',
  low_threshold   numeric(12,2) not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Top-up transactions
create table topup_transactions (
  id           uuid primary key default uuid_generate_v4(),
  wallet_id    uuid references wallets(id) on delete cascade not null,
  amount       numeric(12,2) not null,
  currency     text not null default 'USD',
  topped_up_by text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- Usage logs (one row per tool per month)
create table usage_logs (
  id           uuid primary key default uuid_generate_v4(),
  tool_id      uuid references tools(id) on delete cascade not null,
  month        date not null,
  usage_amount numeric(12,4) not null default 0,
  currency     text not null default 'USD',
  budget_limit numeric(12,2),
  created_at   timestamptz not null default now(),
  unique(tool_id, month)
);

-- Projects
create table projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  owner       text,
  stage       project_stage not null default 'planning',
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Tool ↔ Project mapping
create table tool_project_mapping (
  id         uuid primary key default uuid_generate_v4(),
  tool_id    uuid references tools(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  role       text,
  created_at timestamptz not null default now(),
  unique(tool_id, project_id)
);

-- Credential references (no raw passwords)
create table credential_reference (
  id                  uuid primary key default uuid_generate_v4(),
  tool_id             uuid references tools(id) on delete cascade not null,
  login_type          text,
  credential_location text,
  last_rotated        date,
  rotation_policy     text,
  owner               text,
  compliance_notes    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Incident logs
create table incident_logs (
  id                  uuid primary key default uuid_generate_v4(),
  tool_id             uuid references tools(id) on delete cascade not null,
  type                incident_type not null,
  severity            incident_severity not null default 'low',
  description         text,
  root_cause          text,
  financial_impact    numeric(12,2),
  resolution_steps    text,
  preventive_measures text,
  status              incident_status not null default 'open',
  resolved_by         text,
  occurred_at         timestamptz not null default now(),
  resolved_at         timestamptz,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tools_updated_at
  before update on tools for each row execute function update_updated_at();

create trigger billing_subscriptions_updated_at
  before update on billing_subscriptions for each row execute function update_updated_at();

create trigger wallets_updated_at
  before update on wallets for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects for each row execute function update_updated_at();

create trigger credential_reference_updated_at
  before update on credential_reference for each row execute function update_updated_at();

-- ============================================================
-- ROLE HELPER FUNCTION
-- ============================================================

create or replace function get_user_role()
returns user_role as $$
  select role from user_roles where user_id = auth.uid();
$$ language sql security definer stable;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table user_roles enable row level security;
alter table tools enable row level security;
alter table billing_subscriptions enable row level security;
alter table wallets enable row level security;
alter table topup_transactions enable row level security;
alter table usage_logs enable row level security;
alter table projects enable row level security;
alter table tool_project_mapping enable row level security;
alter table credential_reference enable row level security;
alter table incident_logs enable row level security;

-- user_roles
create policy "Users can read own role"
  on user_roles for select using (user_id = auth.uid());

create policy "Super admin manages user_roles"
  on user_roles for all using (get_user_role() = 'super_admin');

-- tools
create policy "Authenticated can read tools"
  on tools for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert tools"
  on tools for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin and devops can update tools"
  on tools for update using (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete tools"
  on tools for delete using (get_user_role() = 'super_admin');

-- billing_subscriptions
create policy "Authenticated can read billing"
  on billing_subscriptions for select using (auth.role() = 'authenticated');

create policy "Finance admin and super admin can insert billing"
  on billing_subscriptions for insert with check (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Finance admin and super admin can update billing"
  on billing_subscriptions for update using (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Super admin can delete billing"
  on billing_subscriptions for delete using (get_user_role() = 'super_admin');

-- wallets
create policy "Authenticated can read wallets"
  on wallets for select using (auth.role() = 'authenticated');

create policy "Finance admin and super admin can insert wallets"
  on wallets for insert with check (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Finance admin and super admin can update wallets"
  on wallets for update using (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Super admin can delete wallets"
  on wallets for delete using (get_user_role() = 'super_admin');

-- topup_transactions
create policy "Authenticated can read topups"
  on topup_transactions for select using (auth.role() = 'authenticated');

create policy "Finance admin and super admin can insert topups"
  on topup_transactions for insert with check (get_user_role() in ('super_admin', 'finance_admin'));

create policy "Super admin can delete topups"
  on topup_transactions for delete using (get_user_role() = 'super_admin');

-- usage_logs
create policy "Authenticated can read usage"
  on usage_logs for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert usage"
  on usage_logs for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin and devops can update usage"
  on usage_logs for update using (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete usage"
  on usage_logs for delete using (get_user_role() = 'super_admin');

-- projects
create policy "Authenticated can read projects"
  on projects for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert projects"
  on projects for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin and devops can update projects"
  on projects for update using (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete projects"
  on projects for delete using (get_user_role() = 'super_admin');

-- tool_project_mapping
create policy "Authenticated can read tool_project_mapping"
  on tool_project_mapping for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert tool_project_mapping"
  on tool_project_mapping for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete tool_project_mapping"
  on tool_project_mapping for delete using (get_user_role() = 'super_admin');

-- credential_reference
create policy "Authenticated can read credentials"
  on credential_reference for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert credentials"
  on credential_reference for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin and devops can update credentials"
  on credential_reference for update using (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete credentials"
  on credential_reference for delete using (get_user_role() = 'super_admin');

-- incident_logs
create policy "Authenticated can read incidents"
  on incident_logs for select using (auth.role() = 'authenticated');

create policy "Super admin and devops can insert incidents"
  on incident_logs for insert with check (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin and devops can update incidents"
  on incident_logs for update using (get_user_role() in ('super_admin', 'devops'));

create policy "Super admin can delete incidents"
  on incident_logs for delete using (get_user_role() = 'super_admin');
