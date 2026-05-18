const url = 'https://onxtrxfybxcbqubnswkk.supabase.co/auth/v1/token?grant_type=password';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ueHRyeGZ5YnhjYnF1Ym5zd2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTM4MzksImV4cCI6MjA5NDY2OTgzOX0._1wbWcKgoseqOvClwxzGjA2_n1aM6wshU_uRy6BJp2w';

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': apikey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin' })
})
.then(r => r.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
})
.catch(console.error);
