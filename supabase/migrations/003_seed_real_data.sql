-- ============================================================
-- 003_seed_real_data.sql
-- Clears all test data and seeds with real tool inventory
-- Run in Supabase SQL Editor AFTER 001 and 002 migrations
-- ============================================================

-- ============================================================
-- 1. CLEAR ALL TEST DATA
--    Deletes in dependency order — user_roles is preserved
-- ============================================================
truncate table
  incident_logs,
  usage_logs,
  topup_transactions,
  tool_project_mapping,
  wallets,
  billing_subscriptions,
  credential_reference,
  projects,
  purchases,
  tools
cascade;

-- ============================================================
-- 2. TOOLS
-- ============================================================
insert into tools (name, category, billing_type, vendor, owner, status, risk_level, critical, description) values
  ('Google',               'Identity & Productivity', 'free',         'Google',      'Chris',  'active', 'low',    false, 'Primary Google account. Email: hannahporter1905@gmail.com'),
  ('Google Cloud Console', 'Cloud Infrastructure',    'wallet',       'Google',      'Chris',  'active', 'medium', true,  'GCP credit-based billing. https://cloud.google.com/'),
  ('OpenAI / ChatGPT',     'AI / LLM',                'wallet',       'OpenAI',      'Chris',  'active', 'medium', true,  'API + ChatGPT. https://platform.openai.com/'),
  ('Google AI Studio',     'AI / LLM',                'free',         'Google',      'Chris',  'active', 'low',    false, 'Uses GCC credits. https://aistudio.google.com/'),
  ('Midjourney',           'AI / Creative',           'subscription', 'Midjourney',  'Chris',  'active', 'low',    false, 'Image generation. https://www.midjourney.com/'),
  ('Github',               'DevOps',                  'free',         'GitHub',      'Chris',  'active', 'medium', true,  'Code repositories. https://github.com/'),
  ('Vercel',               'DevOps',                  'free',         'Vercel',      'Chris',  'active', 'low',    false, 'Frontend deployments. https://vercel.com/'),
  ('Claude',               'AI / LLM',                'subscription', 'Anthropic',   'Chris',  'active', 'low',    false, 'AI assistant — annual plan. https://claude.ai/'),
  ('Airtable',             'Productivity',            'subscription', 'Airtable',    'Chris',  'active', 'low',    false, 'Database & workflow tools. https://airtable.com/ — annual plan'),
  ('Trello',               'Productivity',            'free',         'Atlassian',   'Chris',  'active', 'low',    false, 'Project boards — added in org. https://trello.com/'),
  ('Lovable',              'AI / Dev Tools',          'free',         'Lovable',     'Chris',  'active', 'low',    false, 'AI app builder. https://lovable.dev/'),
  ('Brevo',                'Marketing',               'free',         'Brevo',       'Chris',  'active', 'low',    false, 'Email marketing. https://www.brevo.com/'),
  ('Google Gemini Pro',    'AI / LLM',                'subscription', 'Google',      'Ivan',   'active', 'low',    false, 'Gemini Pro plan. https://gemini.google.com/'),
  ('N8N',                  'Automation',              'subscription', 'N8N',         'Chris',  'active', 'medium', true,  'Workflow automation — Starter plan. https://app.n8n.cloud/'),
  ('Discord',              'Communication',           'free',         'Discord',     'Chris',  'active', 'low',    false, 'Team communication.'),
  ('AWS',                  'Cloud Infrastructure',    'wallet',       'Amazon',      'Mikko',  'active', 'high',   true,  'AWS cloud services — credit-based. https://console.aws.amazon.com/'),
  ('MS Teams Essentials',  'Communication',           'free',         'Microsoft',   'Team',   'active', 'low',    false, 'Free trial.'),
  ('Notion',               'Productivity',            'free',         'Notion',      'Team',   'active', 'low',    false, 'Docs & wikis.'),
  ('Slack',                'Communication',           'free',         'Slack',       'Team',   'active', 'low',    false, 'Team messaging — free trial. https://app.slack.com/'),
  ('Hunter',               'Sales & Outreach',        'free',         'Hunter',      'Mikko',  'active', 'low',    false, 'Email finder. https://hunter.io/'),
  ('Upstash',              'Cloud Infrastructure',    'free',         'Upstash',     'Mikko',  'active', 'low',    false, 'Redis & Kafka. https://console.upstash.com/'),
  ('CaptureKit',           'Dev Tools',               'free',         'CaptureKit',  'Mikko',  'active', 'low',    false, 'Screenshot API — free trial. https://www.capturekit.dev/ Used by Mikko & Jhon'),
  ('Value Serp',           'Dev Tools',               'free',         'Value Serp',  'Mikko',  'active', 'low',    false, 'SERP API — free trial. https://app.valueserp.com/'),
  ('Serper.dev',           'Dev Tools',               'free',         'Serper',      'Mikko',  'active', 'low',    false, 'SERP API — free trial. https://serper.dev/');

