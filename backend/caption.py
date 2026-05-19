import os
import time
from typing import Dict

from dotenv import load_dotenv
import google.genai as genai

load_dotenv()

MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "models/gemini-2.5-flash")


def initialize_gemini() -> genai.Client:
    """อ่าน Google API key จาก environment variables"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("ไม่พบ GOOGLE_API_KEY ใน .env file")
    return genai.Client(api_key=api_key)


def generate_captions(menu_name: str, price: float) -> Dict[str, str]:
    """
    สร้าง caption 3 แบบสำหรับโพสต์ Instagram ของ Havi-Smoothies โดยใช้ Gemini
    
    Args:
        menu_name: ชื่อเมนู/สินค้า
        price: ราคาสินค้า
    
    Returns:
        Dictionary ที่มี caption 3 แบบ (น่ารัก, มินิมัล, เจน-แซด)
    
    ตัวอย่าง:
        >>> captions = generate_captions("สมูทตี้สตรอเบอร์รี่", 89.00)
        >>> print(captions["น่ารัก"])
    """
    client = initialize_gemini()
    
    prompt = f"""คุณคือผู้เชี่ยวชาญด้านโซเชียลมีเดียที่สร้างสรรค์ สำหรับ Havi-Smoothies 
กรุณาสร้าง caption Instagram 3 แบบต่างๆ สำหรับเมนูใหม่ โดยใช้ภาษาไทยแบบเป็นกันเอง

เมนู: {menu_name}
ราคา: ฿{price:.2f}

กรุณาสร้าง caption ให้ครบ 3 แบบต่างๆ:

1. น่ารัก: ใช้ emoji น่ารัก พูดแบบสนุก เสียงเป็นกันเอง ให้ผู้อ่านรู้สึกว่ากำลังคุยกับเพื่อน
2. มินิมัล: สื่อสารสิ่งสำคัญอย่างคลาดเคลื่อน ไม่มากจนเกินไป สดใจและหรูหรา
3. เจน-แซด: ใช้ภาษาสมัยใหม่ ลีลาไว้ใจเพื่อน ใช้สำนวนที่เด็กสมัยนี้ชอบ สนุกสนาน

ตอบให้เฉพาะเจาะจงตามรูปแบบนี้ (ไม่ต้องเพิ่มข้อความอื่น):
น่ารัก: [ข้อความ]
มินิมัล: [ข้อความ]
เจน-แซด: [ข้อความ]"""

    response = generate_with_retry(client, MODEL_NAME, prompt)
    response_text = response.text
    
    # แยกข้อมูล response เป็น caption แต่ละแบบ
    captions = parse_captions(response_text)
    return captions


def generate_with_retry(client: genai.Client, model_name: str, prompt: str, attempts: int = 3):
    """เรียก Gemini พร้อม retry สำหรับ error ชั่วคราวอย่าง 503"""
    delay_seconds = 1

    for attempt in range(attempts):
        try:
            return client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(delay_seconds)
            delay_seconds *= 2


def parse_captions(response_text: str) -> Dict[str, str]:
    """
    แยกเนื้อหาจาก response ของ Gemini เพื่อได้ caption แต่ละแบบ
    
    Args:
        response_text: ข้อความตอบกลับจาก Gemini API
    
    Returns:
        Dictionary พร้อม keys: น่ารัก, มินิมัล, เจน-แซด
    """
    lines = response_text.strip().split("\n")
    captions = {"น่ารัก": "", "มินิมัล": "", "เจน-แซด": ""}
    
    for line in lines:
        if line.startswith("น่ารัก:"):
            captions["น่ารัก"] = line.replace("น่ารัก:", "").strip()
        elif line.startswith("มินิมัล:"):
            captions["มินิมัล"] = line.replace("มินิมัล:", "").strip()
        elif line.startswith("เจน-แซด:"):
            captions["เจน-แซด"] = line.replace("เจน-แซด:", "").strip()
    
    return captions


def build_fallback_captions(menu_name: str, price: float) -> Dict[str, str]:
    """สร้าง caption สำรองแบบไทยเมื่อเรียก Gemini ไม่สำเร็จ"""
    return {
        "น่ารัก": f"{menu_name} มาแล้วว ✨ ราคา {price:.0f} บาท สดชื่นน่ารักสุดๆ ลองเลยน้าา 🍓💛",
        "มินิมัล": f"{menu_name} ราคา {price:.0f} บาท สดชื่น เรียบง่าย ลงตัว",
        "เจน-แซด": f"{menu_name} ของดีจริง ราคา {price:.0f} บาท ฟีลดีมากกก มาโดนได้เลย 😎",
    }


def display_captions(menu_name: str, price: float, captions: Dict[str, str]) -> None:
    """แสดงผล caption ในรูปแบบที่อ่านง่าย"""
    print(f"\n{'='*60}")
    print(f"📱 Caption Generator สำหรับ Instagram - Havi-Smoothies Cafe")
    print(f"{'='*60}")
    print(f"\n🍹 เมนู: {menu_name}")
    print(f"💰 ราคา: ฿{price:.2f}\n")
    
    print("แบบน่ารักๆ:")
    print(f"  {captions['น่ารัก']}\n")
    
    print("แบบมินิมัลมินิใจ:")
    print(f"  {captions['มินิมัล']}\n")
    
    print("แบบGen-Z:")
    print(f"  {captions['เจน-แซด']}\n")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    # ตัวอย่างการใช้งาน
    menu_item = "สมูตตี้มิกซ์เบอร์รี่"
    menu_price = 299.00
    
    try:
        captions = generate_captions(menu_item, menu_price)
        display_captions(menu_item, menu_price, captions)
    except ValueError as e:
        print(f"❌ ข้อผิดพลาด: {e}")
    except Exception as e:
        print(f"⚠️ Gemini ใช้งานไม่ได้ตอนนี้: {e}")
        print("ℹ️ ใช้ caption สำรองแบบออฟไลน์แทน")
        captions = build_fallback_captions(menu_item, menu_price)
        display_captions(menu_item, menu_price, captions)
