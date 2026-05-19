const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
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

  // Check Profile Role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Failed to get profile:', profileError.message);
  } else {
    console.log('Profile Role:', profile.role);
    if (profile.role !== 'admin') {
      console.log('❌ ERROR: This user is not an admin! They have role:', profile.role);
      console.log(`Please run this SQL in Supabase: UPDATE public.profiles SET role = 'admin' WHERE id = '${userId}';`);
    } else {
      console.log('✅ User is correctly set as admin!');
    }
  }

  // Check Orders with relationships
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*, order_items(*), order_reviews(*)');
    
  if (ordersError) {
    console.error('❌ Failed to get orders:', ordersError.message);
  } else {
    console.log(`✅ Admin can see ${orders.length} orders!`);
    if (orders.length > 0) {
      console.log('Sample order order_items:', JSON.stringify(orders[0].order_items));
    }
  }
}

checkAdmin();
