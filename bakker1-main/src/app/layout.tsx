// src/app/layout.tsx
import Link from 'next/link'
import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'منصة بكّر - التشخيص المبكر بالذكاء الاصطناعي',
  description: 'منصة ذكية للتشخيص المبكر للحالات المرضية باستخدام تقنيات الذكاء الاصطناعي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="numbers-en">
      <body className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 to-green-50">
        <header className="sticky top-0 z-10 bg-white shadow-md transition-all duration-300">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xl">
                <Link href="/" className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white">
                    <span className="text-sm font-bold">بكّر</span>
                  </div>
                  <span className="bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">منصة بكّر</span>
                </Link>
              </div>
              <div className="flex space-x-4 space-x-reverse">
                <Link href="/" className="px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors">
                  الرئيسية
                </Link>

                <Link href="/login" className="px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors">
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-2 bg-gradient-to-r from-sky-500 to-emerald-400 text-white rounded-lg hover:from-sky-600 hover:to-emerald-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  إنشاء حساب
                </Link>
              </div>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 relative z-1">
          {children}
        </main>
        
        <footer className="bg-white shadow-inner py-8 relative z-1">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">منصة بكّر</h3>
                <p className="text-gray-600">
                  منصة ذكية للتشخيص المبكر للحالات المرضية باستخدام تقنيات الذكاء الاصطناعي المتطورة
                </p>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">
                    تعمل منصة بكّر على مساعدة المستخدمين في اتخاذ القرارات الصحية المناسبة من خلال تحليل الأعراض وتقديم توصيات طبية أولية موثوقة
                  </p>
                </div>
              </div>
              <div>
                <ul className="space-y-2">
                  <li>

                  </li>
                  <li>

                  </li>
                  <li>

                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">معلومات الاتصال</h3>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    bakker.0220@gmail.com
                  </p>
                  <p className="text-gray-600 text-sm flex items-center">
                    <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0543655847
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                منصة بكّر - جميع الحقوق محفوظة {new Date().getFullYear()} &copy;
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}