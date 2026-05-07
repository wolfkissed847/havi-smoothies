#!/usr/bin/env python3
import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sheets_client import get_sheet
from collections import defaultdict

# โหลด env variables
load_dotenv()

def get_yesterday_sales():
    """อ่านข้อมูลการขายเมื่อวาน"""
    try:
        sheet = get_sheet()
        rows = sheet.get_all_values()
        
        if not rows or len(rows) < 2:
            return None, "ไม่พบข้อมูลการขายในระบบ 📊"
        
        # Skip header row
        headers = rows[0]
        data_rows = rows[1:]
        
        # หาเมื่อวาน
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        sales_data = []
        for row in data_rows:
            if row and len(row) >= 5:
                timestamp = row[0]
                if timestamp.startswith(yesterday):
                    try:
                        menu = row[1]
                        quantity = int(row[2])
                        price = float(row[3])
                        total = float(row[4])
                        sales_data.append({
                            'menu': menu,
                            'quantity': quantity,
                            'price': price,
                            'total': total
                        })
                    except (ValueError, IndexError):
                        continue
        
        return sales_data if sales_data else None, yesterday
    
    except Exception as e:
        print(f"❌ ข้อผิดพลาด: {e}")
        return None, str(e)

def generate_report(sales_data, yesterday):
    """สร้างรายงานสรุปยอดขาย"""
    if not sales_data:
        return "😴 ออฟฟาฟ! เมื่อวานไม่มียอดขายเลย (หรือเป็นวันหยุด?) 🏖️"
    
    # คำนวณยอดรวม
    total_revenue = sum(s['total'] for s in sales_data)
    total_items = sum(s['quantity'] for s in sales_data)
    
    # หาเมนูที่ขายดีสุด
    menu_stats = defaultdict(lambda: {'quantity': 0, 'revenue': 0})
    for sale in sales_data:
        menu_stats[sale['menu']]['quantity'] += sale['quantity']
        menu_stats[sale['menu']]['revenue'] += sale['total']
    
    best_menu = max(menu_stats.items(), key=lambda x: x[1]['revenue'])
    best_menu_name = best_menu[0]
    best_menu_qty = best_menu[1]['quantity']
    best_menu_rev = best_menu[1]['revenue']
    
    # สร้างรายงาน
    report = f"""
🌅 รายงานเช้า {yesterday}

📊 สรุปยอดขายเมื่อวาน:
  └─ ยอดขายรวม: ฿{total_revenue:.2f} ✨
  └─ จำนวนรายการขาย: {total_items} ชิ้น 🛒
  
🏆 เมนูที่ขายดีสุด:
  └─ {best_menu_name} 
  └─ ขาดทั้งหมด {best_menu_qty} ชิ้น
  └─ รายได้: ฿{best_menu_rev:.2f} 💰

📈 รายละเอียดเมนู:
"""
    
    for menu, stats in sorted(menu_stats.items(), key=lambda x: x[1]['revenue'], reverse=True):
        report += f"  • {menu}: {stats['quantity']} ชิ้น (฿{stats['revenue']:.2f})\n"
    
    report += "\n💪 วันนี้ก็ขายดีนะ ไปต่อเลยจ้าา! 🚀"
    
    return report

def send_telegram(message):
    """ส่งข้อความไป Telegram"""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not token or not chat_id:
        print("❌ ไม่พบ TELEGRAM_BOT_TOKEN หรือ TELEGRAM_CHAT_ID")
        return False
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("✅ ส่ง Telegram สำเร็จ!")
            return True
        else:
            print(f"❌ ข้อผิดพลาด Telegram: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ข้อผิดพลาด: {e}")
        return False

if __name__ == "__main__":
    print("📋 กำลังสร้างรายงานเช้า...")
    
    sales_data, yesterday = get_yesterday_sales()
    report = generate_report(sales_data, yesterday)
    
    print(report)
    print("\n📤 กำลังส่ง Telegram...")
    send_telegram(report)
