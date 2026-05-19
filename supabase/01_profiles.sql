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
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID          PRIMARY KEY,
  auth_user_id     UUID          UNIQUE,
  username         VARCHAR(50)   UNIQUE,
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

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auth_user_id UUID;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

UPDATE profiles
SET auth_user_id = id
WHERE auth_user_id IS NULL;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_auth_user_id_fkey
  FOREIGN KEY (auth_user_id) REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles (auth_user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles (created_at);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Auto-create profile เมื่อมี user สมัครใหม่ผ่าน Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, username, name, phone)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
    SET auth_user_id = EXCLUDED.auth_user_id,
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------
-- Helper function to check if user is admin safely (avoiding infinite recursion)
-- ----------------------------
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE (id = user_id OR auth_user_id = user_id) AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------
-- RLS
-- ----------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- อ่านโปรไฟล์ตัวเอง
CREATE POLICY "profiles: read own"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

-- แก้ไขโปรไฟล์ตัวเอง
CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Admin อ่านได้ทุกโปรไฟล์
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (check_user_is_admin(auth.uid()));
