from typing import List, Union

# function to calculate average of a list of numbers
def calculate_average(numbers: List[Union[int, float]]) -> Union[int, float]:
    """
    คำนวณค่าเฉลี่ยของตัวเลขในรายการ
    
    Args:
        numbers: รายการของตัวเลข (int หรือ float)
    
    Returns:
        ค่าเฉลี่ยของตัวเลขทั้งหมด หรือ 0 ถ้ารายการว่าง
    
    Examples:
        >>> calculate_average([10, 20, 30])
        20.0
        >>> calculate_average([])
        0
    """
    if len(numbers) == 0:
        return 0
    total = sum(numbers)
    average = total / len(numbers)
    return average