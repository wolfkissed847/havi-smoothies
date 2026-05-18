-- ============================================================
-- 02_menu.sql
-- Havi-Smoothies × Supabase — Menu Items
-- หน้าจอ: หน้าหลัก, เมนู, ตะกร้าสินค้า, จัดการเมนู
-- ============================================================

CREATE TABLE menu_items (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100)   NOT NULL,
  name_en         VARCHAR(100)   NOT NULL,
  category        menu_category  NOT NULL,
  price           DECIMAL(8,2)   NOT NULL,
  description     TEXT,
  description_en  TEXT,
  emoji           VARCHAR(10),
  bg_color        VARCHAR(20),
  image_url       TEXT,
  is_new          BOOLEAN        DEFAULT FALSE,
  is_featured     BOOLEAN        DEFAULT FALSE,
  is_available    BOOLEAN        DEFAULT TRUE,
  sort_order      INT            DEFAULT 0,
  created_at      TIMESTAMP      DEFAULT NOW(),
  updated_at      TIMESTAMP      DEFAULT NOW()
);

CREATE INDEX idx_menu_category  ON menu_items (category);
CREATE INDEX idx_menu_available ON menu_items (is_available);
CREATE INDEX idx_menu_featured  ON menu_items (is_featured);
CREATE INDEX idx_menu_is_new    ON menu_items (is_new);

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ----------------------------
-- RLS
-- ----------------------------
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- ลูกค้าอ่านได้เฉพาะเมนูที่มีจำหน่าย
CREATE POLICY "menu: public read available"
  ON menu_items FOR SELECT
  USING (is_available = TRUE);

-- Admin อ่าน/เขียนได้ทั้งหมด
CREATE POLICY "menu: admin full access"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
