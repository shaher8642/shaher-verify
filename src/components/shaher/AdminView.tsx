"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DocumentRecord, DOC_TYPE_OPTIONS, STATUS_OPTIONS, formatDateAr } from "@/lib/types";
import {
  Lock,
  LogOut,
  Plus,
  FileDown,
  Trash2,
  Pencil,
  FileStack,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Copy,
  FileText,
} from "lucide-react";

interface Stats {
  total: number;
  valid: number;
  expired: number;
  revoked: number;
}

const emptyForm = {
  fullName: "",
  idNumber: "",
  nationality: "",
  docType: DOC_TYPE_OPTIONS[0],
  docTitle: "",
  issueDate: "",
  expiryDate: "",
  status: "سارية",
  notes: "",
};

export default function AdminView({
  adminKey,
  onLogout,
}: {
  adminKey: string;
  onLogout: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, valid: 0, expired: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const authHeaders = {
    "Content-Type": "application/json",
    "x-admin-key": adminKey,
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/documents", { headers: { "x-admin-key": adminKey } });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
      setStats(data.stats || { total: 0, valid: 0, expired: 0, revoked: 0 });
    } catch {
      console.error("failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [adminKey, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, issueDate: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(doc: DocumentRecord) {
    setEditing(doc);
    setForm({
      fullName: doc.fullName,
      idNumber: doc.idNumber,
      nationality: doc.nationality || "",
      docType: doc.docType,
      docTitle: doc.docTitle || "",
      issueDate: doc.issueDate.slice(0, 10),
      expiryDate: doc.expiryDate ? doc.expiryDate.slice(0, 10) : "",
      status: doc.status,
      notes: doc.notes || "",
    });
    setFormError("");
    setDialogOpen(true);
  }

  async function save() {
    if (!form.fullName.trim() || !form.idNumber.trim() || !form.issueDate) {
      setFormError("الرجاء تعبئة الحقول المطلوبة: الاسم، رقم الهوية، تاريخ الإصدار");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/documents/${editing.id}` : "/api/admin/documents";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...form,
          expiryDate: form.expiryDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "فشل حفظ الوثيقة");
        return;
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError("تعذر الاتصال بالخدمة");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الوثيقة نهائياً؟")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  const filtered = documents.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.idNumber.includes(q) ||
      d.refNumber.toLowerCase().includes(q) ||
      d.docType.includes(q)
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* شريط الأدوات */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-slate-900">لوحة إدارة الوثائق</h2>
          <Badge className="bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-100">
            {stats.total} وثيقة
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={openCreate}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة وثيقة جديدة
          </Button>
          <Button variant="outline" onClick={onLogout} className="border-slate-300">
            <LogOut className="w-4 h-4 ml-1" />
            خروج
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<FileStack className="w-5 h-5" />} label="إجمالي الوثائق" value={stats.total} color="bg-slate-100 text-slate-700" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="وثائق سارية" value={stats.valid} color="bg-emerald-100 text-emerald-700" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label="وثائق منتهية" value={stats.expired} color="bg-amber-100 text-amber-700" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="وثائق ملغاة" value={stats.revoked} color="bg-red-100 text-red-700" />
      </div>

      {/* جدول الوثائق */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">سجل الوثائق الصادرة</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
              <span className="mr-2 text-slate-500">جارٍ تحميل السجل...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold">لا توجد وثائق بعد</p>
              <p className="text-sm mt-1">ابدأ بإضافة أول وثيقة من زر «إضافة وثيقة جديدة»</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-slate-50 z-10">
                  <TableRow>
                    <TableHead className="text-right">الرقم المرجعي</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">رقم الهوية</TableHead>
                    <TableHead className="text-right">نوع الوثيقة</TableHead>
                    <TableHead className="text-right">الإصدار</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id} className="hover:bg-teal-50/40">
                      <TableCell>
                        <button
                          onClick={() => navigator.clipboard?.writeText(d.refNumber)}
                          className="font-mono text-teal-800 hover:text-teal-600 flex items-center gap-1"
                          dir="ltr"
                          title="نسخ الرقم"
                        >
                          {d.refNumber}
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 max-w-40 truncate">{d.fullName}</TableCell>
                      <TableCell dir="ltr" className="text-left font-mono">{d.idNumber}</TableCell>
                      <TableCell className="max-w-44 truncate">{d.docType}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDateAr(d.issueDate)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${
                            d.status === "سارية"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : d.status === "ملغاة"
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`/api/documents/${d.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="عرض / تنزيل PDF"
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                            >
                              <FileDown className="w-4 h-4" />
                            </Button>
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(d)}
                            title="تعديل"
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={deleting === d.id}
                            onClick={() => remove(d.id)}
                            title="حذف"
                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            {deleting === d.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة / تعديل */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg text-slate-900">
              {editing ? "تعديل الوثيقة" : "إصدار وثيقة جديدة"}
            </DialogTitle>
            {editing ? (
              <p className="text-xs text-slate-500 font-mono" dir="ltr">
                {editing.refNumber}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                سيتم توليد رقم مرجعي فريد تلقائياً عند الحفظ
              </p>
            )}
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="مثال: شاهر محمد أحمد"
              />
            </div>
            <div>
              <Label>رقم الهوية / الإقامة *</Label>
              <Input
                dir="ltr"
                className="text-left font-mono"
                value={form.idNumber}
                onChange={(e) => setForm({ ...form, idNumber: e.target.value.replace(/[^\d]/g, "") })}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label>الجنسية</Label>
              <Input
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                placeholder="مثال: سعودي / يمني"
              />
            </div>
            <div>
              <Label>نوع الوثيقة *</Label>
              <Select
                value={form.docType}
                onValueChange={(v) => setForm({ ...form, docType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عنوان الوثيقة / اسم الدورة</Label>
              <Input
                value={form.docTitle}
                onChange={(e) => setForm({ ...form, docTitle: e.target.value })}
                placeholder="مثال: دورة أساسيات البرمجة"
              />
            </div>
            <div>
              <Label>تاريخ الإصدار *</Label>
              <Input
                type="date"
                dir="ltr"
                className="text-left"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div>
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Input
                type="date"
                dir="ltr"
                className="text-left"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
            <div>
              <Label>حالة الوثيقة</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي تفاصيل إضافية تظهر في الوثيقة وصفحة التحقق"
                rows={2}
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {formError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={saving} className="bg-teal-700 hover:bg-teal-800 text-white font-bold">
              {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              {editing ? "حفظ التعديلات" : "إصدار الوثيقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
