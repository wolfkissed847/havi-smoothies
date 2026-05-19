-- ============================================================
-- 07_ai_chat.sql
-- Havi-Smoothies × Supabase — AI Chat Sessions & Messages
-- หน้าจอ: ทุกหน้า (popup), รองรับ logged-in และ anonymous
-- ============================================================

-- ----------------------------
-- ai_chat_sessions
-- ----------------------------
CREATE TABLE ai_chat_sessions (
  id              UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID               REFERENCES profiles (id) ON DELETE SET NULL,
  session_token   VARCHAR(64)        NOT NULL UNIQUE,
  page_context    chat_page_context,
  created_at      TIMESTAMP          DEFAULT NOW(),
  last_active_at  TIMESTAMP          DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_user_id    ON ai_chat_sessions (user_id);
CREATE INDEX idx_ai_sessions_token      ON ai_chat_sessions (session_token);
CREATE INDEX idx_ai_sessions_created_at ON ai_chat_sessions (created_at);

ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- อ่าน session ตัวเอง (logged-in)
CREATE POLICY "ai_sessions: read own"
  ON ai_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- สร้าง session ใหม่ได้ทุกคน (รวม anonymous)
CREATE POLICY "ai_sessions: insert all"
  ON ai_chat_sessions FOR INSERT
  WITH CHECK (TRUE);

-- Admin อ่านได้ทั้งหมด
CREATE POLICY "chat_sessions: admin full access"
  ON ai_chat_sessions FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));


-- ----------------------------
-- ai_chat_messages
-- ----------------------------
CREATE TABLE ai_chat_messages (
  id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID             NOT NULL REFERENCES ai_chat_sessions (id) ON DELETE CASCADE,
  role       ai_message_role  NOT NULL,
  content    TEXT             NOT NULL,
  created_at TIMESTAMP        DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_session_id ON ai_chat_messages (session_id);
CREATE INDEX idx_ai_messages_created_at ON ai_chat_messages (created_at);

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- อ่าน/เขียนข้อความใน session ของตัวเอง
CREATE POLICY "ai_messages: access via session"
  ON ai_chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_chat_sessions
      WHERE ai_chat_sessions.id = ai_chat_messages.session_id
        AND (
          ai_chat_sessions.user_id = auth.uid()
          OR ai_chat_sessions.user_id IS NULL
        )
    )
  );

-- Admin อ่านได้ทั้งหมด
CREATE POLICY "chat_messages: admin full access"
  ON ai_chat_messages FOR ALL
  USING (check_user_is_admin(auth.uid()))
  WITH CHECK (check_user_is_admin(auth.uid()));
