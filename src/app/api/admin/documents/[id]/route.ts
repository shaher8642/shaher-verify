import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth";

// تحديث وثيقة
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const b = await req.json();

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "الوثيقة غير موجودة" }, { status: 404 });
    }

    const document = await db.document.update({
      where: { id },
      data: {
        fullName: b.fullName?.toString().trim() ?? existing.fullName,
        nameEn: b.nameEn !== undefined ? b.nameEn?.toString().trim() || null : existing.nameEn,
        idNumber: b.idNumber?.toString().trim() ?? existing.idNumber,
        nationality: b.nationality !== undefined ? b.nationality?.toString().trim() || null : existing.nationality,
        nationalityEn: b.nationalityEn !== undefined ? b.nationalityEn?.toString().trim() || null : existing.nationalityEn,
        employer: b.employer !== undefined ? b.employer?.toString().trim() || null : existing.employer,
        doctorName: b.doctorName !== undefined ? b.doctorName?.toString().trim() || null : existing.doctorName,
        doctorNameEn: b.doctorNameEn !== undefined ? b.doctorNameEn?.toString().trim() || null : existing.doctorNameEn,
        specialty: b.specialty !== undefined ? b.specialty?.toString().trim() || null : existing.specialty,
        specialtyEn: b.specialtyEn !== undefined ? b.specialtyEn?.toString().trim() || null : existing.specialtyEn,
        docType: b.docType?.toString() ?? existing.docType,
        docTitle: b.docTitle !== undefined ? b.docTitle?.toString().trim() || null : existing.docTitle,
        issueDate: b.issueDate ? new Date(b.issueDate) : existing.issueDate,
        expiryDate: b.expiryDate !== undefined ? (b.expiryDate ? new Date(b.expiryDate) : null) : existing.expiryDate,
        status: b.status?.toString() ?? existing.status,
        notes: b.notes !== undefined ? b.notes?.toString().trim() || null : existing.notes,
      },
    });

    return NextResponse.json({ document });
  } catch (e) {
    console.error("admin update error", e);
    return NextResponse.json({ message: "خطأ في تحديث الوثيقة" }, { status: 500 });
  }
}

// حذف وثيقة
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "الوثيقة غير موجودة" }, { status: 404 });
    }
    await db.document.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete error", e);
    return NextResponse.json({ message: "خطأ في حذف الوثيقة" }, { status: 500 });
  }
}
