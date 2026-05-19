import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { storeInfo, payment, notifications } = data;

    // Create a beautifully formatted markdown file for the RAG Bot
    const markdownContent = `
# Store Knowledge Base (RAG Data)

## Store Information
- **Store Name (EN)**: ${storeInfo.name}
- **Store Name (TH)**: ${storeInfo.nameTh}
- **Address**: ${storeInfo.address}
- **Phone Number**: ${storeInfo.phone}
- **Opening Hours**: ${storeInfo.openTime} - ${storeInfo.closeTime}

## Payment Methods
- **Line OA**: ${payment.lineOA}
- **PromptPay**: ${payment.promptpay}

## Notification Preferences
- **Order Notifications**: ${notifications.orderNotif ? 'Enabled' : 'Disabled'}
- **Email Notifications**: ${notifications.emailNotif ? 'Enabled' : 'Disabled'}
- **Sound Alerts**: ${notifications.soundAlert ? 'Enabled' : 'Disabled'}

*This file is automatically updated via the Admin Settings page.*
`;

    // Save to the public folder so it's easily accessible or can be read by a local ingestion script
    const filePath = path.join(process.cwd(), 'public', 'store_knowledge.md');
    fs.writeFileSync(filePath, markdownContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Settings saved to file' });
  } catch (error) {
    console.error('Failed to save settings file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file' }, { status: 500 });
  }
}
