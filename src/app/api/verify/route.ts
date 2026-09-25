import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// واجهة التحقق العامة - البحث بالرقم المرجعي أو رقم الهوية
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body?.query || "").toString().trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { found: false, message: "الرجاء إدخال رقم صحيح (3 خانات على الأقل)" },
        { status: 400 }
      );
    }

    const document = await db.document.findFirst({
      where: {
        OR: [{ refNumber: query }, { idNumber: query }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!document) {
      return NextResponse.json({
        found: false,
        message: "لا توجد وثيقة مطابقة للرقم المدخل",
      });
    }

    // حساب الحالة الفعلية إذا كانت سارية منتهية التاريخ
    let effectiveStatus = document.status;
    if (document.status === "سارية" && document.expiryDate && new Date(document.expiryDate) < new Date()) {
      effectiveStatus = "منتهية";
    }

    return NextResponse.json({
      found: true,
      document: {
        refNumber: document.refNumber,
        fullName: document.fullName,
        idNumber: document.idNumber,
        nationality: document.nationality,
        docType: document.docType,
        docTitle: document.docTitle,
        issueDate: document.issueDate,
        expiryDate: document.expiryDate,
        status: effectiveStatus,
        notes: document.notes,
      },
    });
  } catch (e) {
    console.error("verify error", e);
    return NextResponse.json(
      { found: false, message: "حدث خطأ في الخدمة، حاول مرة أخرى" },
      { status: 500 }
    );
  }
}
