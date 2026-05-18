import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Attempting to login with admin@gmail.com / admin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'admin',
  });

  if (error) {
    console.error('Login Failed!', error.message);
  } else {
    console.log('Login Succeeded! User ID:', data.user?.id);
  }
}

testLogin();
