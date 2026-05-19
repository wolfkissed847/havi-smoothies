#!/usr/bin/env python3
import os
import requests
import re
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
# from sheets_client import get_sheet (Deprecated - Now using Supabase directly)
from collections import defaultdict

# โหลด env variables
load_dotenv()

# แผนผังอีโมจิผักและผลไม้ตามชื่อเมนู
MENU_EMOJIS = {
    'มะม่วง': '🥭',
    'สตรอว์เบอร์รี่': '🍓',
    'แตงโม': '🍉',
    'คะน้า': '🥬',
    'แครอท': '🥕',
    'กล้วยหอม': '🍌',
    'เสาวรส': '🍊',
    'ฝรั่ง': '🍈',
    'แก้วมังกร': '🐉',
    'อะโวคาโด': '🥑',
    
    # สำหรับภาษาอังกฤษ (รองรับเผื่อไว้)
    'mango': '🥭',
    'strawberry': '🍓',
    'watermelon': '🍉',
    'kale': '🥬',
    'carrot': '🥕',
    'banana': '🍌',
    'passion': '🍊',
    'guava': '🍈',
    'dragon': '🐉',
    'avocado': '🥑',
}

def get_menu_emoji(menu_name, db_emojis=None):
    """ค้นหาและระบุอีโมจิที่ถูกต้องตามคำสำคัญในชื่อเมนูแบบยืดหยุ่น"""
    if not menu_name:
        return '🍹'
    name_lower = menu_name.lower().strip()
    
    # 1. เช็คหาในฐานข้อมูล Supabase ก่อน
    if db_emojis:
        if name_lower in db_emojis:
            return db_emojis[name_lower]
        for key, emoji in db_emojis.items():
            if key in name_lower or name_lower in key:
                return emoji
                
    # 2. เช็คหาจาก fallback ทั่วไป
    for key, emoji in MENU_EMOJIS.items():
        if key in name_lower:
            return emoji
            
    return '🍹'

