import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import fs from 'fs';
import path from 'path';

// GitHub Models Configuration
const apiKey = process.env.GITHUB_MODEL_API_KEY || '';
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL_NAME = 'gpt-4o-mini'; // Lightweight, fast and highly accurate model on GitHub Models

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GitHub Models API key (GITHUB_MODEL_API_KEY) is not configured.' },
        { status: 500 }
      );
    }

    // 1. Fetch live menu items from Supabase
    const { data: dbItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*');

    if (menuError) {
      console.error('Failed to fetch menu items for RAG:', menuError);
    }

    // Format menu items context
    const menuContext = dbItems
      ? dbItems
          .map(
            (item) =>
              `- ${item.emoji} ${item.name} (${item.name_en}): ราคา ${item.price} บาท, หมวดหมู่: ${
                item.category
              }, สถานะ: ${item.is_available ? 'พร้อมขาย' : 'หมด/ปิดชั่วคราว'}`
          )
          .join('\n')
      : 'ไม่มีข้อมูลเมนูในขณะนี้';

    // 2. Read the main store knowledge base file
    const kbPath = path.join(process.cwd(), '..', 'knowledge', 'Havi-Smoothies_kb.txt');
    let kbContent = '';
    try {
      kbContent = fs.readFileSync(kbPath, 'utf-8');
    } catch (e) {
      console.error('Failed to read Havi-Smoothies_kb.txt:', e);
      kbContent = 'ไม่มีข้อมูลร้านค้าทั่วไป';
    }

    // 3. Prepare System Prompt for GPT
    const systemPrompt = `
คุณคือ "Havi" (ฮาวี่) ผู้ช่วย AI แสนดี น่ารัก และเป็นกันเองของร้านน้ำผลไม้ปั่น "Havi Smoothies"
ทำหน้าที่ตอบคำถามลูกค้าเกี่ยวกับร้านค้าและช่วยเหลือในการสั่งซื้อสินค้าอย่างสุภาพและตลกขบขัน

กฎเหล็กในการตอบคำถาม:
1. ตอบคำถามลูกค้าโดยใช้ข้อมูลที่เราให้ด้านล่างเท่านั้น ห้ามมโนหรือแต่งข้อมูลส่วนผสม ราคา หรือเวลาทำงานขึ้นมาเองเด็ดขาด
2. หากไม่พบคำตอบในข้อมูล ให้บอกอย่างสุภาพว่าไม่ทราบและแจ้งช่องทางติดต่อร้าน
3. หากลูกค้าถามราคาหรือสถานะสินค้า ให้ยึดข้อมูล "เมนูสดจากฐานข้อมูล" เป็นหลัก เพราะราคาและสถานะจะอัปเดตแบบ Real-time
4. ตอบทั้งภาษาไทยและภาษาอังกฤษตามที่ลูกค้าทักมา

--- ข้อมูลร้านค้าทั่วไป (จากคู่มือ) ---
${kbContent}

--- เมนูสดจากฐานข้อมูล (Real-time Menu) ---
${menuContext}
`;

    // 4. Map client messages to standard OpenAI format
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    // 5. Send completion request to GitHub Models API
    const response = await fetch(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: MODEL_NAME,
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || '';

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Error in AI Chat API route (GitHub Models):', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during chat.' },
      { status: 500 }
    );
  }
}
