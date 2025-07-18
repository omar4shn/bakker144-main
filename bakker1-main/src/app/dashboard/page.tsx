"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import Patient from "../../models/Patient";

export default function DashboardPage() {
const [loading, setLoading] = useState(true);
const [patientName, setPatientName] = useState("");
const router = useRouter();

// التحقق من حالة تسجيل الدخول والحصول على بيانات المريض
useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (user) => {
if (user) {
try {
// استرجاع بيانات المريض من Firestore
const patientDoc = await getDoc(doc(db, "patients", user.uid));
if (patientDoc.exists()) {
  // استخراج اسم المريض من البيانات
  setPatientName(patientDoc.data().patientName || "");
}
} catch (error) {
console.error("Error fetching patient data:", error);
} finally {
setLoading(false);
}
} else {
// المستخدم غير مسجل دخوله، توجيهه لصفحة تسجيل الدخول
router.push("/login");
}
});

// إلغاء الاشتراك عند تفكيك المكون
return () => unsubscribe();
}, [router]);

// تسجيل الخروج
const handleLogout = async () => {
try {
await Patient.logout();
router.push("/login");
} catch (error) {
console.error("Error logging out:", error);
}
};

// الانتقال إلى صفحة التاريخ المرضي
const handleMedicalHistoryClick = () => {
router.push("/dashboard/medical-history");
};

// الانتقال إلى صفحة تحليل الأعراض
const handleAIAnalysisClick = () => {
router.push("/dashboard/ai-analysis");
};

// الانتقال إلى صفحة الكشوف السابقة
const handlePreviousExamsClick = () => {
router.push("/dashboard/previous-exams");
};

// عرض شاشة التحميل
if (loading) {
return (
<div className="flex h-screen items-center justify-center">
<div className="text-center">
<div className="relative w-20 h-20">
<div className="absolute inset-0 rounded-full border-4 border-sky-100 opacity-25"></div>
<div className="absolute inset-0 rounded-full border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
<div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-emerald-400 border-b-transparent border-l-transparent animate-spin animation-delay-2000"></div>
</div>
<p className="mt-4 text-lg font-medium text-gray-600">جاري تحميل البيانات...</p>
</div>
</div>
);
}

return (
<div className="container mx-auto px-4 py-8 relative">
{/* العناصر الزخرفية */}
<div className="absolute -top-20 -right-20 w-64 h-64 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float"></div>
<div className="absolute -bottom-20 -left-20 w-64 h-64 bg-light-green rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-2000"></div>
<div className="absolute top-1/3 left-1/4 w-48 h-48 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-4000"></div>


<div className="flex flex-col items-center justify-center relative z-1">
    {/* Card الرئيسية */}
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 w-full max-w-3xl text-center transition-all duration-500 border border-gray-200">
      {/* الشعار المصغر */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white mx-auto mb-6 shadow-lg animate-pulse-slow">
        <span className="text-2xl font-bold">بكّر</span>
      </div>
      
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">
        مرحباً، {patientName}
      </h1>
      
      <p className="text-xl text-gray-600 mb-10">
        أهلاً بك في لوحة تحكم المريض. ماذا تريد أن تفعل اليوم؟
      </p>
      
      {/* الأزرار الثلاثة بتصميم محسن */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <button
          onClick={handleMedicalHistoryClick}
          className="group bg-gradient-to-b from-white to-sky-50 rounded-2xl shadow-lg hover:shadow-2xl border border-sky-100 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden card-hover"
        >
          <div className="relative p-6">
            {/* زخرفة خلفية */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-sky-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-sky-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-200"></div>
            
            {/* أيقونة وعنوان */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-sky-500 mx-auto mb-4 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-sky-500 transition-colors duration-300">التاريخ المرضي</h3>
            <p className="text-gray-600 text-sm mb-4">عرض وتحديث سجلك الطبي</p>
            
            {/* تأثير الزر */}
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mx-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </button>
        
        <button
          onClick={handleAIAnalysisClick}
          className="group bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl border border-emerald-100 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden card-hover"
        >
          <div className="relative p-6">
            {/* زخرفة خلفية */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-400/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-400/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-200"></div>
            
            {/* أيقونة وعنوان */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-500 transition-colors duration-300">تحليل الأعراض</h3>
            <p className="text-gray-600 text-sm mb-4">تحليل ذكي للأعراض التي تعاني منها</p>
            
            {/* تأثير الزر */}
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </button>
        
        <button
          onClick={handlePreviousExamsClick}
          className="group bg-gradient-to-b from-white to-sky-50 rounded-2xl shadow-lg hover:shadow-2xl border border-sky-100 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden card-hover"
        >
          <div className="relative p-6">
            {/* زخرفة خلفية */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-sky-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-sky-500/10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-200"></div>
            
            {/* أيقونة وعنوان */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center text-sky-500 mx-auto mb-4 shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-sky-500 transition-colors duration-300">الكشوف السابقة</h3>
            <p className="text-gray-600 text-sm mb-4">مراجعة الفحوصات والنتائج السابقة</p>
            
            {/* تأثير الزر */}
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mx-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </button>
      </div>
      
      {/* زر تسجيل الخروج */}
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg text-lg font-medium hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        تسجيل الخروج
      </button>
    </div>
  </div>
</div>
);
}