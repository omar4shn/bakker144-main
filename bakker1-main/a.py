import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from flask import Flask, request, jsonify

app = Flask(__name__)

# تحميل البيانات وتدريب النموذج في دالة واحدة
def setup():
    df = pd.read_csv("disease_symptoms.csv")
    
    # جمع الأعراض وإعداد البيانات
    all_symptoms, texts, diseases = set(), [], []
    for _, row in df.iterrows():
        row_symptoms = []
        for i in range(1, 18):
            col = f'Symptom_{i}'
            if col in df.columns and pd.notna(row.get(col, "")):
                symptom = str(row[col]).strip().lower()
                if symptom:
                    row_symptoms.append(symptom)
                    all_symptoms.add(symptom)
        if row_symptoms:
            texts.append(' '.join(row_symptoms))
            diseases.append(row['Disease'].strip().lower())
    
    # تدريب النموذج
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(texts)
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, diseases)
    
    return model, vectorizer, list(all_symptoms)

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    symptoms = [s.strip().lower() for s in request.get_json().get('symptoms', [])]
    valid_symptoms = [s for s in symptoms if s in all_symptoms]
    
    if not valid_symptoms:
        return jsonify({"error": "لا توجد أعراض صالحة"}), 400
    
    # التشخيص
    vector = vectorizer.transform([' '.join(valid_symptoms)])
    proba = model.predict_proba(vector)[0]
    
    # ترتيب النتائج
    results = sorted(zip(model.classes_, proba), key=lambda x: x[1], reverse=True)
    top, others = results[0], results[1:4]
    
    return jsonify({
        "diagnosis": top[0],
        "probability": round(float(top[1]*100), 1),
        "others": [{"disease": d, "probability": round(float(p*100), 1)} for d, p in others]
    })

# تحميل النموذج عند بدء التطبيق
model, vectorizer, all_symptoms = setup()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5021)