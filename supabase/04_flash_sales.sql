-- ============================================================
-- 04_flash_sales.sql
-- Havi-Smoothies × Supabase — Flash Sales
-- หน้าจอ: หน้าหลัก (countdown timer)
-- ============================================================

CREATE TABLE flash_sales (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(150)  NOT NULL,
  title_en         VARCHAR(150),
  discount_percent INT           NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  start_time       TIMESTAMP     NOT NULL,
  end_time         TIMESTAMP     NOT NULL,
  is_active        BOOLEAN       DEFAULT TRUE,
  created_at       TIMESTAMP     DEFAULT NOW(),

  CONSTRAINT chk_flash_sale_time CHECK (end_time > start_time)
);

CREATE INDEX idx_flash_sales_active     ON flash_sales (is_active);
CREATE INDEX idx_flash_sales_start_time ON flash_sales (start_time);
CREATE INDEX idx_flash_sales_end_time   ON flash_sales (end_time);

ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flash_sales: public read active"
  ON flash_sales FOR SELECT
  USING (is_active = TRUE AND NOW() BETWEEN start_time AND end_time);

CREATE POLICY "flash_sales: admin full access"
  ON flash_sales FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));


-- ----------------------------
-- flash_sale_items (junction)
-- ----------------------------
CREATE TABLE flash_sale_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_sale_id   UUID          NOT NULL REFERENCES flash_sales (id) ON DELETE CASCADE,
  menu_item_id    UUID          NOT NULL REFERENCES menu_items (id) ON DELETE CASCADE,
  sale_price      DECIMAL(8,2)  NOT NULL,
  original_price  DECIMAL(8,2)  NOT NULL,

  UNIQUE (flash_sale_id, menu_item_id)
);

CREATE INDEX idx_fsi_flash_sale_id ON flash_sale_items (flash_sale_id);
CREATE INDEX idx_fsi_menu_item_id  ON flash_sale_items (menu_item_id);

ALTER TABLE flash_sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flash_sale_items: public read"
  ON flash_sale_items FOR SELECT
  USING (TRUE);

CREATE POLICY "flash_sale_items: admin full access"
  ON flash_sale_items FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));