def get_sales(period="yesterday"):
    """อ่านข้อมูลการขายของช่วงเวลาที่ระบุและดึงข้อมูลเมนู/อีโมจิแบบเรียลไทม์จาก Supabase"""
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise RuntimeError("ไม่พบ SUPABASE_URL หรือ SUPABASE_ANON_KEY ใน environment")
            
        # 1. ล็อกอินเข้าใช้งานด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อรับ JWT Token ในการผ่านนโยบายความปลอดภัย RLS
        auth_url = f"{url}/auth/v1/token?grant_type=password"
        auth_payload = {
            "email": "admin@gmail.com",
            "password": "admin123"
        }
        auth_headers = {
            "apikey": key,
            "Content-Type": "application/json"
        }
        
        auth_response = requests.post(auth_url, json=auth_payload, headers=auth_headers)
        if auth_response.status_code != 200:
            raise RuntimeError(f"ไม่สามารถตรวจสอบสิทธิ์ผู้ดูแลระบบได้: {auth_response.text}")
            
        access_token = auth_response.json().get("access_token")
        
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # 2. ดึงข้อมูลเมนูและอีโมจิทั้งหมดจากตาราง menu_items ในฐานข้อมูล Supabase แบบไดนามิก
        menu_items_url = f"{url}/rest/v1/menu_items?select=name,name_en,emoji"
        menu_res = requests.get(menu_items_url, headers=headers)
        
        db_emojis = {}
        if menu_res.status_code == 200:
            for item in menu_res.json():
                name_th = item.get("name")
                name_en = item.get("name_en")
                emoji = item.get("emoji")
                
                if name_th and emoji:
                    db_emojis[name_th.strip().lower()] = emoji
                if name_en and emoji:
                    db_emojis[name_en.strip().lower()] = emoji
        else:
            print(f"⚠️ ไม่สามารถดึงข้อมูลเมนูได้ ({menu_res.status_code}): {menu_res.text}")
            
        # 3. คำนวณวันและเวลาไทย (GMT+7) ตามคาบเวลาที่ระบุ
        tz_offset = timedelta(hours=7)
        now_local = datetime.now(timezone.utc) + tz_offset
        
        if period == "today":
            start_date = now_local
            end_date = now_local
            date_label = now_local.strftime("%Y-%m-%d")
        elif period == "yesterday":
            yesterday_local = now_local - timedelta(days=1)
            start_date = yesterday_local
            end_date = yesterday_local
            date_label = yesterday_local.strftime("%Y-%m-%d")
        elif period == "week":
            start_date = now_local - timedelta(days=6)
            end_date = now_local
            date_label = f"{start_date.strftime('%Y-%m-%d')} ถึง {end_date.strftime('%Y-%m-%d')}"
        elif period == "month":
            start_date = now_local - timedelta(days=29)
            end_date = now_local
            date_label = f"{start_date.strftime('%Y-%m-%d')} ถึง {end_date.strftime('%Y-%m-%d')}"
        else:
            raise ValueError(f"ช่วงเวลาที่ไม่สนับสนุน: {period}")
            
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        
        # แปลงเวลา 00:00:00 - 23:59:59 ไทย ของช่วงนั้น เป็น UTC ISO string เพื่อใช้ดึงข้อมูลในดาต้าเบส
        start_dt_local = datetime.strptime(f"{start_date_str} 00:00:00", "%Y-%m-%d %H:%M:%S")
        end_dt_local = datetime.strptime(f"{end_date_str} 23:59:59", "%Y-%m-%d %H:%M:%S")
        
        start_utc = (start_dt_local - tz_offset).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        end_utc = (end_dt_local - tz_offset).strftime("%Y-%m-%dT%H:%M:%S.999Z")
        
        # ดึงออเดอร์ทั้งหมดในช่วงเวลาของช่วงนั้น ที่ไม่ใช่สถานะ cancelled
        query_url = f"{url}/rest/v1/orders?created_at=gte.{start_utc}&created_at=lte.{end_utc}&status=neq.cancelled&select=*,order_items(*)"
        
        response = requests.get(query_url, headers=headers)
        if response.status_code != 200:
            raise RuntimeError(f"Supabase API error ({response.status_code}): {response.text}")
            
        orders = response.json()
        
        # 4. คำนวณยอดขายรวมตรงจาก Order Headers (เหมือนกับแดชบอร์ด)
        total_revenue = sum(float(order.get("total", 0)) for order in orders)
        total_orders = len(orders)
        
        sales_data = []
        for order in orders:
            items = order.get("order_items", [])
            for item in items:
                try:
                    menu = item.get("name_snapshot")
                    quantity = int(item.get("quantity", 0))
                    price = float(item.get("unit_price", 0))
                    total = float(item.get("subtotal", 0))
                    
                    if menu and quantity > 0:
                        sales_data.append({
                            'menu': menu,
                            'quantity': quantity,
                            'price': price,
                            'total': total
                        })
                except (ValueError, TypeError, IndexError):
                    continue
                    
        return sales_data if sales_data else None, date_label, total_revenue, total_orders, db_emojis
        
    except Exception as e:
        print(f"❌ ข้อผิดพลาดในการดึงข้อมูลจาก Supabase: {e}")
        return None, str(e), 0, 0, {}

