export interface DocumentRecord {
  id: string;
  refNumber: string;
  fullName: string;
  nameEn?: string | null;
  idNumber: string;
  nationality?: string | null;
  nationalityEn?: string | null;
  employer?: string | null;
  doctorName?: string | null;
  doctorNameEn?: string | null;
  specialty?: string | null;
  specialtyEn?: string | null;
  docType: string;
  docTitle?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DOC_TYPE_OPTIONS = [
  "إجازة مرضية",
  "تقرير طبي",
  "شهادة لياقة طبية",
  "شهادة إتمام دورة تدريبية",
  "شهادة حضور ورشة عمل",
  "خطاب تعريف",
  "وثيقة تسليم واستلام",
];

export const STATUS_OPTIONS = ["سارية", "منتهية", "ملغاة"];

export function formatDateAr(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