-- ============================================================
-- 3. BILLING SUBSCRIPTIONS (paid plans only)
-- ============================================================
insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner)
select id, 'Basic', 10.00, 'USD', 'monthly', '2026-02-12', 'Chris'
from tools where name = 'Midjourney';

insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner)
select id, 'Pro (Annual)', 20.00, 'USD', 'annual', '2026-12-20', 'Chris'
from tools where name = 'Claude';

insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner)
select id, 'Pro (Annual)', 20.00, 'USD', 'annual', '2026-12-20', 'Chris'
from tools where name = 'Airtable';

insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner)
select id, 'Gemini Pro', 21.99, 'EUR', 'monthly', null, 'Card ending 6095 — Ivan'
from tools where name = 'Google Gemini Pro';

insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, renewal_date, billing_owner)
select id, 'Starter', 29.52, 'EUR', 'monthly', null, 'PayPal — Chris'
from tools where name = 'N8N';

-- ============================================================
-- 4. WALLETS (credit/top-up based tools)
--    Balances as of last CSV update (27 Jan 2026)
-- ============================================================
insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 184.00, 'USD', 20.00 from tools where name = 'Google Cloud Console';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 68.09, 'USD', 10.00 from tools where name = 'OpenAI / ChatGPT';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 147.00, 'USD', 20.00 from tools where name = 'AWS';

-- ============================================================
-- 5. CREDENTIAL REFERENCES
--    No raw passwords stored — login method and account only
-- ============================================================
insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'Email/Password', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Google';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Google Cloud Console';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'OpenAI / ChatGPT';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Google AI Studio';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Midjourney';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Github';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - GitHub', 'hannahporter1905@gmail.com via GitHub', '2026-01-27', 'Chris'
from tools where name = 'Vercel';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Claude';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Airtable';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Trello';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-02-23', 'Chris'
from tools where name = 'Lovable';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-27', 'Chris'
from tools where name = 'Brevo';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'Email/Password', 'innovationofoptinet@gmail.com', '2026-01-27', 'Ivan'
from tools where name = 'Google Gemini Pro';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', '2026-01-28', 'Chris'
from tools where name = 'N8N';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner)
select id, 'Email/Password', 'hannahporter1905@gmail.com', '2026-01-30', 'Chris'
from tools where name = 'Discord';

insert into credential_reference (tool_id, login_type, credential_location, last_rotated, owner, compliance_notes)
select id, 'Email/Password', 'hannahporter1905@gmail.com', '2026-01-27', 'Mikko', 'AWS account registered under Hannah''s email'
from tools where name = 'AWS';

insert into credential_reference (tool_id, login_type, credential_location, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', 'Team'
from tools where name = 'Slack';

insert into credential_reference (tool_id, login_type, credential_location, owner)
select id, 'Email/Password', 'mikko@optinetsolutions.com', 'Mikko'
from tools where name = 'Hunter';

insert into credential_reference (tool_id, login_type, credential_location, owner)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', 'Mikko'
from tools where name = 'Upstash';

insert into credential_reference (tool_id, login_type, credential_location, owner, compliance_notes)
select id, 'OAuth - Google', 'hannahporter1905@gmail.com', 'Mikko', 'Shared access — Mikko and Jhon'
from tools where name = 'CaptureKit';

insert into credential_reference (tool_id, login_type, credential_location, owner)
select id, 'Email/Password', 'hannahporter1905@gmail.com', 'Mikko'
from tools where name = 'Value Serp';

insert into credential_reference (tool_id, login_type, credential_location, owner)
select id, 'Email/Password', 'hannahporter1905@gmail.com', 'Mikko'
from tools where name = 'Serper.dev';
