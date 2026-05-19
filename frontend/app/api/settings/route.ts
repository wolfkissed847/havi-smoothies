import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { storeInfo, payment, notifications } = data;

    // Read the existing KB file
    const kbPath = path.join(process.cwd(), '..', 'knowledge', 'Havi-Smoothies_kb.txt');
    let kbContent = '';
    try {
      kbContent = fs.readFileSync(kbPath, 'utf-8');
    } catch (e) {
      console.warn('KB file not found, creating a new one.');
    }

    // Format the new store info
    const newStoreInfo = `=== ข้อมูลร้าน ===
เวลาเปิด: ${storeInfo.openTime}-${storeInfo.closeTime} น. ทุกวัน
ที่ตั้ง: ${storeInfo.address}
ติดต่อ: ${storeInfo.phone}
Line OA: ${payment.lineOA}
รับแจ้งเตือนออเดอร์: ${notifications.orderNotif ? 'เปิด' : 'ปิด'}`;

    // Replace the existing section or append it
    const sectionRegex = /=== ข้อมูลร้าน ===[\s\S]*?(?=\n===|$)/;
    if (sectionRegex.test(kbContent)) {
      kbContent = kbContent.replace(sectionRegex, newStoreInfo);
    } else {
      kbContent += '\n\n' + newStoreInfo;
    }

    fs.writeFileSync(kbPath, kbContent.trim() + '\n', 'utf-8');

    return NextResponse.json({ success: true, message: 'Settings saved to file' });
  } catch (error) {
    console.error('Failed to save settings file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}
