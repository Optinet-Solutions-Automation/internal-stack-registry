import { supabase } from '../lib/supabase';

const EXPECTED_TABLES = [
  'user_roles',
  'tools',
  'billing_subscriptions',
  'wallets',
  'topup_transactions',
  'usage_logs',
  'projects',
  'tool_project_mapping',
  'credential_reference',
  'incident_logs',
];

const verify = async (): Promise<void> => {
  console.log('Verifying schema...\n');

  let allPassed = true;

  for (const table of EXPECTED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    const passed = !error || error.code === 'PGRST116'; // PGRST116 = no rows, which is fine
    const status = passed ? '✓' : '✗';
    console.log(`  ${status}  ${table}${passed ? '' : `  → ${error?.message}`}`);
    if (!passed) allPassed = false;
  }

  console.log('');
  if (allPassed) {
    console.log('All tables verified.');
  } else {
    console.log('Some tables are missing. Run supabase/migrations/001_initial_schema.sql first.');
    process.exit(1);
  }
};

verify();
