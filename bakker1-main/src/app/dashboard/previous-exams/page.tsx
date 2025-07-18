// src/app/dashboard/previous-exams/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../../firebase/config";

interface DiagnosisResult {
  disease: string;
  confidence: number;
  confidenceLevel: string;
}

interface ExamRecord {
  id: string;
  userId: string;
  date: Date;
  symptoms: string[];
  results: DiagnosisResult[];
  notes?: string;
}

export default function PreviousExamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // المستخدم مسجل دخول
        setUserId(user.uid);
      } else if (!auth.currentUser && !authChecked) {
        // المستخدم غير مسجل دخول وهذه أول مرة نتحقق فيها
        router.push("/login");
      }
      
      // تم التحقق من حالة المستخدم
      setAuthChecked(true);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router, authChecked]);
  
  // جلب سجلات الفحوصات السابقة
  useEffect(() => {
    if (!userId) return;
    
    const fetchExams = async () => {
      setLoadingExams(true);
      setErrorMessage(null);
      
      try {
        // إنشاء استعلام للحصول على الفحوصات الخاصة بالمستخدم الحالي
        const examsQuery = query(
          collection(db, "exams"),
          where("userId", "==", userId)
        );
        
        const querySnapshot = await getDocs(examsQuery);
        const fetchedExams: ExamRecord[] = [];
        
        querySnapshot.forEach((docSnapshot) => {
          try {
            const data = docSnapshot.data();
            
            // تحقق من وجود حقل التاريخ وصحة تنسيقه
            let examDate: Date;
            if (data.date) {
              if (data.date instanceof Timestamp) {
                examDate = data.date.toDate();
              } else if (data.date.seconds && data.date.nanoseconds) {
                // إذا كان التاريخ تم تخزينه كمستند فيه حقول seconds و nanoseconds
                examDate = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate();
              } else {
                // استخدام التاريخ الحالي كحل بديل إذا كان التنسيق غير معروف
                console.warn("تنسيق تاريخ غير معروف لـ ID:", docSnapshot.id);
                examDate = new Date();
              }
            } else {
              // استخدام التاريخ الحالي إذا لم يتم تخزين تاريخ
              console.warn("لا يوجد تاريخ للفحص ID:", docSnapshot.id);
              examDate = new Date();
            }
            
            // تحقق من وجود الأعراض
            const symptoms = Array.isArray(data.symptoms) ? data.symptoms : [];
            
            // تحقق من وجود النتائج وصحة تنسيقها
            const results = Array.isArray(data.results) ? data.results.map(result => ({
              disease: result.disease || "غير معروف",
              confidence: typeof result.confidence === 'number' ? result.confidence : 0,
              confidenceLevel: result.confidenceLevel || "low"
            })) : [];
            
            fetchedExams.push({
              id: docSnapshot.id,
              userId: data.userId,
              date: examDate,
              symptoms: symptoms,
              results: results,
              notes: data.notes
            });
          } catch (docError) {
            console.error("خطأ في معالجة وثيقة:", docError, "ID:", docSnapshot.id);
          }
        });
        
        // ترتيب الفحوصات يدويًا حسب التاريخ تنازليًا
        fetchedExams.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setExams(fetchedExams);
      } catch (error) {
        console.error("خطأ في جلب الفحوصات:", error);
        // عرض رسالة خطأ أكثر تفصيلاً
        let errorMsg = "حدث خطأ أثناء جلب سجلات الفحوصات";
        if (error instanceof Error) {
          errorMsg += `: ${error.message}`;
        }
        setErrorMessage(errorMsg);
      } finally {
        setLoadingExams(false);
      }
    };
    
    fetchExams();
  }, [userId]);
  
  // حذف سجل فحص
  const deleteExam = async (examId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا السجل؟")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "exams", examId));
      setExams(exams.filter(exam => exam.id !== examId));
    } catch (error) {
      console.error("خطأ في حذف الفحص:", error);
      let errorMsg = "حدث خطأ أثناء حذف السجل";
      if (error instanceof Error) {
        errorMsg += `: ${error.message}`;
      }
      setErrorMessage(errorMsg);
    }
  };
  
  // توسيع/طي تفاصيل سجل الفحص
  const toggleExamDetails = (examId: string) => {
    if (expandedExam === examId) {
      setExpandedExam(null);
    } else {
      setExpandedExam(examId);
    }
  };
  
  // الرجوع للصفحة السابقة
  const goBack = () => {
    router.push("/dashboard");
  };
  
  // الانتقال لصفحة التحليل الجديد
  const goToNewAnalysis = () => {
    router.push("/dashboard/ai-analysis");
  };
  
  // تنسيق التاريخ للعرض
  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("خطأ في تنسيق التاريخ:", error, date);
      return "تاريخ غير صالح";
    }
  };
  
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
            سجلات الفحوصات السابقة
          </h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <p className="text-gray-600 mb-4 md:mb-0">
            عرض جميع الفحوصات السابقة ونتائجها
          </p>
          <button
            onClick={goToNewAnalysis}
            className="px-5 py-3 bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-xl text-base font-medium hover:from-sky-600 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            فحص جديد
          </button>
        </div>
        
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border-r-4 border-red-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMessage}
            </div>
            <div className="mt-2">
              <p>تعليمات للمساعدة:</p>
              <ul className="list-disc list-inside mt-1 mr-5">
                <li>تأكد من اتصالك بالإنترنت</li>
                <li>تحقق من أنك سجلت دخولك بشكل صحيح</li>
                <li>حاول تحديث الصفحة</li>
                <li>إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني</li>
              </ul>
            </div>
          </div>
        )}
        
        {loadingExams ? (
          <div className="w-full bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 flex justify-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-sky-300 animate-pulse animation-delay-150"></div>
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse animation-delay-300"></div>
              <span className="text-gray-700">جاري تحميل السجلات...</span>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <div className="w-full bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 text-center">
            <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-r from-sky-100 to-emerald-100 flex items-center justify-center text-sky-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent mb-2">لا توجد فحوصات سابقة</h3>
            <p className="text-gray-600 mb-6">
              لم تقم بإجراء أي فحوصات باستخدام التحليل الذكي بعد.
            </p>
            <button
              onClick={goToNewAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-xl text-base font-medium hover:from-sky-600 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              إجراء فحص جديد
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {exams.map((exam) => (
              <div 
                key={exam.id} 
                className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl"
              >
                {/* رأس البطاقة مع معلومات أساسية */}
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExamDetails(exam.id)}
                >
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {exam.results && exam.results.length > 0 ? exam.results[0].disease : "نتيجة غير معروفة"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(exam.date)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {exam.results && exam.results.length > 0 && (
                      <div className="flex items-center ml-4">
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${
                            exam.results[0].confidenceLevel === 'high' ? 'bg-emerald-500' : 
                            exam.results[0].confidenceLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {(exam.results[0].confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="p-2 bg-gray-100 rounded-full mr-2 transition-all duration-300 hover:bg-gray-200">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-gray-600 transition-transform ${expandedExam === exam.id ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* تفاصيل إضافية تظهر عند النقر */}
                {expandedExam === exam.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    {/* قسم الأعراض */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-sky-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        الأعراض:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exam.symptoms.length > 0 ? (
                          exam.symptoms.map((symptom, index) => (
                            <span 
                              key={index} 
                              className="bg-gradient-to-r from-sky-100 to-emerald-100 text-sky-800 rounded-full px-3 py-1 text-sm"
                            >
                              {symptom.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">لا توجد أعراض مسجلة</span>
                        )}
                      </div>
                    </div>
                    
                    {/* قسم النتائج */}
                    {exam.results && exam.results.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-sky-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          نتائج التشخيص:
                        </h4>
                        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-lg p-4">
                          <ul className="space-y-2">
                            {exam.results.map((result, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span className={`text-gray-800 ${index === 0 ? 'font-medium' : ''}`}>
                                  {result.disease}
                                </span>
                                <div className="flex items-center">
                                  <div 
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      result.confidenceLevel === 'high' ? 'bg-emerald-500' : 
                                      result.confidenceLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  ></div>
                                  <span className="text-sm text-gray-600">
                                    {(result.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-sky-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          نتائج التشخيص:
                        </h4>
                        <p className="text-gray-500 text-sm">لا توجد نتائج مسجلة</p>
                      </div>
                    )}
                    
                    {/* ملاحظات إضافية إذا وجدت */}
                    {exam.notes && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-sky-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          ملاحظات:
                        </h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {exam.notes}
                        </p>
                      </div>
                    )}
                    
                    {/* زر حذف السجل */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExam(exam.id);
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف السجل
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}