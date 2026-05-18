-- ============================================================
-- 09_rag_vector.sql
-- Havi-Smoothies × Supabase — pgvector & RAG Vector Search
-- สำหรับเก็บคลังความรู้ (Knowledge Base) และรัน Vector Similarity Search
-- ============================================================

-- 1. เปิดใช้งาน Extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. สร้างตารางเก็บข้อความและเวกเตอร์ 384 มิติ (ตามโมเดล MiniLM-L12-v2)
CREATE TABLE IF NOT EXISTS havi_knowledge_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT NOT NULL,                       -- ท่อนข้อความคำอธิบายร้าน/เมนู
  embedding   VECTOR(384) NOT NULL,                -- เวกเตอร์ของข้อความ
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. สร้างดัชนี HNSW (Hierarchical Navigable Small World) เพื่อเพิ่มความเร็วในการสืบค้นเวกเตอร์ (Cosine Distance)
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_hnsw 
  ON havi_knowledge_embeddings USING hnsw (embedding vector_cosine_ops);

-- 4. ตั้งค่าความปลอดภัย RLS (Row Level Security)
ALTER TABLE havi_knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- ลูกค้าทั่วไปและระบบภายนอกสามารถอ่าน (Select) คลังความรู้ได้
CREATE POLICY "knowledge: public read all"
  ON havi_knowledge_embeddings FOR SELECT
  USING (TRUE);

-- เฉพาะ Admin เท่านั้นที่สามารถ เพิ่ม/แก้ไข/ลบ ข้อมูลคลังความรู้เวกเตอร์ได้
CREATE POLICY "knowledge: admin full access"
  ON havi_knowledge_embeddings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. สร้างฟังก์ชันสำหรับการสืบค้นเวกเตอร์ (Remote Procedure Call - RPC)
-- ฟังก์ชันนี้จะรับเวกเตอร์คำถามของลูกค้าเข้ามา แล้วคำนวณหาข้อความที่มีความคล้ายคลึงมากที่สุด
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding VECTOR(384),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    havi_knowledge_embeddings.id,
    havi_knowledge_embeddings.content,
    1 - (havi_knowledge_embeddings.embedding <=> query_embedding) AS similarity
  FROM havi_knowledge_embeddings
  WHERE 1 - (havi_knowledge_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
