const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateOrder() {
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

  // 1. Fetch the first pending order
  console.log('Fetching first order...');
  const { data: orders, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (fetchError || !orders || orders.length === 0) {
    console.error('Fetch Failed:', fetchError ? fetchError.message : 'No orders found');
    return;
  }

  const order = orders[0];
  console.log(`Found order: ${order.order_number} (ID: ${order.id}, status: ${order.status})`);

  // 2. Attempt to update status to its same status (no-op update just to test RLS)
  console.log('Attempting to update status...');
  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status: order.status })
    .eq('id', order.id)
    .select();

  if (updateError) {
    console.error('❌ Order Update Failed with Error:', updateError);
  } else {
    console.log('✅ Order Update Succeeded! Returned:', updated);
  }
}

testUpdateOrder();
