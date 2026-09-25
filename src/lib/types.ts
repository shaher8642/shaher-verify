export interface DocumentRecord {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export const DOC_TYPE_OPTIONS = [
  "شهادة إتمام دورة تدريبية",
  "شهادة حضور ورشة عمل",
  "شهادة عضوية",
  "خطاب تعريف",
  "وثيقة تسليم واستلام",
  "شهادة خبرة عمل",
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
