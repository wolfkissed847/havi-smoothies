-- ============================================================
-- 01_profiles.sql
-- Havi-Smoothies × Supabase — Profiles Table
-- เชื่อมกับ auth.users ของ Supabase (ไม่ต้องเก็บ email/password เอง)
-- หน้าจอ: เข้าสู่ระบบ, สมัครสมาชิก, แดชบอร์ดแอดมิน, ตั้งค่า
-- ============================================================

-- Extension สำหรับ auto-update updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- ----------------------------
-- profiles (แทน users)
-- ----------------------------
CREATE TABLE profiles (
  id               UUID          PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name             VARCHAR(100),
  phone            VARCHAR(20),
  role             user_role     NOT NULL DEFAULT 'customer',
  avatar_url       TEXT,
  preferred_lang   app_language  DEFAULT 'th',
  preferred_theme  app_theme     DEFAULT 'light',
  is_active        BOOLEAN       DEFAULT TRUE,
  created_at       TIMESTAMP     DEFAULT NOW(),
  updated_at       TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX idx_profiles_role       ON profiles (role);
CREATE INDEX idx_profiles_created_at ON profiles (created_at);

-- Auto-update updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Auto-create profile เมื่อมี user สมัครใหม่ผ่าน Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------
-- RLS
-- ----------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- อ่านโปรไฟล์ตัวเอง
CREATE POLICY "profiles: read own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- แก้ไขโปรไฟล์ตัวเอง
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin อ่านได้ทุกโปรไฟล์
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
