// src/app/dashboard/medical-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";
import MedicalHistory from "../../../models/MedicalHistory";
import Disease from "../../../models/Disease";
import { Timestamp } from "firebase/firestore";

// واجهات البيانات للنماذج
interface DiseaseFormData {
  diseaseName: string;
  diagnosisDate: string;
  status: 'active' | 'cured' | 'chronic' | 'in_treatment';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string;
  treatments: string;
}

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  // بيانات التاريخ المرضي
  const [diseases, setDiseases] = useState<Disease[]>([]);
  
  // حالة النماذج
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // بيانات النماذج
  const [diseaseForm, setDiseaseForm] = useState<DiseaseFormData>({
    diseaseName: '',
    diagnosisDate: '',
    status: 'active',
    severity: 'moderate',
    symptoms: '',
    treatments: ''
  });
  
  // التحقق من حالة تسجيل الدخول والحصول على البيانات
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setPatientId(user.uid);
        await fetchMedicalHistory(user.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // جلب التاريخ المرضي
  const fetchMedicalHistory = async (patientId: string) => {
    try {
      const medicalHistory = new MedicalHistory(patientId);
      const history = await medicalHistory.getFullMedicalHistory();
      
      setDiseases(history.diseases);
    } catch (error) {
      console.error("خطأ في جلب التاريخ المرضي:", error);
    }
  };
  
  // تنسيق التاريخ لعرضه
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return "غير محدد";
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate();
      
    return date.toLocaleDateString('ar-SA');
  };
  
  // تحويل النص إلى مصفوفة
  const splitTextToArray = (text: string): string[] => {
    return text.split(',').map(item => item.trim()).filter(item => item !== '');
  };
  
  // إضافة أو تحديث مرض
  const handleSaveDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const diseaseData = {
        patientId,
        diseaseName: diseaseForm.diseaseName,
        diagnosisDate: new Date(diseaseForm.diagnosisDate),
        status: diseaseForm.status,
        severity: diseaseForm.severity,
        symptoms: splitTextToArray(diseaseForm.symptoms),
        treatments: splitTextToArray(diseaseForm.treatments)
      };
      
      let disease: Disease;
      
      if (editingId) {
        // تحديث مرض موجود
        const existingDisease = await Disease.getById(editingId);
        if (!existingDisease) throw new Error("المرض غير موجود");
        
        disease = new Disease({
          ...diseaseData,
          id: editingId
        });
      } else {
        // إضافة مرض جديد
        disease = new Disease(diseaseData);
      }
      
      await disease.save();
      await fetchMedicalHistory(patientId);
      resetForms();
      setIsFormVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error("خطأ في حفظ المرض:", error);
    }
  };
  
  // حذف عنصر
  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    
    try {
      const disease = await Disease.getById(id);
      if (disease) await disease.delete();
      
      if (patientId) await fetchMedicalHistory(patientId);
    } catch (error) {
      console.error("خطأ في حذف العنصر:", error);
    }
  };
  
  // تحرير عنصر
  const handleEdit = async (id: string) => {
    setEditingId(id);
    
    try {
      const disease = await Disease.getById(id);
      if (disease) {
        setDiseaseForm({
          diseaseName: disease.diseaseName,
          diagnosisDate: disease.diagnosisDate instanceof Date 
            ? disease.diagnosisDate.toISOString().split('T')[0]
            : disease.diagnosisDate.toDate().toISOString().split('T')[0],
          status: disease.status,
          severity: disease.severity,
          symptoms: disease.symptoms.join(', '),
          treatments: disease.treatments?.join(', ') || ''
        });
      }
      
      setIsFormVisible(true);
    } catch (error) {
      console.error("خطأ في تحرير العنصر:", error);
    }
  };
  
  // إعادة تعيين النماذج
  const resetForms = () => {
    setDiseaseForm({
      diseaseName: '',
      diagnosisDate: '',
      status: 'active',
      severity: 'moderate',
      symptoms: '',
      treatments: ''
    });
  };
  
  // رسم العنصر المناسب حسب الحالة
  const renderForm = () => {
    if (!isFormVisible) return null;
    
    return (
      <form onSubmit={handleSaveDisease} className="w-full bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 mb-8">
        <div className="text-center mb-6">
          <div className="inline-block w-14 h-14 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">
            {editingId ? 'تحرير المرض' : 'إضافة مرض جديد'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">اسم المرض</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
              </div>
              <input 
                type="text" 
                value={diseaseForm.diseaseName} 
                onChange={(e) => setDiseaseForm({...diseaseForm, diseaseName: e.target.value})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">تاريخ التشخيص</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="date" 
                value={diseaseForm.diagnosisDate} 
                onChange={(e) => setDiseaseForm({...diseaseForm, diagnosisDate: e.target.value})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">الحالة</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <select 
                value={diseaseForm.status} 
                onChange={(e) => setDiseaseForm({...diseaseForm, status: e.target.value as DiseaseFormData["status"]})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="active">نشط</option>
                <option value="cured">تم الشفاء</option>
                <option value="chronic">مزمن</option>
                <option value="in_treatment">تحت العلاج</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">الشدة</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <select 
                value={diseaseForm.severity} 
                onChange={(e) => setDiseaseForm({...diseaseForm, severity: e.target.value as DiseaseFormData["severity"]})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="mild">خفيف</option>
                <option value="moderate">متوسط</option>
                <option value="severe">شديد</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">الأعراض (مفصولة بفواصل)</label>
            <div className="relative">
              <div className="absolute top-3 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <textarea 
                value={diseaseForm.symptoms} 
                onChange={(e) => setDiseaseForm({...diseaseForm, symptoms: e.target.value})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                rows={2}
                required
              ></textarea>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">العلاجات (مفصولة بفواصل)</label>
            <div className="relative">
              <div className="absolute top-3 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <textarea 
                value={diseaseForm.treatments} 
                onChange={(e) => setDiseaseForm({...diseaseForm, treatments: e.target.value})}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                rows={2}
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button 
            type="button" 
            onClick={() => {
              setIsFormVisible(false);
              setEditingId(null);
              resetForms();
            }}
            className="px-6 py-3 bg-white text-sky-500 border-2 border-sky-500 rounded-xl font-medium hover:bg-sky-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            إلغاء
          </button>
          <button 
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-xl font-medium hover:from-sky-600 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {editingId ? 'تحديث المرض' : 'إضافة المرض'}
          </button>
        </div>
      </form>
    );
  };
  
  // عرض محتوى الصفحة
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-60">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-sky-100 opacity-25"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-emerald-400 border-b-transparent border-l-transparent animate-spin animation-delay-2000"></div>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        {diseases.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 flex items-center justify-center text-sky-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <p className="text-lg mb-2">لا توجد أمراض مسجلة</p>
            <p className="text-gray-500">أضف مرضاً جديداً للبدء</p>
          </div>
        ) : (
          <div className="space-y-6">
            {diseases.map((disease) => (
              <div 
                key={disease.id} 
                className="w-full bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">
                      {disease.diseaseName}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      تاريخ التشخيص: {formatDate(disease.diagnosisDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleEdit(disease.id!)} 
                      className="px-4 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-all duration-300 flex items-center"
                      title="تحرير"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تحرير
                    </button>
                    <button 
                      onClick={() => handleDelete(disease.id!)} 
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300 flex items-center"
                      title="حذف"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg p-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sky-700 mb-1">الحالة</h4>
                      <p className="text-gray-600">
                        <span className={`inline-block rounded-full px-3 py-1 text-sm ${
                          disease.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                          disease.status === 'cured' ? 'bg-green-100 text-green-800' :
                          disease.status === 'chronic' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {disease.status === 'active' && 'نشط'}
                          {disease.status === 'cured' && 'تم الشفاء'}
                          {disease.status === 'chronic' && 'مزمن'}
                          {disease.status === 'in_treatment' && 'تحت العلاج'}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sky-700 mb-1">الشدة</h4>
                      <p className="text-gray-600">
                        <span className={`inline-block rounded-full px-3 py-1 text-sm ${
                          disease.severity === 'mild' ? 'bg-green-100 text-green-800' :
                          disease.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {disease.severity === 'mild' && 'خفيف'}
                          {disease.severity === 'moderate' && 'متوسط'}
                          {disease.severity === 'severe' && 'شديد'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-sky-700 mb-1">الأعراض</h4>
                      <div className="flex flex-wrap gap-2">
                        {disease.symptoms.map((symptom, index) => (
                          <span 
                            key={index} 
                            className="bg-white rounded-full px-3 py-1 text-sm text-sky-700 shadow-sm"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {disease.treatments && disease.treatments.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-sky-700 mb-1">العلاجات</h4>
                        <div className="flex flex-wrap gap-2">
                          {disease.treatments.map((treatment, index) => (
                            <span 
                              key={index} 
                              className="bg-white rounded-full px-3 py-1 text-sm text-emerald-700 shadow-sm"
                            >
                              {treatment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // الرجوع للصفحة السابقة
  const goBack = () => {
    router.push("/dashboard");
  };
  
  return (
    <div className="py-12 relative overflow-hidden">
      {/* العناصر الزخرفية - تطابق أسلوب الصفحة الرئيسية */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float"></div>
      <div className="absolute -bottom-20 -right-32 w-64 h-64 bg-light-green rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center mb-8">
          <button 
            onClick={goBack} 
            className="flex items-center px-4 py-2 bg-white text-sky-500 border-2 border-sky-500 rounded-lg hover:bg-sky-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">
            التاريخ المرضي
          </h1>
        </div>
        
        <div className="w-full bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 relative z-10 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-md ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">
                سجل الأمراض
              </h2>
            </div>
            
            {!isFormVisible && (
              <button 
                onClick={() => {
                  resetForms();
                  setIsFormVisible(true);
                }}
                className="px-5 py-3 bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-xl text-base font-medium hover:from-sky-600 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة مرض جديد
              </button>
            )}
          </div>
          
          {isFormVisible && renderForm()}
          
          <div className={`mt-8 ${isFormVisible ? 'opacity-50 pointer-events-none' : ''}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}