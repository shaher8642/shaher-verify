import { NextRequest } from "next/server";

// كلمة مرور الإدارة - يمكن تغييرها من متغير البيئة ADMIN_PASSWORD
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "shaher2026";
}

// التحقق من صلاحية طلب الإدارة عبر الترويسة
export function isAdminAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return !!key && key === getAdminPassword();
}

// توليد رقم مرجعي فريد للوثيقة
export function generateRefNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SH-${year}-${random}`;
}

// تنسيق التاريخ بالعربية
export function formatDateAr(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// أنواع الوثائق المتاحة
export const DOC_TYPES = [
  "شهادة إتمام دورة تدريبية",
  "شهادة حضور ورشة عمل",
  "شهادة عضوية",
  "خطاب تعريف",
  "وثيقة تسليم واستلام",
  "شهادة خبرة عمل",
] as const;
