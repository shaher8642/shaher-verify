"use client";

import { useState, useEffect } from "react";
import AdminView from "@/components/shaher/AdminView";
import LoginForm from "@/components/shaher/LoginForm";
import { Lock } from "lucide-react";

const ADMIN_KEY_STORAGE = "shaher_admin_key";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // استرجاع جلسة الإدارة
  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_KEY_STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setAdminKey(saved);
    setChecked(true);
  }, []);

  function handleLogin(key: string) {
    setAdminKey(key);
    localStorage.setItem(ADMIN_KEY_STORAGE, key);
  }

  function handleLogout() {
    setAdminKey(null);
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  }

  // لا تعرض شيئاً حتى فحص الجلسة (لتجنب وميض نموذج الدخول)
  if (!checked) {
    return (
      <div dir="rtl" lang="ar" className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center text-xl font-black animate-pulse">
          ش
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-slate-50">
      {/* شريط علوي بسيط */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 font-bold">
            <Lock className="w-4 h-4 text-teal-400" />
            منطقة الإدارة — شهّر
          </span>
          <span className="text-slate-400 text-xs">وصول خاص</span>
        </div>
      </div>

      {adminKey ? (
        <section className="py-6">
          <AdminView adminKey={adminKey} onLogout={handleLogout} />
        </section>
      ) : (
        <section className="py-16">
          <LoginForm onSuccess={handleLogin} />
        </section>
      )}
    </div>
  );
}
