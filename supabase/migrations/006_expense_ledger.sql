-- ============================================================
-- 006_expense_ledger.sql
-- Syncs data from EXPENSE LEDGER ★.xlsx
-- Covers all transactions Dec 2025 – Jun 2026 across all sheets:
--   Dashboard (raw transactions), By Tool, By Account
-- ============================================================


-- ============================================================
-- 1. NEW TOOLS
--    Tools present in the ledger but missing from the DB
-- ============================================================

insert into tools (name, category, billing_type, vendor, owner, status, risk_level, critical, description) values
  ('VAPI',          'AI / Voice',          'wallet',       'VAPI',      'Hannah', 'active', 'medium', false, 'Voice AI API — credit top-up billing. https://vapi.ai/'),
  ('Anthropic API', 'AI / LLM',            'wallet',       'Anthropic', 'Chris',  'active', 'high',   true,  'Anthropic API usage via console.anthropic.com — separate from Claude.ai subscription'),
  ('Supabase',      'Cloud Infrastructure','subscription', 'Supabase',  'Chris',  'active', 'high',   true,  'PostgreSQL DB & backend. liveprod + sandbox accounts. https://supabase.com/'),
  ('Spyder Proxy',  'Infrastructure',      'wallet',       'Spyder',    'Tomm',   'active', 'low',    false, 'Proxy service — top-up wallet. Account: tommppc@outlook.com'),
  ('Enigma Proxy',  'Infrastructure',      'wallet',       'Enigma',    'Tomm',   'active', 'low',    false, 'Proxy service — top-up wallet. Account: tommppc@outlook.com'),
  ('Proxio',        'Infrastructure',      'wallet',       'Proxio',    'Tomm',   'active', 'low',    false, 'Proxy service — top-up wallet. Account: tommppc@outlook.com'),
  ('ProxyLite',     'Infrastructure',      'usage',        'ProxyLite', 'Tomm',   'active', 'low',    false, 'Proxy service — one-off purchases. Account: tommppc@outlook.com');


-- ============================================================
-- 2. BILLING SUBSCRIPTIONS
--    Add plans visible in the ledger that are not yet recorded
-- ============================================================

-- N8N liveprod USD plan ($67.20/mo, distinct from Hannah's EUR PayPal plan)
insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, billing_owner)
select id, 'Starter (liveprod)', 67.20, 'USD', 'monthly', 'liveprod@optinetsolutions.com — Card 9504'
from tools where name = 'N8N';

-- Supabase Pro — liveprod account ($25/mo)
insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, billing_owner)
select id, 'Pro (liveprod)', 25.00, 'USD', 'monthly', 'liveprod@optinetsolutions.com'
from tools where name = 'Supabase';

-- Supabase Pro — sandbox account (~$25/mo, usage can vary)
insert into billing_subscriptions (tool_id, plan_name, monthly_cost, currency, payment_frequency, billing_owner)
select id, 'Pro (sandbox)', 25.00, 'USD', 'monthly', 'sandbox@optinetsolutions.com'
from tools where name = 'Supabase';


-- ============================================================
-- 3. WALLETS
--    Create wallets for new top-up-billed tools
-- ============================================================

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 0.00, 'USD', 20.00 from tools where name = 'Anthropic API';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 0.00, 'USD', 20.00 from tools where name = 'VAPI';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 0.00, 'USD', 10.00 from tools where name = 'Spyder Proxy';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 0.00, 'USD', 10.00 from tools where name = 'Enigma Proxy';

insert into wallets (tool_id, current_balance, currency, low_threshold)
select id, 0.00, 'USD', 10.00 from tools where name = 'Proxio';


-- ============================================================
-- 4. TOP-UP TRANSACTIONS
--    Only entries after the 003_seed cutoff (Jan 27 2026).
--    Dec 2025 + Jan 16 2026 OpenAI topups are baked into the
--    $68.09 seed balance and are not duplicated here.
-- ============================================================

