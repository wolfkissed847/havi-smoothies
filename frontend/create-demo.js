const url = 'https://onxtrxfybxcbqubnswkk.supabase.co/auth/v1/signup';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueHRyeGZ5YnhjYnF1Ym5zd2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTM4MzksImV4cCI6MjA5NDY2OTgzOX0._1wbWcKgoseqOvClwxzGjA2_n1aM6wshU_uRy6BJp2w';

async function createDemoUsers() {
  console.log('Creating admin@gmail.com...');
  const resAdmin = await fetch(url, {
    method: 'POST',
    headers: { 'apikey': apikey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'admin@gmail.com', 
      password: 'admin123', 
      data: { name: 'Admin', phone: '0898765432' } 
    })
  });
  console.log('Admin:', await resAdmin.json());

  console.log('Creating user@gmail.com...');
  const resUser = await fetch(url, {
    method: 'POST',
    headers: { 'apikey': apikey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'user@gmail.com', 
      password: 'user123', 
      data: { name: 'User', phone: '0812345678' } 
    })
  });
  console.log('User:', await resUser.json());
}

createDemoUsers();
