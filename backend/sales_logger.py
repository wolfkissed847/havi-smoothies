#!/usr/bin/env python3
import sys
from datetime import datetime
from dotenv import load_dotenv
from sheets_client import get_sheet

# โหลด env variables จาก .env
load_dotenv()

def parse_sales_data(sales_input):
    """
    แปลงข้อมูลขายจากรูปแบบ menu:quantity:price
    คืนค่า: (menu, quantity, price, total)
    """
    try:
        parts = sales_input.split(':')
        if len(parts) != 3:
            raise ValueError("รูปแบบไม่ถูกต้อง ใช้: menu:quantity:price")
        
        menu = parts[0].strip()
        quantity = int(parts[1].strip())
        price = float(parts[2].strip())
        total = quantity * price
        
        return menu, quantity, price, total
    except ValueError as e:
        print(f"❌ ข้อผิดพลาด: {e}")
        return None

def log_sales(sales_input):
    """บันทึกยอดขายลง Google Sheets"""
    result = parse_sales_data(sales_input)
    if not result:
        sys.exit(1)
    
    menu, quantity, price, total = result
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    try:
        sheet = get_sheet()
        sheet.append_row([timestamp, menu, quantity, price, total])
        print(f"✅ บันทึกสำเร็จ: {menu} x{quantity} @ {price} = {total:.2f}")
    except Exception as e:
        print(f"❌ ข้อผิดพลาด: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("📝 ใช้: python sales_logger.py 'menu:quantity:price'")
        print("📝 ตัวอย่าง: python sales_logger.py 'สมูทตี้แอปเปิ้ล:2:89.50'")
        sys.exit(1)
    
    log_sales(sys.argv[1])
