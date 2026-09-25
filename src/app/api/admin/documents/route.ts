import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, generateRefNumber } from "@/lib/auth";

// قائمة الوثائق + الإحصائيات (للإدارة)
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  try {
    const documents = await db.document.findMany({ orderBy: { createdAt: "desc" } });

    const now = new Date();
    const stats = {
      total: documents.length,
      valid: documents.filter((d) => d.status === "سارية" && (!d.expiryDate || new Date(d.expiryDate) >= now)).length,
      expired: documents.filter((d) => d.status === "منتهية" || (d.expiryDate && new Date(d.expiryDate) < now && d.status === "سارية")).length,
      revoked: documents.filter((d) => d.status === "ملغاة").length,
    };

    return NextResponse.json({ documents, stats });
  } catch (e) {
    console.error("admin list error", e);
    return NextResponse.json({ message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

// إنشاء وثيقة جديدة
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  try {
    const b = await req.json();

    if (!b?.fullName || !b?.idNumber || !b?.docType || !b?.issueDate) {
      return NextResponse.json(
        { message: "الحقول المطلوبة: الاسم، رقم الهوية، نوع الوثيقة، تاريخ الإصدار" },
        { status: 400 }
      );
    }

    // توليد رقم مرجعي فريد
    let refNumber = b.refNumber?.toString().trim() || "";
    if (!refNumber) {
      for (let i = 0; i < 10; i++) {
        const candidate = generateRefNumber();
        const exists = await db.document.findUnique({ where: { refNumber: candidate } });
        if (!exists) {
          refNumber = candidate;
          break;
        }
      }
    } else {
      const exists = await db.document.findUnique({ where: { refNumber } });
      if (exists) {
        return NextResponse.json({ message: "الرقم المرجعي مستخدم مسبقاً" }, { status: 400 });
      }
    }

    const document = await db.document.create({
      data: {
        refNumber,
        fullName: b.fullName.toString().trim(),
        nameEn: b.nameEn?.toString().trim() || null,
        idNumber: b.idNumber.toString().trim(),
        nationality: b.nationality?.toString().trim() || null,
        nationalityEn: b.nationalityEn?.toString().trim() || null,
        employer: b.employer?.toString().trim() || null,
        doctorName: b.doctorName?.toString().trim() || null,
        doctorNameEn: b.doctorNameEn?.toString().trim() || null,
        specialty: b.specialty?.toString().trim() || null,
        specialtyEn: b.specialtyEn?.toString().trim() || null,
        docType: b.docType.toString(),
        docTitle: b.docTitle?.toString().trim() || null,
        issueDate: new Date(b.issueDate),
        expiryDate: b.expiryDate ? new Date(b.expiryDate) : null,
        status: b.status?.toString() || "سارية",
        notes: b.notes?.toString().trim() || null,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (e) {
    console.error("admin create error", e);
    return NextResponse.json({ message: "خطأ في إنشاء الوثيقة" }, { status: 500 });
  }
}
