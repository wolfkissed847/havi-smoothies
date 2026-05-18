-- ============================================================
-- 06_notifications.sql
-- Havi-Smoothies × Supabase — Notifications
-- หน้าจอ: แดชบอร์ดแอดมิน, จัดการออเดอร์, ประวัติออเดอร์
-- ============================================================

CREATE TABLE notifications (
  id         UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID               NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  order_id   UUID               REFERENCES orders (id) ON DELETE SET NULL,
  type       notification_type  NOT NULL,
  title      VARCHAR(200)       NOT NULL,
  message    TEXT               NOT NULL,
  is_read    BOOLEAN            DEFAULT FALSE,
  created_at TIMESTAMP          DEFAULT NOW()
);

CREATE INDEX idx_notif_user_id    ON notifications (user_id);
CREATE INDEX idx_notif_is_read    ON notifications (is_read);
CREATE INDEX idx_notif_created_at ON notifications (created_at);
CREATE INDEX idx_notif_order_id   ON notifications (order_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- อ่านการแจ้งเตือนของตัวเอง
CREATE POLICY "notifications: read own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- อัปเดต is_read ของตัวเอง
CREATE POLICY "notifications: update own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin จัดการได้ทั้งหมด
CREATE POLICY "notifications: admin full access"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
