const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateMenu() {
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

  // 1. Fetch Avocado
  console.log('Fetching Avocado item...');
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('*')
    .ilike('name', '%อะโวคาโด%')
    .limit(1);

  if (fetchError || !items || items.length === 0) {
    console.error('Fetch Failed:', fetchError ? fetchError.message : 'No items found');
    return;
  }

  const avocado = items[0];
  console.log(`Found item: ${avocado.name} (ID: ${avocado.id}, is_available: ${avocado.is_available})`);

  // 2. Attempt to update price
  console.log('Attempting to update price to 85...');
  const { data: updated, error: updateError } = await supabase
    .from('menu_items')
    .update({ price: 85 })
    .eq('id', avocado.id)
    .select();

  if (updateError) {
    console.error('❌ Update Failed with Error:', updateError);
  } else {
    console.log('✅ Update Succeeded! New state:', updated);
  }
}

testUpdateMenu();
