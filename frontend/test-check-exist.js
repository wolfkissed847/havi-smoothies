const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExist() {
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

  // 1. Can we select from profiles using our own uid?
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, auth_user_id');

  if (profileError) {
    console.error('Profiles select error:', profileError);
  } else {
    console.log('Visible profiles:', profiles);
  }
}

checkExist();
