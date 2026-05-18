# Havi-Smoothies × Supabase — SQL Snippets

## ลำดับการรันใน SQL Editor

```
00_enums.sql          ← ENUM types ทั้งหมด
01_profiles.sql       ← profiles + trigger auth + RLS
02_menu.sql           ← menu_items + RLS
03_orders.sql         ← orders + order_items + order_reviews + RLS
04_flash_sales.sql    ← flash_sales + flash_sale_items + RLS
05_store_settings.sql ← store_settings (singleton) + RLS
06_notifications.sql  ← notifications + RLS
07_ai_chat.sql        ← ai_chat_sessions + ai_chat_messages + RLS
08_reports_cache.sql  ← sales_reports_cache + RLS
09_rag_vector.sql     ← pgvector + คลังเวกเตอร์ RAG + RPC Search
99_seed.sql           ← ข้อมูลตัวอย่าง (dev เท่านั้น)
```

## สิ่งที่เปลี่ยนจาก version เดิม

| ประเด็น | เดิม | Supabase |
|---|---|---|
| Users | `users` table เอง | `profiles` เชื่อม `auth.users` |
| Email/Password | เก็บเอง | Supabase Auth จัดการ |
| updated_at trigger | `set_updated_at()` เอง | `moddatetime` extension |
| Security | ไม่มี | RLS ทุกตาราง |

## วิธีสร้าง Admin User

1. ไปที่ **Authentication → Users** แล้วสร้าง user ปกติ
2. คัดลอก UUID ของ user นั้น
3. รัน SQL นี้ใน SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```

## RLS Summary

| ตาราง | ลูกค้า | Admin |
|---|---|---|
| profiles | อ่าน/แก้ตัวเอง | อ่านทั้งหมด |
| menu_items | อ่านเฉพาะที่ available | full access |
| orders | อ่าน/สร้างตัวเอง | full access |
| order_items | อ่านผ่าน order ตัวเอง | full access |
| order_reviews | อ่านทั้งหมด / เขียนตัวเอง | full access |
| flash_sales | อ่านเฉพาะที่ active | full access |
| store_settings | อ่านทั้งหมด | update |
| notifications | อ่าน/update ตัวเอง | full access |
| ai_chat_sessions | ตัวเอง + anonymous | อ่านทั้งหมด |
| ai_chat_messages | ผ่าน session | อ่านทั้งหมด |
| sales_reports_cache | ❌ | full access |

## หมายเหตุ

- `99_seed.sql` ต้องสร้าง user ผ่าน Supabase Auth ก่อน เพราะ profiles อ้างอิง `auth.users`
- `sales_reports_cache` ควร regenerate ด้วย **Supabase Edge Function** + `pg_cron`
- AI Chat รองรับ anonymous session (user_id = NULL) สำหรับผู้ใช้ที่ยังไม่ login
