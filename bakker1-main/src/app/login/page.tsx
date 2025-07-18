"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Patient from "../../models/Patient";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");
try {
  await Patient.login(email, password);
  router.push("/dashboard"); // توجيه المستخدم للوحة التحكم بعد تسجيل الدخول
} catch (err: unknown) {
  // معالجة الأخطاء المختلفة
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code?: string }).code === "string"
  ) {
    const code = (err as { code: string }).code;
    if (code === "auth/user-not-found" || code === "auth/wrong-password") {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } else if (code === "auth/too-many-requests") {
      setError("تم تقييد الحساب مؤقتاً بسبب محاولات تسجيل دخول متكررة");
    } else {
      setError(
        (err as { message?: string }).message || "حدث خطأ أثناء تسجيل الدخول"
      );
    }
  } else {
    setError("حدث خطأ أثناء تسجيل الدخول");
  }
} finally {
  setLoading(false);
}
};

const togglePasswordVisibility = () => {
setShowPassword(!showPassword);
};

return (
<div className="py-16 relative overflow-hidden">
{/* العناصر الزخرفية - تطابق أسلوب الصفحة الرئيسية */}
<div className="absolute -top-32 -right-32 w-64 h-64 bg-light-green rounded-full mix-blend-multiply opacity-40 animate-float"></div>
<div className="absolute bottom-20 -left-32 w-64 h-64 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-2000"></div>
<div className="flex justify-center items-center px-4">
    <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 relative z-10">
      
      <div className="text-center mb-8">
        <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">تسجيل الدخول</h1>
        <p className="text-gray-600 mt-2">مرحباً بك مجدداً! قم بتسجيل الدخول للوصول إلى حسابك</p>
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
        
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            كلمة المرور
          </label>
          <div className="relative">
            <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 pl-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
              dir="ltr"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" 
            />
            <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-700">
              تذكرني
            </label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-sky-500 hover:text-sky-600">
              نسيت كلمة المرور؟
            </Link>
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
              جاري تسجيل الدخول...
            </div>
          ) : "تسجيل الدخول"}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-medium text-sky-500 hover:text-sky-600">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  </div>
</div>
);
}