-- OpenAI / ChatGPT wallet topups
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 123.00, 'USD', 'Hannah Porter', '2026-02-13 — Card 6095'
from wallets w join tools t on w.tool_id = t.id where t.name = 'OpenAI / ChatGPT';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 112.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-18 — Card 9504'
from wallets w join tools t on w.tool_id = t.id where t.name = 'OpenAI / ChatGPT';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 172.26, 'USD', 'Hannah Porter', '2026-05-25 — UNPAID as of 2026-06-02'
from wallets w join tools t on w.tool_id = t.id where t.name = 'OpenAI / ChatGPT';

-- Anthropic API (console.anthropic) wallet topups — all in March 2026
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 56.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-18'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Anthropic API';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 112.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-23 — credit card'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Anthropic API';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 112.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-25'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Anthropic API';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 28.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-27'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Anthropic API';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 28.00, 'USD', 'liveprod@optinetsolutions.com', '2026-03-28'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Anthropic API';

-- Spyder Proxy wallet topups
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 52.50, 'USD', 'tommppc@outlook.com', '2026-03-17 — Card 6095'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Spyder Proxy';

insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 50.00, 'USD', 'tommppc@outlook.com', '2026-05-04 — Card 6095'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Spyder Proxy';

-- Enigma Proxy wallet topup
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 50.00, 'USD', 'tommppc@outlook.com', '2026-03-17 — Card 6095'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Enigma Proxy';

-- Proxio wallet topup
insert into topup_transactions (wallet_id, amount, currency, topped_up_by, notes)
select w.id, 50.00, 'USD', 'tommppc@outlook.com', '2026-03-19 — Card 6095'
from wallets w join tools t on w.tool_id = t.id where t.name = 'Proxio';


-- ============================================================
-- 5. USAGE LOGS
--    One row per tool per month (unique constraint enforced).
--    All amounts are the actual net spend for that month.
--    Multi-account totals are aggregated into a single row.
--    EUR months coexist with USD months since they are different
--    calendar months; where both currencies fall in the same
--    month, USD is stored (USD charges are subscription-level).
--
--    Excluded from usage_logs (stored as topup_transactions):
--      OpenAI, Anthropic API, Spyder Proxy, Enigma Proxy, Proxio
-- ============================================================

-- Claude (claude.ai subscriptions + usage billing)
-- Dec 2025: Hannah annual plan charge $200
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2025-12-01', 200.00, 'USD' from tools where name = 'Claude';

-- Feb 2026: Chris API charges in EUR only (no USD that month)
-- €155.28 + €19.36 + €47.95 + €15.97 = €238.56
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 238.56, 'EUR' from tools where name = 'Claude';

-- Mar 2026: liveprod $140.00 + $27.04 = $167.04 (USD takes priority;
-- Chris also had EUR 1,045.82 gross / 424.61 net after €621.21 refund — not captured here)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 167.04, 'USD' from tools where name = 'Claude';

-- Apr 2026: liveprod $18.06+$71.43+$52.01+$52.00+$12.50+$8.11+$32.31+$24.52+$840.00 = $1,110.94
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 1110.94, 'USD' from tools where name = 'Claude';

-- OpenAI / ChatGPT (top-ups = spend for that month)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2025-12-01', 11.20, 'USD' from tools where name = 'OpenAI / ChatGPT';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-01-01', 123.00, 'USD' from tools where name = 'OpenAI / ChatGPT';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 123.00, 'USD' from tools where name = 'OpenAI / ChatGPT';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 112.00, 'USD' from tools where name = 'OpenAI / ChatGPT';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-05-01', 172.26, 'USD' from tools where name = 'OpenAI / ChatGPT';

-- Airtable
-- Dec 2025: $240.00 (annual plan)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2025-12-01', 240.00, 'USD' from tools where name = 'Airtable';

-- Feb 2026: $463.41 charge – $428.07 refund = $35.34 net
--           ($0.00 annual renewal covered by account credit, no cash impact)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 35.34, 'USD' from tools where name = 'Airtable';

-- Midjourney ($10/mo subscription)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-01-01', 10.00, 'USD' from tools where name = 'Midjourney';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 10.00, 'USD' from tools where name = 'Midjourney';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 10.00, 'USD' from tools where name = 'Midjourney';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 10.00, 'USD' from tools where name = 'Midjourney';

-- Lovable ($25 closed-account charge + $25 monthly = $50 in January)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-01-01', 50.00, 'USD' from tools where name = 'Lovable';

