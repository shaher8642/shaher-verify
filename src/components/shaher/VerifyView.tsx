"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateAr } from "@/lib/types";
import {
  ShieldCheck,
  Search,
  BadgeCheck,
  XCircle,
  FileText,
  CalendarDays,
  Hash,
  Fingerprint,
  Globe,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface VerifyResult {
  found: boolean;
  message?: string;
  document?: {
    refNumber: string;
    fullName: string;
    idNumber: string;
    nationality?: string | null;
    docType: string;
    docTitle?: string | null;
    issueDate: string;
    expiryDate?: string | null;
    status: string;
    notes?: string | null;
  };
}

export default function VerifyView({ initialRef }: { initialRef?: string }) {
  const [query, setQuery] = useState(initialRef || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function doVerify(q: string) {
    const value = q.trim();
    if (!value) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ found: false, message: "تعذر الاتصال بالخدمة، حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  }

  // التحقق التلقائي إذا وصل رقم مرجعي عبر الرابط ?ref=
  useEffect(() => {
    if (initialRef) doVerify(initialRef);
  }, [initialRef]);

  const doc = result?.document;
  const statusColor =
    doc?.status === "سارية"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : doc?.status === "ملغاة"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-amber-100 text-amber-800 border-amber-300";

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
      {/* بطاقة البحث */}
      <Card className="w-full shadow-lg border-teal-100 overflow-hidden">
        <div className="bg-gradient-to-l from-teal-700 to-teal-600 text-white p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">خدمة التحقق من الوثائق والشهادات</h2>
            <p className="text-teal-100 text-sm">أدخل الرقم المرجعي للوثيقة أو رقم الهوية للتحقق من صحتها</p>
          </div>
        </div>
        <CardContent className="p-5">
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              doVerify(query);
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                dir="ltr"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SH-2026-123456 أو رقم الهوية"
                className="pr-9 h-12 text-base text-left font-mono tracking-wide"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-bold text-base shrink-0"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BadgeCheck className="w-5 h-5 ml-2" />}
              {loading ? "جارٍ التحقق..." : "تحقق الآن"}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <Globe className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              يمكنك التحقق من أي وثيقة صادرة عن منصة شهّر — الشهادات، خطابات التعريف، وثائق التسليم،
              وشهادات الدورات التدريبية.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* النتيجة */}
      {result && (
        <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.found && doc ? (
            <Card className="w-full shadow-md overflow-hidden border-emerald-200">
              {/* رأس النتيجة الناجحة */}
              <div className="bg-emerald-50 border-b border-emerald-200 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-emerald-900">
                    {doc.status === "سارية" ? "وثيقة صحيحة وموثقة" : doc.status === "ملغاة" ? "وثيقة ملغاة" : "وثيقة منتهية الصلاحية"}
                  </h3>
                  <p className="text-emerald-700 text-sm">
                    تم العثور على الوثيقة في سجل منصة شهّر — البيانات كما هي مسجلة لدى النظام
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full border text-sm font-bold shrink-0 ${statusColor}`}
                  dir="rtl"
                >
                  {doc.status}
                </span>
              </div>

              <CardContent className="p-5">
                {/* عنوان الوثيقة */}
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-teal-700" />
                  <h4 className="font-bold text-slate-900">{doc.docType}</h4>
                </div>
                {doc.docTitle && (
                  <p className="text-slate-600 text-sm -mt-3 mb-4 mr-7">« {doc.docTitle} »</p>
                )}

                <Separator className="mb-4" />

                {/* شبكة البيانات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoRow icon={<Fingerprint className="w-4 h-4" />} label="الاسم الكامل" value={doc.fullName} />
                  <InfoRow icon={<Hash className="w-4 h-4" />} label="رقم الهوية / الإقامة" value={doc.idNumber} mono />
                  <InfoRow icon={<FileText className="w-4 h-4" />} label="نوع الوثيقة" value={doc.docType} />
                  {doc.nationality ? (
                    <InfoRow icon={<Globe className="w-4 h-4" />} label="الجنسية" value={doc.nationality} />
                  ) : null}
                  <InfoRow icon={<CalendarDays className="w-4 h-4" />} label="تاريخ الإصدار" value={formatDateAr(doc.issueDate)} />
                  <InfoRow icon={<Clock className="w-4 h-4" />} label="تاريخ الانتهاء" value={doc.expiryDate ? formatDateAr(doc.expiryDate) : "غير محدد"} />
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Hash className="w-4 h-4 text-teal-700" />
                    الرقم المرجعي:
                    <span className="font-mono font-bold text-teal-800" dir="ltr">
                      {doc.refNumber}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-teal-300 text-teal-700 bg-teal-50">
                    مصدرها: منصة شهّر للتوثيق
                  </Badge>
                </div>

                {doc.notes ? (
                  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                    <span className="font-bold">ملاحظات: </span>
                    {doc.notes}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full shadow-md overflow-hidden border-red-200">
              <div className="bg-red-50 border-b border-red-200 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-red-900">لم يتم العثور على وثيقة</h3>
                  <p className="text-red-700 text-sm">
                    {result.message || "لا توجد وثيقة مطابقة للرقم المدخل في سجل المنصة"}
                  </p>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    تأكد من كتابة الرقم المرجعي كما هو دون مسافات، أو تأكد من رقم الهوية. إذا كنت
                    تعتقد أن هذا خطأ، تواصل مع الجهة المصدرة للوثيقة.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
      <span className="text-teal-700 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p
          className={`font-bold text-slate-900 break-words ${mono ? "font-mono" : ""}`}
          dir={mono ? "ltr" : "rtl"}
          style={mono ? { textAlign: "right" } : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
