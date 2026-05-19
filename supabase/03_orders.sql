-- ============================================================
-- 03_orders.sql
-- Havi-Smoothies × Supabase — Orders, Order Items, Reviews
-- หน้าจอ: ตะกร้าสินค้า, ยืนยันคำสั่งซื้อ, ประวัติออเดอร์,
--         จัดการออเดอร์, แดชบอร์ดแอดมิน, รายงาน
-- ============================================================

-- Short order number generator (GF-###)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 100;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('order_number_seq');
  RETURN 'GF-' || lpad(next_val::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------
-- orders
-- ----------------------------
CREATE TABLE orders (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(30)   NOT NULL UNIQUE DEFAULT generate_order_number(),
  user_id           UUID          REFERENCES profiles (id) ON DELETE SET NULL,
  customer_name     VARCHAR(100)  NOT NULL,
  status            order_status  NOT NULL DEFAULT 'pending',
  subtotal          DECIMAL(10,2) NOT NULL,
  delivery_fee      DECIMAL(8,2)  DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  delivery_address  TEXT          NOT NULL,
  delivery_lat      DECIMAL(10,7),
  delivery_lng      DECIMAL(10,7),
  notes             TEXT,
  is_received       BOOLEAN       DEFAULT FALSE,
  received_at       TIMESTAMP,
  cancelled_reason  TEXT,
  created_at        TIMESTAMP     DEFAULT NOW(),
  updated_at        TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id      ON orders (user_id);
CREATE INDEX idx_orders_status       ON orders (status);
CREATE INDEX idx_orders_created_at   ON orders (created_at);
CREATE INDEX idx_orders_order_number ON orders (order_number);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders: read own"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "orders: insert own"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "orders: update own received"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders: admin full access"
  ON orders FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));


-- ----------------------------
-- order_items
-- ----------------------------
CREATE TABLE order_items (
  id                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID            NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  menu_item_id       UUID            REFERENCES menu_items (id) ON DELETE SET NULL,
  name_snapshot      VARCHAR(100)    NOT NULL,
  name_en_snapshot   VARCHAR(100)    NOT NULL,
  emoji_snapshot     VARCHAR(10),
  bg_color_snapshot  VARCHAR(20),
  unit_price         DECIMAL(8,2)    NOT NULL,
  quantity           INT             NOT NULL,
  subtotal           DECIMAL(10,2)   NOT NULL,
  drink_type         drink_type      NOT NULL,
  sweetness_level    sweetness_level NOT NULL DEFAULT 'normal',
  cup_type           cup_type        NOT NULL DEFAULT 'ready',
  item_notes         TEXT,
  created_at         TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id     ON order_items (order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items (menu_item_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items: read via order"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "order_items: insert via order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "order_items: admin full access"
  ON order_items FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));


-- ----------------------------
-- order_reviews (1 order : 1 review)
-- ----------------------------
CREATE TABLE order_reviews (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID      NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE,
  user_id      UUID      NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  rating       SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text  TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_order_id   ON order_reviews (order_id);
CREATE INDEX idx_reviews_user_id    ON order_reviews (user_id);
CREATE INDEX idx_reviews_rating     ON order_reviews (rating);
CREATE INDEX idx_reviews_created_at ON order_reviews (created_at);

ALTER TABLE order_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews: read all"
  ON order_reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "reviews: insert own"
  ON order_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews: admin full access"
  ON order_reviews FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));
