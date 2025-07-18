import os
import sys
import pandas as pd

# طباعة معلومات النظام
print("المسار الحالي:", os.getcwd())
print("مسار Python:", sys.executable)
print("قائمة الملفات في المجلد الحالي:", os.listdir())

# محاولة قراءة الملف من مسارات مختلفة
possible_paths = [
    "disease_symptoms.csv",
    os.path.join(os.getcwd(), "disease_symptoms.csv"),
    r"C:\Users\omara\Desktop\bakker1\disease_symptoms.csv",
    r"C:\Users\omara\OneDrive\Desktop\bakker1\disease_symptoms.csv",
    r"C:\Users\omara\Downloads\disease_symptoms.csv",
    r"C:\Users\omara\Downloads\bakker144-main\disease_symptoms.csv",
    r"C:\Users\omara\Downloads\bakker144-main\bakker1-main\disease_symptoms.csv"
]

for path in possible_paths:
    print(f"\nمحاولة الوصول إلى: {path}")
    print(f"هل الملف موجود: {os.path.exists(path)}")
    
    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            print("✓ تم قراءة الملف بنجاح!")
            print(f"أبعاد الملف: {df.shape}")
            print(f"أول 5 أعمدة: {list(df.columns)[:5]}")
            print("هذا هو المسار الصحيح الذي يجب استخدامه.")
        except Exception as e:
            print(f"✗ فشل قراءة الملف: {e}")

print("\nاقتراحات لحل المشكلة:")
print("1. انسخ الملف مباشرة إلى المجلد الحالي.")
print("2. استخدم المسار الكامل في الكود.")
print("3. تأكد من أن اسم الملف والامتداد صحيحان تماماً.")