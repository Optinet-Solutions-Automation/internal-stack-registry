-- ============================================================
-- Internal Stack Registry — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Sample tools
insert into tools (id, name, category, billing_type, vendor, owner, environment, critical, risk_level, status, description) values
  ('11111111-0000-0000-0000-000000000001', 'Vercel', 'Hosting', 'subscription', 'Vercel Inc.', 'DevOps', 'production', true, 'medium', 'active', 'Frontend deployment platform'),
  ('11111111-0000-0000-0000-000000000002', 'Supabase', 'Database', 'subscription', 'Supabase Inc.', 'DevOps', 'production', true, 'high', 'active', 'Backend as a service — database and auth'),
  ('11111111-0000-0000-0000-000000000003', 'OpenAI', 'AI/ML', 'wallet', 'OpenAI', 'DevOps', 'production', false, 'medium', 'active', 'AI API — usage-based billing via credits'),
  ('11111111-0000-0000-0000-000000000004', 'Figma', 'Design', 'subscription', 'Figma Inc.', 'Design', 'production', false, 'low', 'active', 'UI/UX design tool'),
  ('11111111-0000-0000-0000-000000000005', 'GitHub', 'DevOps', 'subscription', 'GitHub Inc.', 'DevOps', 'production', true, 'high', 'active', 'Source control and CI/CD');

-- Sample billing subscriptions
insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner) values
  ('11111111-0000-0000-0000-000000000001', 'Pro', 20.00, 'USD', 'monthly', '2026-03-25', 'Finance'),
  ('11111111-0000-0000-0000-000000000002', 'Pro', 25.00, 'USD', 'monthly', '2026-03-25', 'Finance'),
  ('11111111-0000-0000-0000-000000000004', 'Professional', 15.00, 'USD', 'monthly', '2026-03-25', 'Finance'),
  ('11111111-0000-0000-0000-000000000005', 'Team', 40.00, 'USD', 'monthly', '2026-03-25', 'Finance');

-- Sample wallets
insert into wallets (tool_id, current_balance, currency, low_threshold) values
  ('11111111-0000-0000-0000-000000000003', 50.00, 'USD', 10.00);

-- Sample top-up transactions
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 100.00, 'USD', 'Admin', 'Initial top-up'
from wallets w
where w.tool_id = '11111111-0000-0000-0000-000000000003';

-- Sample usage logs
insert into usage_logs (tool_id, month, usage_amount, currency, budget_limit) values
  ('11111111-0000-0000-0000-000000000003', '2026-02-01', 42.50, 'USD', 80.00),
  ('11111111-0000-0000-0000-000000000003', '2026-01-01', 67.80, 'USD', 80.00);

-- Sample projects
insert into projects (id, name, owner, stage, description) values
  ('22222222-0000-0000-0000-000000000001', 'Internal Stack Registry', 'Chris', 'active', 'This platform'),
  ('22222222-0000-0000-0000-000000000002', 'Client Portal', 'Chris', 'planning', 'Customer-facing portal');

-- Tool ↔ Project mapping
insert into tool_project_mapping (tool_id, project_id, role) values
  ('11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Frontend hosting'),
  ('11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Database and auth'),
  ('11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000001', 'Source control'),
  ('11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 'Frontend hosting'),
  ('11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Database and auth');

-- Sample credential references
insert into credential_reference (tool_id, login_type, credential_location, last_rotated, rotation_policy, owner) values
  ('11111111-0000-0000-0000-000000000001', 'SSO', '1Password > Vercel', '2026-01-01', 'Every 90 days', 'DevOps'),
  ('11111111-0000-0000-0000-000000000002', 'API Key', '1Password > Supabase', '2026-01-01', 'Every 90 days', 'DevOps'),
  ('11111111-0000-0000-0000-000000000003', 'API Key', '1Password > OpenAI', '2026-01-01', 'Every 60 days', 'DevOps'),
  ('11111111-0000-0000-0000-000000000005', 'SSO', 'GitHub SSO via Google', null, 'N/A — SSO managed', 'DevOps');

-- Sample incident
insert into incident_logs (tool_id, type, severity, description, status, occurred_at) values
  ('11111111-0000-0000-0000-000000000003', 'cost_spike', 'medium', 'OpenAI usage exceeded 80% of monthly budget in week 3', 'resolved', '2026-01-22');
