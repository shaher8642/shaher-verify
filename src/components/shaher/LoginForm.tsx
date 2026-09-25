"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, ShieldAlert } from "lucide-react";

export default function LoginForm({ onSuccess }: { onSuccess: (key: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSuccess(data.key);
      } else {
        setError(data.message || "كلمة المرور غير صحيحة");
      }
    } catch {
      setError("تعذر الاتصال بالخدمة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-teal-700 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-xl font-extrabold text-slate-900">دخول لوحة الإدارة</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            هذه المنطقة مخصصة لمدير المنصة لإصدار وإدارة الوثائق
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة مرور الإدارة"
                className="h-12 text-center"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base"
            >
              {loading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
              دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
