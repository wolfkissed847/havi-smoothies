const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('All Profiles:', data);
  }
}

listProfiles();
