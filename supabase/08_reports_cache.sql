-- ============================================================
-- 08_reports_cache.sql
-- Havi-Smoothies × Supabase — Sales Reports Cache
-- หน้าจอ: แดชบอร์ดแอดมิน, รายงาน
-- หมายเหตุ: regenerate ด้วย Supabase Edge Function + pg_cron
-- ============================================================

CREATE TABLE sales_reports_cache (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date    TIMESTAMP      NOT NULL,
  period         report_period  NOT NULL,
  total_sales    DECIMAL(12,2)  NOT NULL,
  total_orders   INT            NOT NULL,
  avg_per_order  DECIMAL(8,2),
  fruit_sales    DECIMAL(12,2),
  veg_sales      DECIMAL(12,2),
  -- [{ "hour": 9, "sales": 350.00, "orders": 5 }, ...]
  hourly_data    JSONB,
  -- [{ "menu_item_id": "uuid", "name": "Mango Madness", "cups": 42 }, ...]
  top_sellers    JSONB,
  growth_rate    DECIMAL(5,2),
  created_at     TIMESTAMP      DEFAULT NOW(),

  UNIQUE (report_date, period)
);

CREATE INDEX idx_report_date   ON sales_reports_cache (report_date);
CREATE INDEX idx_report_period ON sales_reports_cache (period);

ALTER TABLE sales_reports_cache ENABLE ROW LEVEL SECURITY;

-- Admin อ่าน/เขียนได้เท่านั้น
CREATE POLICY "reports_cache: admin full access"
  ON sales_reports_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
