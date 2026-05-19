-- ============================================================
-- 99_seed.sql
-- Havi-Smoothies × Supabase — Sample Seed Data
-- ============================================================

-- ----------------------------
-- 1. Menu Items
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
-- 2. Flash Sale
-- ----------------------------
INSERT INTO flash_sales (title, title_en, discount_percent, start_time, end_time) VALUES
  ('แฮปปี้อาวร์ลด 20%', 'Happy Hour 20% Off', 20, NOW(), NOW() + INTERVAL '4 hours')
ON CONFLICT DO NOTHING;