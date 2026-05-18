-- ============================================================
-- 99_seed.sql
-- Havi-Smoothies × Supabase — Sample Seed Data
-- ⚠️  dev / staging เท่านั้น — อย่ารันบน production
-- หมายเหตุ: สร้าง user ผ่าน Supabase Auth Dashboard ก่อน
--           แล้วเอา UUID มาใส่ใน profiles ด้านล่าง
-- ============================================================

-- ตัวอย่างเมนู
INSERT INTO menu_items (name, name_en, category, price, emoji, bg_color, is_featured, is_new) VALUES
  ('มะม่วงปั่น',         'Mango Madness',      'fruit',     65, '🥭', '#FFF3CD', TRUE,  FALSE),
  ('สตรอว์เบอร์รี่ปั่น', 'Strawberry Bliss',   'fruit',     70, '🍓', '#FFE4E6', TRUE,  TRUE),
  ('แตงโมปั่น',          'Watermelon Splash',  'fruit',     60, '🍉', '#FFDEE2', FALSE, FALSE),
  ('คะน้าปั่น',          'Kale Power',         'vegetable', 65, '🥬', '#D4EDDA', FALSE, FALSE),
  ('แครอทสด',           'Carrot Boost',       'vegetable', 60, '🥕', '#FFE5CC', FALSE, TRUE);

-- Flash Sale ตัวอย่าง
INSERT INTO flash_sales (title, title_en, discount_percent, start_time, end_time) VALUES
  ('แฮปปี้อาวร์ลด 20%', 'Happy Hour 20% Off', 20, NOW(), NOW() + INTERVAL '4 hours');
