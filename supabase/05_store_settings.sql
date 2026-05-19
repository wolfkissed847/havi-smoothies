-- ============================================================
-- 05_store_settings.sql
-- Havi-Smoothies × Supabase — Store Settings (singleton)
-- หน้าจอ: ตั้งค่า
-- ============================================================

CREATE TABLE store_settings (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name            VARCHAR(100)  NOT NULL DEFAULT 'Havi-Smoothies',
  store_address         TEXT,
  store_phone           VARCHAR(30),
  open_time             VARCHAR(5)    DEFAULT '08:00',
  close_time            VARCHAR(5)    DEFAULT '20:00',
  line_oa               VARCHAR(100),
  promptpay_number      VARCHAR(20),
  order_notification    BOOLEAN       DEFAULT TRUE,
  email_notification    BOOLEAN       DEFAULT FALSE,
  delivery_fee_default  DECIMAL(8,2)  DEFAULT 0,
  free_delivery_min     DECIMAL(8,2),
  updated_at            TIMESTAMP     DEFAULT NOW()
);

CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Singleton row
INSERT INTO store_settings (store_name) VALUES ('Havi-Smoothies');

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ลูกค้าอ่านได้ (เพื่อแสดงเวลาเปิด-ปิด, ข้อมูลร้าน)
CREATE POLICY "store_settings: public read"
  ON store_settings FOR SELECT
  USING (TRUE);

-- Admin แก้ไขได้
CREATE POLICY "store_settings: admin update"
  ON store_settings FOR UPDATE
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));