-- N8N
-- Jan 2026: Hannah PayPal €29.52
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-01-01', 29.52, 'EUR' from tools where name = 'N8N';

-- Feb 2026: Hannah PayPal €73.80
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 73.80, 'EUR' from tools where name = 'N8N';

-- Mar 2026: liveprod Card 9504 $67.20 (no EUR charge in March)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 67.20, 'USD' from tools where name = 'N8N';

-- Apr 2026: liveprod $67.20 USD (Hannah also paid €73.80 same month — EUR not captured due to unique constraint)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 67.20, 'USD' from tools where name = 'N8N';

-- Google Gemini Pro (€21.99/mo — Hannah, Card 6095)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-02-01', 21.99, 'EUR' from tools where name = 'Google Gemini Pro';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 21.99, 'EUR' from tools where name = 'Google Gemini Pro';

-- VAPI (credit card top-up / usage)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 50.00, 'USD' from tools where name = 'VAPI';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-05-01', 100.00, 'USD' from tools where name = 'VAPI';

-- Anthropic API (console.anthropic) — total topups = total spend for March
-- $56 + $112 + $112 + $28 + $28 = $336.00
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 336.00, 'USD' from tools where name = 'Anthropic API';

-- Supabase — both accounts aggregated per month
-- Mar 2026: liveprod $25 + sandbox $25 = $50.00
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 50.00, 'USD' from tools where name = 'Supabase';

-- Apr 2026: liveprod $25 + sandbox $78.56 = $103.56
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 103.56, 'USD' from tools where name = 'Supabase';

-- Vercel (liveprod — first paid invoice Apr 2026; $0 rows skipped)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 20.00, 'USD' from tools where name = 'Vercel';

-- Google AI Studio (sandbox account — billed to Card 9610)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 9.13, 'USD' from tools where name = 'Google AI Studio';

-- Apr: $6.40 + $16.50 = $22.90
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 22.90, 'USD' from tools where name = 'Google AI Studio';

insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-05-01', 27.98, 'USD' from tools where name = 'Google AI Studio';

-- Spyder Proxy (usage charges only — topups already in topup_transactions)
-- Mar 2026: Completed $52.50 + Completed $13.75 + Completed $13.75 = $80.00
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 80.00, 'USD' from tools where name = 'Spyder Proxy';

-- Apr 2026: Completed $13.75
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 13.75, 'USD' from tools where name = 'Spyder Proxy';

-- Enigma Proxy (usage charges only)
-- Mar 2026: Completed $10.00
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-03-01', 10.00, 'USD' from tools where name = 'Enigma Proxy';

-- Apr 2026: Completed $8.00 + Completed $6.00 = $14.00
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 14.00, 'USD' from tools where name = 'Enigma Proxy';

-- ProxyLite (one-off purchase — Visa, tommppc)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-04-01', 86.00, 'USD' from tools where name = 'ProxyLite';

-- AWS (Hannah, Card 9610 — Jun 2026)
insert into usage_logs (tool_id, month, usage_amount, currency)
select id, '2026-06-01', 27.98, 'USD' from tools where name = 'AWS';


-- ============================================================
-- EXPENSE TOTALS (for verification — matches Excel By Tool sums)
-- ============================================================
-- Tool            | Total USD       | Total EUR
-- ----------------|-----------------|------------------
-- Claude          | $3,588.98       | €238.56
-- OpenAI/ChatGPT  | $521.46 (topups)| —
-- Airtable        | $275.34         | —
-- Midjourney      | $40.00          | —
-- Lovable         | $50.00          | —
-- N8N             | $134.40         | €103.32
-- Google Gemini   | —               | €43.98
-- VAPI            | $150.00         | —
-- Anthropic API   | $336.00 (topups)| —
-- Supabase        | $153.56         | —
-- Vercel          | $20.00          | —
-- Google AI Studio| $59.01          | —
-- Spyder Proxy    | $93.75 (usage)  | —
-- Enigma Proxy    | $24.00 (usage)  | —
-- ProxyLite       | $86.00          | —
-- AWS             | $27.98          | —
-- Proxio          | $50.00 (topup)  | —
-- ============================================================