def generate_report(sales_data, date_label, total_revenue, total_orders, db_emojis=None, period="yesterday"):
    """สร้างรายงานสรุปยอดขายตามช่วงเวลา"""
    if period == "today":
        day_text = "วันนี้"
        header_text = f"✨ รายงานยอดขายวันนี้ {date_label}"
        footer_text = "💪 วันนี้ลุยกันต่อยอดขายพุ่งกระฉูด! 🚀"
    elif period == "yesterday":
        day_text = "เมื่อวาน"
        header_text = f"🌅 รายงานเช้า {date_label}"
        footer_text = "💪 วันนี้ลุยกันต่อยอดขายพุ่งกระฉูด! 🚀"
    elif period == "week":
        day_text = "รอบสัปดาห์นี้ (7 วันล่าสุด)"
        header_text = f"📅 รายงานสรุปยอดขายประจำสัปดาห์\n🗓️ {date_label}"
        footer_text = "🌟 สัปดาห์นี้ยอดขายสุดปัง ลุยกันต่อเลยครับ! 🚀"
    elif period == "month":
        day_text = "รอบเดือนนี้ (30 วันล่าสุด)"
        header_text = f"📊 รายงานสรุปยอดขายประจำเดือน\n🗓️ {date_label}"
        footer_text = "🏆 ยอดขายเดือนนี้พุ่งทะลุเป้าสุดยอดมากครับ! 🚀"
    else:
        day_text = "ช่วงเวลาที่เลือก"
        header_text = f"📋 รายงานยอดขาย {date_label}"
        footer_text = "💪 ลุยกันต่อไปยอดพุ่งกระฉูด! 🚀"
        
    if not sales_data and total_revenue == 0:
        return f"😴 ออฟฟาฟ! {day_text}ไม่มียอดขายเลย (หรือเป็นวันหยุด?) 🏖️"
    
    # ฟังก์ชันสำหรับล้างชื่อเมนู (ลบ emoji นำหน้าและ whitespace ออกเพื่อให้สามารถจัดกลุ่มได้ถูกต้อง)
    def clean_menu_name(name):
        if not name:
            return ""
        name = re.sub(r'^[^\u0e00-\u0e7fa-zA-Z0-9]+', '', name)
        return name.strip()
    
    # หาเมนูที่ขายดีสุดและการจัดกลุ่มข้อมูลเมนู
    menu_stats = defaultdict(lambda: {'quantity': 0, 'revenue': 0})
    total_items = 0
    
    if sales_data:
        for sale in sales_data:
            cleaned_name = clean_menu_name(sale['menu'])
            if cleaned_name:
                menu_stats[cleaned_name]['quantity'] += sale['quantity']
                menu_stats[cleaned_name]['revenue'] += sale['total']
                total_items += sale['quantity']
    
    best_menu_text = "ไม่มีข้อมูลสินค้าย่อย"
    if menu_stats:
        best_menu = max(menu_stats.items(), key=lambda x: x[1]['revenue'])
        best_menu_name = best_menu[0]
        best_menu_qty = best_menu[1]['quantity']
        best_menu_rev = best_menu[1]['revenue']
        best_emoji = get_menu_emoji(best_menu_name, db_emojis)
        best_menu_text = f"{best_emoji} {best_menu_name}\n  └─ ขายได้ทั้งหมด {best_menu_qty} ชิ้น\n  └─ รายได้: ฿{best_menu_rev:.2f} 💰"
    
    # สร้างรายงาน
    report = f"""
{header_text}

📊 สรุปยอดขาย{day_text}:
  └─ ยอดขายรวม: ฿{total_revenue:.2f} ✨
  └─ จำนวนรายการขาย: {total_items} ชิ้น ({total_orders} ออเดอร์) 🛒
  
🏆 เมนูที่ขายดีสุด:
  └─ {best_menu_text}

📈 รายละเอียดเมนู:
"""
    
    if menu_stats:
        for menu, stats in sorted(menu_stats.items(), key=lambda x: x[1]['revenue'], reverse=True):
            emoji = get_menu_emoji(menu, db_emojis)
            report += f"  • {emoji} {menu}: {stats['quantity']} ชิ้น (฿{stats['revenue']:.2f})\n"
    else:
        report += "  • ไม่มีรายละเอียดรายการสินค้าในออเดอร์\n"
        
    report += f"\n{footer_text}"
    
    return report

def send_telegram(message):
    """ส่งข้อความไป Telegram พร้อมระบบ Retry ในกรณีเครือข่ายหลุด"""
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
    
    # กำหนด Headers เพื่อเพิ่มความเสถียรของการเชื่อมต่อและบอก Server ให้ปิด Socket หลังเสร็จสิ้น
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HaviSmoothiesReportBot/1.0",
        "Connection": "close"
    }
    
    import time
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # ส่ง API พร้อมตั้งค่า Timeout 15 วินาที
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                print("✅ ส่ง Telegram สำเร็จ!")
                return True
            else:
                print(f"❌ ข้อผิดพลาด Telegram (Attempt {attempt+1}/{max_retries}): {response.text}")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            print(f"⚠️ การเชื่อมต่อ Telegram มีปัญหา (Attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # รอ 2 วินาทีก่อนลองใหม่
            else:
                print("❌ การเชื่อมต่อล้มเหลวครบตามจำนวนครั้งที่กำหนด")
        except Exception as e:
            print(f"❌ ข้อผิดพลาดอื่นๆ: {e}")
            return False
            
    return False

if __name__ == "__main__":
    import sys
    
    # เช็ค Arguments
    period = "yesterday"
    
    for arg in sys.argv[1:]:
        if arg == "--today":
            period = "today"
        elif arg == "--week":
            period = "week"
        elif arg == "--month":
            period = "month"
            
    print(f"📋 กำลังสร้างรายงานยอดขายสำหรับ: {period}...")
    
    # ดึงข้อมูลยอดขายจริงจากฐานข้อมูล Supabase แบบเรียลไทม์
    sales_data, date_label, total_revenue, total_orders, db_emojis = get_sales(period)
        
    report = generate_report(sales_data, date_label, total_revenue, total_orders, db_emojis, period)
    
    print(report)
    print("\n📤 กำลังส่ง Telegram...")
    send_telegram(report)
