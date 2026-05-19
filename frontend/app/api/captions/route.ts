import { NextResponse } from 'next/server';

const apiKey = process.env.GITHUB_MODEL_API_KEY || '';
const GITHUB_MODELS_ENDPOINT = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL_NAME = 'gpt-4o-mini';

export async function POST(request: Request) {
  try {
    const { name, price } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Menu name and price are required.' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('Error: GITHUB_MODEL_API_KEY is not defined in environments.');
      return NextResponse.json(
        { error: 'GitHub Models API key (GITHUB_MODEL_API_KEY) is not configured.' },
        { status: 500 }
      );
    }

    const prompt = `คุณคือผู้เชี่ยวชาญด้านโซเชียลมีเดียและความคิดสร้างสรรค์ สำหรับแบรนด์ Havi-Smoothies ร้านขายสมูทตี้ผักผลไม้สดและน้ำผักผลไม้สกัดเพื่อสุขภาพระดับพรีเมียม
กรุณาสร้าง caption สำหรับโพสต์ Instagram 3 สไตล์สำหรับเมนูใหม่ โดยเขียนบรรยายให้มีสไตล์สดชื่น ดีต่อสุขภาพ อัดแน่นไปด้วยวิตามินธรรมชาติจากผักผลไม้สด อร่อยดื่มง่าย และมีสไตล์ที่เป็นกันเอง

ข้อมูลเครื่องดื่ม:
เมนู: ${name}
ราคา: ฿${price} บาท

กรุณาสร้างแคปชั่นให้มีเนื้อหาที่โฟกัสความเป็น "ร้านผักผลไม้สมูทตี้เพื่อสุขภาพ" ดึงดูดสายรักสุขภาพและสายฟิตแอนด์เฟิร์ม ดังนี้:
1. น่ารัก (Cute & Healthy): โทนเสียงน่ารัก สดใส ใช้ emoji ผักผลไม้เยอะๆ พูดจาเป็นกันเองชวนคุย เหมือนเพื่อนบอกต่อเคล็ดลับผิวใส ดีท็อกซ์ร่างกาย เติมพลังวิตามิน
2. มินิมัล (Minimal & Clean): คลีนๆ เรียบหรู ชิคๆ ใช้ข้อความสั้นกระชับแต่ทรงพลัง โฟกัสความบริสุทธิ์ของธรรมชาติแท้ 100% (No sugar added) และความเรียบง่ายที่มีสไตล์ดีต่อใจ
3. เจน-แซด (Gen-Z & Trendy): ใช้ภาษาวัยรุ่นสุดอินเทรนด์ มีศัพท์แสลงสนุกสนาน ลีลากวนๆ เน้นฟีลดีท็อกซ์กู้หุ่นแบบจึ้งๆ อร่อยแบบตะโกน ดื่มแล้วเฟรชตัวมารดาสุดๆ

ตอบกลับเฉพาะรูปแบบ JSON เปล่าๆ เท่านั้น ห้ามเขียนคำเกริ่นนำหรือปิดท้ายใดๆ (และห้ามใช้ markdown block ครอบ):
{
  "cute": "แคปชั่นสไตล์รักสุขภาพสุดน่ารักสดใสอัดแน่นด้วยวิตามินและดีท็อกซ์",
  "minimal": "แคปชั่นสมูทตี้สไตล์คลีนมินิมัลเรียบหรูสั้นกระชับเน้นผักผลไม้ธรรมชาติ",
  "genz": "แคปชั่นสุดจึ้งสไตล์เจนแซดเน้นกู้ผิวดีท็อกซ์หุ่นอร่อยฟินแบบตัวมารดา"
}`;

    const response = await fetch(GITHUB_MODELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant that only outputs JSON focused on organic healthy drinks and smoothies.' },
          { role: 'user', content: prompt }
        ],
        model: MODEL_NAME,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub Models Endpoint returned error code ${response.status}: ${errorText}`);
      throw new Error(`GitHub Models API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content || '{}';

    // Clean and parse JSON safely
    let captions = { cute: '', minimal: '', genz: '' };
    try {
      const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      captions = JSON.parse(cleanText);
    } catch (e) {
      console.error('Failed to parse caption JSON response:', responseText, e);
      // Fallback extraction regex
      const cuteMatch = responseText.match(/"cute"\s*:\s*"([^"]+)"/);
      const minimalMatch = responseText.match(/"minimal"\s*:\s*"([^"]+)"/);
      const genzMatch = responseText.match(/"genz"\s*:\s*"([^"]+)"/);

      captions.cute = cuteMatch ? cuteMatch[1] : '';
      captions.minimal = minimalMatch ? minimalMatch[1] : '';
      captions.genz = genzMatch ? genzMatch[1] : '';
    }

    return NextResponse.json({
      cute: captions.cute || `เติมวิตามินให้ผิวใสกับเมนู ${name} ผักผลไม้สดปั่น 100% ดื่มแล้วสดชื่นนน ดีท็อกซ์ร่างกายได้ดีสุดๆ ดีต่อใจและสุขภาพในราคาเพียง ฿${price} เท่านั้นนะค้าบ! 🍓🍊🥬✨`,
      minimal: captions.minimal || `${name} | ฿${price}. 100% natural, clean & cold-pressed goodness. No added sugar.`,
      genz: captions.genz || `${name} ตัวแม่ดีท็อกซ์กู้ผิวฉ่ำ อร่อยฟินวิตามินแบบตะโกน ในราคา ฿${price} อร่อยคลีนแบบตัวมารดา รีบมาเติมความจึ้งด่วนตัวเธอ! 💅🥬🔥`
    });

  } catch (error: any) {
    console.error('Error generating captions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate captions.' },
      { status: 500 }
    );
  }
}
