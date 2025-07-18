import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from flask import Flask, request, jsonify

app = Flask(__name__)

def setup():
    df = pd.read_csv(r"C:\Users\omara\Downloads\bakker144-main\bakker1-main\disease_symptoms.csv", encoding='latin1')
    
    all_symptoms, texts, diseases = set(), [], []
    for _, row in df.iterrows():
        symp = [s.strip().lower() for i in range(1, 18) if f'Symptom_{i}' in df.columns and pd.notna(row.get(f'Symptom_{i}', "")) and (s := str(row[f'Symptom_{i}'])) and s.strip().lower() != 'nan']
        if symp:
            all_symptoms.update(symp)
            texts.append(' '.join(symp))
            diseases.append(row['Disease'].strip().lower())
    
    vectorizer = CountVectorizer()
    model = RandomForestClassifier(n_estimators=100).fit(vectorizer.fit_transform(texts), diseases)
    return model, vectorizer, list(all_symptoms)

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    valid_symptoms = [s.strip().lower() for s in request.get_json().get('symptoms', []) if s.strip().lower() in all_symptoms]
    if not valid_symptoms: return jsonify({"error": "لا توجد أعراض صالحة"}), 400
    
    proba = model.predict_proba(vectorizer.transform([' '.join(valid_symptoms)]))[0]
    results = sorted(zip(model.classes_, proba), key=lambda x: x[1], reverse=True)
    return jsonify({
        "diagnosis": results[0][0], 
        "probability": round(float(results[0][1]*100), 1),
        "others": [{"disease": d, "probability": round(float(p*100), 1)} for d, p in results[1:4]]
    })

model, vectorizer, all_symptoms = setup()

if __name__ == "__main__": app.run(host='0.0.0.0', port=5021)