-- ============================================================
-- 00_enums.sql
-- Havi-Smoothies × Supabase — Custom ENUM Types
-- รัน: ก่อนไฟล์อื่นทั้งหมด
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');

CREATE TYPE order_status AS ENUM (
  'pending',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);

CREATE TYPE menu_category    AS ENUM ('fruit', 'vegetable');
CREATE TYPE drink_type       AS ENUM ('cold', 'blended');
CREATE TYPE sweetness_level  AS ENUM ('less', 'normal', 'more', 'extra');
CREATE TYPE cup_type         AS ENUM ('ready', 'separate');
CREATE TYPE ai_message_role  AS ENUM ('user', 'assistant');

CREATE TYPE notification_type AS ENUM (
  'new_order',
  'order_ready',
  'order_delivered',
  'order_cancelled',
  'review_reminder'
);

CREATE TYPE report_period     AS ENUM ('today', 'week', 'month');
CREATE TYPE app_language      AS ENUM ('th', 'en');
CREATE TYPE app_theme         AS ENUM ('light', 'dark');

CREATE TYPE chat_page_context AS ENUM (
  'home', 'menu', 'cart', 'orders',
  'admin_dashboard', 'admin_orders',
  'admin_menu', 'admin_reports', 'admin_settings'
);
