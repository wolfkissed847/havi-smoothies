-- ============================================================
-- 99_seed.sql
-- Havi-Smoothies × Supabase — Sample Seed Data
-- ⚠️  dev / staging เท่านั้น — อย่ารันบน production
-- 
-- ทดสอบระบบด้วยบัญชีต่อไปนี้:
-- 👤 User  : user@gmail.com     | Pass: user (ID: 00000000-0000-0000-0000-000000000001)
-- 🛡️ Admin : admin@gmail.com    | Pass: admin (ID: 00000000-0000-0000-0000-000000000002)
--
-- base ids:
-- - user  = 00000000-0000-0000-0000-000000000001
-- - admin = 00000000-0000-0000-0000-000000000002
-- ============================================================

-- ----------------------------
-- 1. Auth Users (auth.users)
-- ----------------------------
-- รันไฟล์นี้ซ้ำได้ เพื่อ restore 2 base ids กลับมาเสมอ
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'user@gmail.com',
    crypt('user', gen_salt('bf')),
    NOW(),
    '{"name": "Test User"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'admin@gmail.com',
    crypt('admin', gen_salt('bf')),
    NOW(),
    '{"name": "Test Admin"}'::jsonb,
    NOW(), NOW()
  )
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      updated_at = NOW();

-- ----------------------------
-- 2. Profiles
-- หมายเหตุ: trigger on_auth_user_created จะสร้าง profile
--           อัตโนมัติอยู่แล้ว แต่ seed นี้ override role
--           และข้อมูลเพิ่มเติมด้วย ON CONFLICT
-- ----------------------------
INSERT INTO profiles (id, auth_user_id, username, name, role, phone, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'user',  'Test User',  'customer', '0812345678', TRUE),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'admin', 'Test Admin', 'admin',    '0898765432', TRUE)
ON CONFLICT (id) DO UPDATE
  SET auth_user_id = EXCLUDED.auth_user_id,
  username  = EXCLUDED.username,
      name      = EXCLUDED.name,
      role      = EXCLUDED.role,
      phone     = EXCLUDED.phone,
      is_active = EXCLUDED.is_active;

-- ----------------------------
-- 3. Menu Items
-- ----------------------------
INSERT INTO menu_items (name, name_en, category, price, emoji, bg_color, is_featured, is_new) VALUES
  ('มะม่วง',             'Mango Madness',     'fruit',     65, '🥭', '#FFF3CD', TRUE,  FALSE),
  ('สตรอว์เบอร์รี่',     'Strawberry Bliss',  'fruit',     70, '🍓', '#FFE4E6', TRUE,  TRUE),
  ('แตงโม',              'Watermelon Splash', 'fruit',     60, '🍉', '#FFDEE2', FALSE, FALSE),
  ('คะน้า',              'Kale Power',        'vegetable', 65, '🥬', '#D4EDDA', FALSE, FALSE),
  ('แครอท',              'Carrot Boost',      'vegetable', 60, '🥕', '#FFE5CC', FALSE, TRUE),
  ('กล้วยหอม',           'Banana Breeze',     'fruit',     55, '🍌', '#FFF1D6', FALSE, FALSE),
  ('เสาวรส',             'Passion Punch',     'fruit',     75, '🟠', '#FFE8C2', FALSE, TRUE),
  ('ฝรั่ง',              'Guava Glow',        'fruit',     60, '🍈', '#E7F7D4', FALSE, FALSE),
  ('แก้วมังกร',          'Dragon Fruit Dream','fruit',     85, '🐉', '#FDE8FF', TRUE,  TRUE),
  ('อะโวคาโด',           'Avocado Velvet',    'vegetable', 80, '🥑', '#E8F5D8', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- ----------------------------
-- 4. Flash Sale
-- ----------------------------
INSERT INTO flash_sales (title, title_en, discount_percent, start_time, end_time) VALUES
  ('แฮปปี้อาวร์ลด 20%', 'Happy Hour 20% Off', 20, NOW(), NOW() + INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- ----------------------------
-- 5. Demo Orders ( synced with Test User ID )
-- ----------------------------
INSERT INTO orders (
  id,
  order_number,
  user_id,
  customer_name,
  status,
  subtotal,
  delivery_fee,
  total,
  delivery_address,
  notes,
  is_received,
  created_at
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'ORD-2026-0001',
    '00000000-0000-0000-0000-000000000001',
    'Test User',
    'delivered',
    135.00,
    0.00,
    135.00,
    '12/5 Sukhumvit Rd, Khlong Toei, Bangkok 10110',
    'หวานน้อย ขอแบบปั่นละเอียดๆ นะครับ',
    TRUE,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'ORD-2026-0002',
    '00000000-0000-0000-0000-000000000001',
    'Test User',
    'preparing',
    120.00,
    0.00,
    120.00,
    '12/5 Sukhumvit Rd, Khlong Toei, Bangkok 10110',
    '',
    FALSE,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'ORD-2026-0003',
    '00000000-0000-0000-0000-000000000001',
    'Test User',
    'pending',
    65.00,
    10.00,
    75.00,
    '12/5 Sukhumvit Rd, Khlong Toei, Bangkok 10110',
    'แยกน้ำแข็ง',
    FALSE,
    NOW() - INTERVAL '5 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------
-- 6. Demo Order Items
-- ----------------------------
INSERT INTO order_items (
  order_id,
  menu_item_id,
  name_snapshot,
  name_en_snapshot,
  emoji_snapshot,
  bg_color_snapshot,
  unit_price,
  quantity,
  subtotal,
  drink_type,
  sweetness_level,
  cup_type
) VALUES
  -- Items for Order 1
  (
    'd0000000-0000-0000-0000-000000000001',
    (SELECT id FROM menu_items WHERE name_en = 'Mango Madness' LIMIT 1),
    'มะม่วง', 'Mango Madness', '🥭', '#FFF3CD',
    65.00, 1, 65.00,
    'blended', 'less', 'ready'
  ),
  (
    'd0000000-0000-0000-0000-000000000001',
    (SELECT id FROM menu_items WHERE name_en = 'Strawberry Bliss' LIMIT 1),
    'สตรอว์เบอร์รี่', 'Strawberry Bliss', '🍓', '#FFE4E6',
    70.00, 1, 70.00,
    'blended', 'normal', 'ready'
  ),
  -- Items for Order 2
  (
    'd0000000-0000-0000-0000-000000000002',
    (SELECT id FROM menu_items WHERE name_en = 'Watermelon Splash' LIMIT 1),
    'แตงโม', 'Watermelon Splash', '🍉', '#FFDEE2',
    60.00, 2, 120.00,
    'blended', 'normal', 'ready'
  ),
  -- Items for Order 3
  (
    'd0000000-0000-0000-0000-000000000003',
    (SELECT id FROM menu_items WHERE name_en = 'Kale Power' LIMIT 1),
    'คะน้า', 'Kale Power', '🥬', '#D4EDDA',
    65.00, 1, 65.00,
    'blended', 'less', 'ready'
  )
ON CONFLICT DO NOTHING;

-- ----------------------------
-- 7. Demo Reviews
-- ----------------------------
INSERT INTO order_reviews (
  order_id,
  user_id,
  rating,
  review_text,
  created_at
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    5,
    'อร่อยมากค่ะ หวานพอดีๆ ผลไม้หอมสดชื่นมาก แพ็กเกจดีจัดส่งไว',
    NOW() - INTERVAL '1 hour'
  )
ON CONFLICT DO NOTHING;