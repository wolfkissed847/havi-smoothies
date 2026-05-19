const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRpc() {
  console.log('Logging in as admin@gmail.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin123',
  });

  if (authError) {
    console.error('Login Failed:', authError.message);
    return;
  }
  
  const userId = authData.user.id;
  console.log('Login Success! User ID:', userId);

  // Call rpc check_user_is_admin if available
  const { data, error } = await supabase.rpc('check_user_is_admin', { user_id: userId });
  if (error) {
    console.error('RPC Error:', error.message);
  } else {
    console.log('RPC check_user_is_admin returned:', data);
  }
}

checkRpc();
