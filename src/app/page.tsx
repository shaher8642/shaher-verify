"use client";

import { useState, useEffect, Suspense } from "react";
import VerifyView from "@/components/shaher/VerifyView";
import AdminView from "@/components/shaher/AdminView";
import LoginForm from "@/components/shaher/LoginForm";
import { ShieldCheck, BadgeCheck, FileCheck2, QrCode, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "verify" | "admin";

const ADMIN_KEY_STORAGE = "shaher_admin_key";

function HomeContent() {
  const [view, setView] = useState<View>("verify");
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [initialRef, setInitialRef] = useState<string | undefined>(undefined);
  const [mobileMenu, setMobileMenu] = useState(false);

  // قراءة ?ref= من الرابط للتحقق المباشر عبر QR
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ref) setInitialRef(ref);
  }, []);

  // استرجاع جلسة الإدارة
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_KEY_STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setAdminKey(saved);
  }, []);

  function handleLogin(key: string) {
    setAdminKey(key);
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  }

  function handleLogout() {
    setAdminKey(null);
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setView("verify");
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen flex flex-col bg-slate-50">
      {/* الترويسة */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* الشعار */}
          <button
            onClick={() => setView("verify")}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="الصفحة الرئيسية - منصة شهّر"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center text-xl font-black shadow">
              ش
            </span>
            <span className="text-right">
              <span className="block font-extrabold text-lg text-teal-900 leading-tight">شهّر</span>
              <span className="block text-[11px] text-slate-500 leading-tight">
                Shaher Verify — توثيق الوثائق والشهادات
              </span>
            </span>
          </button>

          {/* قائمة سطح المكتب */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={view === "verify" ? "default" : "ghost"}
              onClick={() => setView("verify")}
              className={view === "verify" ? "bg-teal-700 hover:bg-teal-800 text-white" : "text-slate-600"}
            >
              <BadgeCheck className="w-4 h-4 ml-1" />
              التحقق من وثيقة
            </Button>
            <Button
              variant={view === "admin" ? "default" : "ghost"}
              onClick={() => setView("admin")}
              className={view === "admin" ? "bg-teal-700 hover:bg-teal-800 text-white" : "text-slate-600"}
            >
              <FileCheck2 className="w-4 h-4 ml-1" />
              {adminKey ? "لوحة الإدارة" : "دخول الإدارة"}
            </Button>
          </nav>

          {/* زر القائمة للجوال */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="القائمة"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* قائمة الجوال */}
        {mobileMenu && (
          <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
            <Button
              variant={view === "verify" ? "default" : "ghost"}
              onClick={() => {
                setView("verify");
                setMobileMenu(false);
              }}
              className={view === "verify" ? "bg-teal-700 hover:bg-teal-800 text-white justify-start" : "text-slate-600 justify-start"}
            >
              <BadgeCheck className="w-4 h-4 ml-1" />
              التحقق من وثيقة
            </Button>
            <Button
              variant={view === "admin" ? "default" : "ghost"}
              onClick={() => {
                setView("admin");
                setMobileMenu(false);
              }}
              className={view === "admin" ? "bg-teal-700 hover:bg-teal-800 text-white justify-start" : "text-slate-600 justify-start"}
            >
              <FileCheck2 className="w-4 h-4 ml-1" />
              {adminKey ? "لوحة الإدارة" : "دخول الإدارة"}
            </Button>
          </nav>
        )}
      </header>

      {/* المحتوى */}
      <main className="flex-1 w-full">
        {view === "verify" ? (
          <>
            {/* قسم البطل */}
            <section className="bg-gradient-to-b from-teal-50/80 to-transparent border-b border-teal-100/60">
              <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
                <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 text-xs text-teal-800 font-bold shadow-sm mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  منصة توثيق إلكترونية
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-snug">
                  تحقّق من صحة الوثائق والشهادات
                  <span className="block text-teal-700 mt-1">بضغطة واحدة</span>
                </h1>
                <p className="mt-4 text-slate-600 leading-relaxed max-w-xl mx-auto">
                  منصة شهّر تتيح إصدار الوثائق والشهادات الإلكترونية والتحقق من صحتها عبر رقم
                  مرجعي فريد أو رمز استجابة سريعة (QR) — سجل مركزي موثوق وسريع.
                </p>

                {/* مؤشرات الثقة */}
                <div className="grid grid-cols-3 gap-3 mt-6 max-w-lg mx-auto">
                  <TrustItem icon={<BadgeCheck className="w-5 h-5" />} label="تحقق فوري" />
                  <TrustItem icon={<QrCode className="w-5 h-5" />} label="رمز QR لكل وثيقة" />
                  <TrustItem icon={<ShieldCheck className="w-5 h-5" />} label="سجل موثوق" />
                </div>
              </div>
            </section>

            {/* خدمة التحقق */}
            <section className="py-8 -mt-2">
              <VerifyView initialRef={initialRef} />
            </section>

            {/* شرح كيفية العمل */}
            <section className="py-8 bg-white border-t border-slate-100">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-xl font-extrabold text-slate-900 text-center mb-6">
                  كيف تعمل المنصة؟
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StepCard
                    num="1"
                    title="إصدار الوثيقة"
                    text="يقوم مدير المنصة بإصدار الوثيقة أو الشهادة بعد تعبئة بياناتها، فيولّد النظام رقماً مرجعياً فريداً وملف PDF رسمياً بباركود QR."
                  />
                  <StepCard
                    num="2"
                    title="تسليم الوثيقة"
                    text="تُسلّم الوثيقة لصاحبها ورقياً (PDF) أو إلكترونياً، وكل وثيقة تحمل رقمها المرجعي ورمز الاستجابة السريعة الخاص بها."
                  />
                  <StepCard
                    num="3"
                    title="التحقق منها"
                    text="أي جهة أو شخص يمكنه التحقق من صحة الوثيقة بمسح رمز QR أو إدخال الرقم المرجعي هنا، فتظهر بيانات الوثيقة وحالتها فوراً."
                  />
                </div>
              </div>
            </section>
          </>
        ) : adminKey ? (
          <section className="py-8">
            <AdminView adminKey={adminKey} onLogout={handleLogout} />
          </section>
        ) : (
          <section className="py-10">
            <LoginForm onSuccess={handleLogin} />
          </section>
        )}
      </main>

      {/* التذييل */}
      <footer className="mt-auto bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-black">
              ش
            </span>
            <div>
              <p className="font-bold text-white">منصة شهّر للتوثيق</p>
              <p className="text-xs text-slate-400">Shaher Verify — نظام إصدار وتوثيق الوثائق</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center sm:text-left">
            جميع الحقوق محفوظة © {new Date().getFullYear()} — منصة شهّر
          </p>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white/70 border border-slate-200 rounded-xl py-3 shadow-sm">
      <span className="text-teal-700">{icon}</span>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
}

function StepCard({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center hover:border-teal-300 transition-colors">
      <span className="w-9 h-9 rounded-full bg-teal-700 text-white font-black flex items-center justify-center mx-auto mb-3">
        {num}
      </span>
      <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
