"use client";

import { useState } from "react";
import Link from "next/link";
import Patient from "../../models/Patient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await Patient.resetPassword(email);
      setSuccess(true);
      setEmail(""); // مسح البريد الإلكتروني بعد النجاح
    } catch (err: unknown) {
      // معالجة الأخطاء المختلفة
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: string }).code === "string"
      ) {
        const code = (err as { code: string }).code;
        if (code === "auth/user-not-found") {
          setError("لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني");
        } else if (code === "auth/invalid-email") {
          setError("البريد الإلكتروني غير صالح");
        } else if (code === "auth/missing-email") {
          setError("الرجاء إدخال البريد الإلكتروني");
        } else {
          setError(
            (err as { message?: string }).message || "حدث خطأ أثناء إعادة تعيين كلمة المرور"
          );
        }
      } else {
        setError("حدث خطأ أثناء إعادة تعيين كلمة المرور");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 relative overflow-hidden">
      {/* العناصر الزخرفية - تطابق أسلوب الصفحة الرئيسية */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float"></div>
      <div className="absolute -bottom-20 -right-32 w-64 h-64 bg-light-green rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-4000"></div>
      
      <div className="flex justify-center items-center px-4">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 relative z-10">
          
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">استعادة كلمة المرور</h1>
            <p className="text-gray-600 mt-2">أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور</p>
          </div>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border-r-4 border-red-500">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border-r-4 border-emerald-500">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">تم إرسال رابط إعادة تعيين كلمة المرور!</p>
                  <p className="mt-1">تفقد بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور الخاصة بك.</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  placeholder="example@example.com"
                  required
                  dir="ltr"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-600 hover:to-emerald-500 py-3 px-5 text-center text-base font-medium text-white shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-70 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري إرسال الرابط...
                </div>
              ) : "إرسال رابط إعادة التعيين"}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              <Link href="/login" className="font-medium text-sky-500 hover:text-sky-600">
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  العودة إلى صفحة تسجيل الدخول
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}