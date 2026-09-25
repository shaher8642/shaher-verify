import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/auth";

// تسجيل دخول الإدارة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = (body?.password || "").toString();

    if (password === getAdminPassword()) {
      return NextResponse.json({ ok: true, key: password });
    }
    return NextResponse.json(
      { ok: false, message: "كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ ok: false, message: "طلب غير صالح" }, { status: 400 });
  }
}
