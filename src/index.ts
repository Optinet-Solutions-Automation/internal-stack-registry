import { supabase } from './lib/supabase';

const main = async (): Promise<void> => {
  console.log('internal-stack-registry running');

  // Verify Supabase connection
  const { error } = await supabase.auth.getSession();
  if (error) {
    console.error('Supabase connection error:', error.message);
  } else {
    console.log('Supabase connected successfully');
  }
};

main();
