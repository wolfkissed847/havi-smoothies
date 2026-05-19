const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAvocado() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .ilike('name', '%อะโวคาโด%');
    
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Avocado data:', data);
  }
}

checkAvocado();
