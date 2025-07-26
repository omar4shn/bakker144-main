import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # تطبيق CORS مرة واحدة فقط

# Initialize global variables
model = None
vectorizer = None
all_symptoms = None

def setup():
    global model, vectorizer, all_symptoms
    
    try:
        df = pd.read_csv(r"C:\Users\omara\Downloads\bakker144-main\bakker1-main\disease_symptoms.csv", encoding='latin1')
        
        all_symptoms_set, texts, diseases = set(), [], []
        for _, row in df.iterrows():
            symp = [s.strip().lower() for i in range(1, 18) 
                    if f'Symptom_{i}' in df.columns 
                    and pd.notna(row.get(f'Symptom_{i}', "")) 
                    and (s := str(row[f'Symptom_{i}'])) 
                    and s.strip().lower() != 'nan']
            if symp:
                all_symptoms_set.update(symp)
                texts.append(' '.join(symp))
                diseases.append(row['Disease'].strip().lower())
        
        all_symptoms = list(all_symptoms_set)
        vectorizer = CountVectorizer()
        model = RandomForestClassifier(n_estimators=100).fit(vectorizer.fit_transform(texts), diseases)
        print(f"تم تحميل {len(all_symptoms)} عرض و {len(diseases)} مرض")
        return True
    except Exception as e:
        print(f"Setup error: {e}")
        return False

# إضافة مسار الجذر للاختبار
@app.route('/', methods=['GET'])
def root():
    return jsonify({"status": "running", "message": "خادم التشخيص يعمل"})

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    if model is None or vectorizer is None or all_symptoms is None:
        return jsonify({"error": "Model not initialized"}), 500
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "لا توجد بيانات مقدمة"}), 400
        
    # التعامل مع البيانات المرسلة سواء كقائمة أو كنص مفصول بفواصل
    symptoms = data.get('symptoms', [])
    if isinstance(symptoms, str):
        symptoms = [s.strip() for s in symptoms.split(',')]
    
    print(f"الأعراض المستلمة: {symptoms}")
    valid_symptoms = [s.strip().lower() for s in symptoms if s.strip().lower() in all_symptoms]
    print(f"الأعراض الصالحة: {valid_symptoms}")
    
    if not valid_symptoms:
        return jsonify({"error": "لا توجد أعراض صالحة"}), 400
    
    proba = model.predict_proba(vectorizer.transform([' '.join(valid_symptoms)]))[0]
    results = sorted(zip(model.classes_, proba), key=lambda x: x[1], reverse=True)
    
    # تنسيق النتائج بالشكل المطلوب
    formatted_results = []
    for disease, confidence in results[:5]:  # أخذ أفضل 5 نتائج
        confidence_level = "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"
        formatted_results.append({
            "disease": disease,
            "confidence": float(confidence),
            "confidence_level": confidence_level
        })
    
    return jsonify({
        "results": formatted_results
    })

# Add a health check endpoint
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "up", "model_loaded": model is not None})

# Initialize the model before running the app
print("بدء تهيئة النموذج...")
if not setup():
    print("تحذير: فشل في تهيئة النموذج. سيرجع API أخطاء حتى تنجح عملية التهيئة.")

if __name__ == "__main__":
    print(f"بدء تشغيل الخادم على المنفذ 5021...")
    app.run(host='0.0.0.0', port=5021, debug=True)