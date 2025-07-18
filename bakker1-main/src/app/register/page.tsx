"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Patient from "../../models/Patient";

export default function RegisterPage() {
const [patientName, setPatientName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [confirmPassword, setConfirmPassword] = useState("");
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [phoneNumber, setPhoneNumber] = useState("");
const [dateOfBirth, setDateOfBirth] = useState("");
const [maxDate, setMaxDate] = useState("");
const [gender, setGender] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const router = useRouter();

// تعيين التاريخ الأقصى (اليوم) لحقل تاريخ الميلاد
useEffect(() => {
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
setMaxDate(`${year}-${month}-${day}`);
}, []);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");
// التحقق من تطابق كلمات المرور
if (password !== confirmPassword) {
  setError("كلمات المرور غير متطابقة");
  setLoading(false);
  return;
}

try {
  await Patient.register(
    patientName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    gender
  );
  router.push("/dashboard"); // توجيه المستخدم للوحة التحكم بعد التسجيل
} catch (err: unknown) {
  // معالجة الأخطاء المختلفة
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: string }).message === "string"
  ) {
    setError((err as { message: string }).message);
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code?: string }).code === "string"
  ) {
    const code = (err as { code: string }).code;
    if (code === "auth/email-already-in-use") {
      setError("البريد الإلكتروني مستخدم بالفعل");
    } else if (code === "auth/weak-password") {
      setError("كلمة المرور ضعيفة جداً");
    } else if (code === "auth/invalid-email") {
      setError("البريد الإلكتروني غير صالح");
    } else {
      setError((err as { message?: string }).message || "حدث خطأ أثناء إنشاء الحساب");
    }
  } else {
    setError("حدث خطأ أثناء إنشاء الحساب");
  }
} finally {
  setLoading(false);
}
};

const togglePasswordVisibility = () => {
setShowPassword(!showPassword);
};

const toggleConfirmPasswordVisibility = () => {
setShowConfirmPassword(!showConfirmPassword);
};

return (
<div className="py-12 relative overflow-hidden">
{/* العناصر الزخرفية - تطابق أسلوب الصفحة الرئيسية */}
<div className="absolute -top-32 -left-32 w-64 h-64 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float"></div>
<div className="absolute -bottom-20 -right-32 w-64 h-64 bg-light-green rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-2000"></div>
<div className="absolute top-1/3 right-1/4 w-48 h-48 bg-light-blue rounded-full mix-blend-multiply opacity-40 animate-float animation-delay-4000"></div>
<div className="flex justify-center items-center px-4">
    <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300 relative z-10">
      
      <div className="text-center mb-8">
        <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">إنشاء حساب جديد</h1>
        <p className="text-gray-600 mt-2">انضم إلى منصة بكّر واستفد من خدمات التشخيص المبكر</p>
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
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="patientName" className="mb-2 block text-sm font-medium text-gray-700">
              الاسم الكامل
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          </div>
          
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
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-700">
              رقم الهاتف
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                dir="ltr"
                placeholder="05XXXXXXXX"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-gray-700">
              تاريخ الميلاد
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
                max={maxDate}
                dir="ltr"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-700">
              الجنس
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
              >
                <option value="" disabled>اختر الجنس</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
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
                minLength={6}
                placeholder="كلمة المرور (6 أحرف على الأقل)"
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
          
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white/80 p-3 pr-10 pl-10 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                required
                dir="ltr"
                minLength={6}
                placeholder="تأكيد كلمة المرور"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700"
              >
                {showConfirmPassword ? (
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
        </div>
        
        <div className="mt-2">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
              />
            </div>
            <div className="mr-2 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                أوافق على <Link href="/terms" className="font-medium text-sky-500 hover:text-sky-600">شروط الاستخدام</Link> و <Link href="/privacy" className="font-medium text-sky-500 hover:text-sky-600">سياسة الخصوصية</Link>
              </label>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-600 hover:to-emerald-500 py-3 px-5 text-center text-base font-medium text-white shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-70 transform hover:-translate-y-0.5 mt-4"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري إنشاء الحساب...
            </div>
          ) : "إنشاء حساب جديد"}
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-medium text-sky-500 hover:text-sky-600">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  </div>
</div>
);
}