import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth";
import QRCode from "qrcode";
import path from "path";
import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Font, Link } from "@react-pdf/renderer";

export const runtime = "nodejs";

// تسجيل خط Tajawal (نفس خط الموقع) — مطابق لتصميم الشهادة المرجعية
const fontsDir = path.join(process.cwd(), "src", "fonts");
const globalAny = globalThis as unknown as { __shaherTajawalRegistered?: boolean };
if (!globalAny.__shaherTajawalRegistered) {
  try {
    const registered = (Font as unknown as { getRegisteredFonts?: () => Record<string, unknown> })
      .getRegisteredFonts?.();
    if (registered && "Tajawal" in registered) {
      delete registered["Tajawal"];
    }
  } catch {
    // تجاهل
  }
  Font.register({
    family: "Tajawal",
    fonts: [
      { src: path.join(fontsDir, "Tajawal-Regular.ttf") },
      { src: path.join(fontsDir, "Tajawal-Bold.ttf"), fontWeight: 700 },
    ],
  });
  globalAny.__shaherTajawalRegistered = true;
}

// ===== الألوان المستخرجة بالبكسل من التصميم المرجعي =====
const C = {
  navy: "#23316c",      // صف مدة الإجازة (الأزرق الداكن) — معاين بالبكسل 35,49,108
  headerBlue: "#416c9f", // نصوص التسميات — معاين بالبكسل 65,108,159
  value: "#4a526e",      // نصوص القيم — معاين بالبكسل 74,82,110
  gray: "#f2f4f7",      // خلفية الصفوف المتناوبة
  border: "#cdd5df",    // حدود الجدول
  link: "#0b5fff",      // رابط التحقق
};

// ===== أدوات التاريخ =====
const GREG_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit", month: "2-digit", year: "numeric",
  timeZone: "UTC",
});
const HIJRI_FMT = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  day: "numeric", month: "numeric", year: "numeric",
  timeZone: "UTC",
});
const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric", minute: "2-digit", hour12: true,
});
const LONG_DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
  timeZone: "UTC",
});

function toUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
function greg(d: Date): string {
  return GREG_FMT.format(toUTC(d)).replace(/\//g, "-"); // DD-MM-YYYY
}
function hijri(d: Date): string {
  // استخراج الأجزاء بدقة (يوم-شهر-سنة) من تقويم أم القرى
  const parts = HIJRI_FMT.formatToParts(toUTC(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const day = get("day").padStart(2, "0");
  const month = get("month").padStart(2, "0");
  const year = get("year");
  return `${day}-${month}-${year}`;
}
function daysBetween(start: Date, end: Date): number {
  const s = toUTC(start).getTime();
  const e = toUTC(end).getTime();
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

// خريطة الجنسيات الشائعة (عربي → إنجليزي)
const NAT_MAP: Record<string, string> = {
  "السعودية": "Saudi Arabia", "سعودي": "Saudi Arabia", "سعودية": "Saudi Arabia",
  "اليمن": "Yemen", "يمني": "Yemen", "يمنية": "Yemen",
  "مصر": "Egypt", "مصري": "Egypt", "مصرية": "Egypt",
  "الإمارات": "United Arab Emirates", "الكويت": "Kuwait", "قطر": "Qatar",
  "البحرين": "Bahrain", "عمان": "Oman", "الأردن": "Jordan",
  "سوريا": "Syria", "السودان": "Sudan", "لبنان": "Lebanon",
  "المغرب": "Morocco", "الجزائر": "Algeria", "تونس": "Tunisia",
  "ليبيا": "Libya", "العراق": "Iraq", "فلسطين": "Palestine",
  "باكستان": "Pakistan", "الهند": "India", "بنغلاديش": "Bangladesh",
  "الفلبين": "Philippines", "إندونيسيا": "Indonesia", "سريلانكا": "Sri Lanka",
  "النيبال": "Nepal", "أفغانستان": "Afghanistan", "إيران": "Iran",
  "تركيا": "Turkey", "أمريكا": "United States", "بريطانيا": "United Kingdom",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Tajawal",
    fontSize: 10,
    padding: 26,
    backgroundColor: "#ffffff",
  },
  // ===== الجدول =====
  table: {
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    minHeight: 30,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cellLabelAr: {
    width: "22%",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    textAlign: "center",
    color: C.headerBlue,
    fontSize: 10.5,
  },
  cellValue: {
    width: "48%",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    justifyContent: "center",
  },
  cellLabelEn: {
    width: "30%",
    paddingVertical: 7,
    paddingHorizontal: 10,
    textAlign: "center",
    color: C.headerBlue,
    fontSize: 10.5,
  },
  // صف مدة الإجازة المميز
  rowNavy: {
    backgroundColor: C.navy,
  },
  navyLabelAr: {
    color: "#ffffff",
    fontWeight: 700,
  },
  navyLabelEn: {
    color: "#ffffff",
    fontWeight: 700,
  },
  navyValue: {
    color: "#ffffff",
    fontWeight: 700,
  },
  // داخل خلية القيمة: إنجليزي يسار + عربي يمين
  valueSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valueEn: {
    flex: 1,
    fontSize: 10.5,
    color: C.value,
    textAlign: "left",
    paddingRight: 8,
  },
  valueAr: {
    flex: 1,
    fontSize: 10.5,
    color: C.value,
    textAlign: "right",
    paddingLeft: 8,
  },
  valueSingle: {
    fontSize: 10.5,
    color: C.value,
    textAlign: "center",
  },
  // ===== الجزء السفلي =====
  bottom: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "flex-start",
  },
  qrCol: {
    width: "58%",
    borderRightWidth: 1,
    borderRightColor: C.border,
    alignItems: "center",
    paddingLeft: 6,
    paddingRight: 14,
    paddingBottom: 4,
  },
  qrImage: {
    width: 84,
    height: 84,
    marginBottom: 8,
  },
  verifyBlock: {
    width: "100%",
    alignItems: "center",
  },
  verifyTextAr: {
    fontSize: 9.5,
    color: C.value,
    textAlign: "center",
    lineHeight: 1.7,
  },
  verifyTextEn: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
  },
  verifyLink: {
    fontSize: 9,
    color: C.link,
    textAlign: "center",
    marginTop: 3,
    textDecoration: "underline",
  },
  stampRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 12,
  },
  stampBlock: {},
  stampTime: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000000",
    textAlign: "left",
  },
  stampDate: {
    fontSize: 9.5,
    color: "#000000",
    textAlign: "left",
    marginTop: 2,
  },
  logoCol: {
    width: "42%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 10,
  },
  logoImage: {
    width: 165,
    height: "auto",
  },
});

interface DocData {
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
  issueDate: Date;
  expiryDate?: Date | null;
  createdAt: Date;
}

/** صف عادي: تسمية عربية يمين | قيمة وسط | تسمية إنجليزية يسار */
function Row({
  labelAr, labelEn, children, navy, gray, last,
}: {
  labelAr: string; labelEn: string; children: React.ReactNode; navy?: boolean; gray?: boolean; last?: boolean;
}) {
  return (
    <View style={[styles.row, navy ? styles.rowNavy : gray ? { backgroundColor: C.gray } : null, last ? styles.rowLast : null]}>
      <Text style={[styles.cellLabelEn, navy ? styles.navyLabelEn : null]}>{labelEn}</Text>
      <View style={[styles.cellValue, navy ? styles.rowNavy : null]}>{children}</View>
      <Text style={[styles.cellLabelAr, navy ? styles.navyLabelAr : null]}>{labelAr}</Text>
    </View>
  );
}

/** قيمة ثنائية: إنجليزي يسار / عربي يمين */
function SplitValue({ en, ar, navy }: { en?: string | null; ar?: string | null; navy?: boolean }) {
  const enTxt = (en || "").trim();
  const arTxt = (ar || "").trim();
  if (enTxt && arTxt && enTxt !== arTxt) {
    return (
      <View style={styles.valueSplit}>
        <Text style={[styles.valueEn, navy ? styles.navyValue : null]}>{enTxt}</Text>
        <Text style={[styles.valueAr, navy ? styles.navyValue : null]}>{arTxt}</Text>
      </View>
    );
  }
  const single = arTxt || enTxt || "—";
  return <Text style={[styles.valueSingle, navy ? styles.navyValue : null]}>{single}</Text>;
}

function Certificate({ doc, qrDataUrl, baseUrl }: { doc: DocData; qrDataUrl: string; baseUrl: string }) {
  const now = new Date();
  const natEn = (doc.nationalityEn || "").trim() || NAT_MAP[(doc.nationality || "").trim()] || "";
  const duration = doc.expiryDate ? daysBetween(doc.issueDate, doc.expiryDate) : null;

  const durEn = duration
    ? `${duration} day${duration > 1 ? "s" : ""} ( ${greg(doc.issueDate)} to ${greg(doc.expiryDate!)} )`
    : "—";
  const durAr = duration
    ? `${duration} يوم ( ${hijri(doc.issueDate)} إلى ${hijri(doc.expiryDate!)} )`
    : "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* الجدول الرئيسي — 3 أعمدة × 11 صف */}
        <View style={styles.table}>
          {/* 1. رقم الإجازة */}
          <Row labelAr="رقم الإجازة" labelEn="Leave ID">
            <Text style={styles.valueSingle}>{doc.refNumber}</Text>
          </Row>

          {/* 2. مدة الإجازة — الصف المميز */}
          <Row labelAr="مدة الإجازة" labelEn="Leave Duration" navy>
            <View style={styles.valueSplit}>
              <Text style={[styles.valueEn, styles.navyValue]}>{durEn}</Text>
              <Text style={[styles.valueAr, styles.navyValue]}>{durAr}</Text>
            </View>
          </Row>

          {/* 3. تاريخ الدخول */}
          <Row labelAr="تاريخ الدخول" labelEn="Admission Date">
            <View style={styles.valueSplit}>
              <Text style={styles.valueEn}>{greg(doc.issueDate)}</Text>
              <Text style={styles.valueAr}>{hijri(doc.issueDate)}</Text>
            </View>
          </Row>

          {/* 4. تاريخ الخروج */}
          <Row labelAr="تاريخ الخروج" labelEn="Discharge Date" gray>
            {doc.expiryDate ? (
              <View style={styles.valueSplit}>
                <Text style={styles.valueEn}>{greg(doc.expiryDate)}</Text>
                <Text style={styles.valueAr}>{hijri(doc.expiryDate)}</Text>
              </View>
            ) : (
              <Text style={styles.valueSingle}>—</Text>
            )}
          </Row>

          {/* 5. تاريخ إصدار الإذن */}
          <Row labelAr="تاريخ إصدار الإذن" labelEn="Issue Date">
            <View style={styles.valueSplit}>
              <Text style={styles.valueEn}>{greg(doc.createdAt)}</Text>
              <Text style={styles.valueAr}>{hijri(doc.createdAt)}</Text>
            </View>
          </Row>

          {/* 6. الاسم */}
          <Row labelAr="الاسم" labelEn="Name" gray>
            <SplitValue en={doc.nameEn} ar={doc.fullName} />
          </Row>

          {/* 7. رقم الهوية / الإقامة */}
          <Row labelAr="رقم الهوية / الإقامة" labelEn="National ID / Iqama">
            <Text style={styles.valueSingle}>{doc.idNumber}</Text>
          </Row>

          {/* 8. الجنسية */}
          <Row labelAr="الجنسية" labelEn="Nationality" gray>
            <SplitValue en={natEn} ar={doc.nationality} />
          </Row>

          {/* 9. جهة العمل */}
          <Row labelAr="جهة العمل" labelEn="Employer">
            <Text style={styles.valueSingle}>{doc.employer?.trim() || "—"}</Text>
          </Row>

          {/* 10. اسم الطبيب */}
          <Row labelAr="اسم الطبيب" labelEn="Physician Name" gray>
            <SplitValue en={doc.doctorNameEn} ar={doc.doctorName} />
          </Row>

          {/* 11. التخصص الطبي */}
          <Row labelAr="التخصص الطبي" labelEn="Position" last>
            <SplitValue en={doc.specialtyEn} ar={doc.specialty} />
          </Row>
        </View>

        {/* الجزء السفلي: QR + نصوص (يسار) | الشعارات (يمين) */}
        <View style={styles.bottom}>
          <View style={styles.qrCol}>
            <Image style={styles.qrImage} src={qrDataUrl} alt="رمز الاستجابة السريعة للتحقق" />
            <View style={styles.verifyBlock}>
              <Text style={styles.verifyTextAr}>
                للتأكد من صحة التقرير يرجى زيارة الموقع الرسمي لمنصة شهّر
              </Text>
              <Text style={styles.verifyTextEn}>
                To check the report please visit Shaher's official website
              </Text>
              <Link style={styles.verifyLink} src={baseUrl}>
                {baseUrl}
              </Link>
            </View>
            <View style={styles.stampRow}>
              <View style={styles.stampBlock}>
                <Text style={styles.stampTime}>{TIME_FMT.format(now)}</Text>
                <Text style={styles.stampDate}>{LONG_DATE_FMT.format(now)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.logoCol}>
            <Image
              style={styles.logoImage}
              src={path.join(process.cwd(), "public", "pdf-logo-block.png")}
              alt="Ministry of Health - Shaher Hospital - NHIC"
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const document = await db.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ message: "الوثيقة غير موجودة" }, { status: 404 });
    }

    // بناء رابط التحقق من أصل الطلب
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
    const baseUrl = `${proto}://${host}/?ref=${encodeURIComponent(document.refNumber)}`;

    // توليد رمز QR
    const qrDataUrl = await QRCode.toDataURL(baseUrl, {
      width: 300,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const { renderToBuffer } = await import("@react-pdf/renderer");
    const buffer = await renderToBuffer(
      <Certificate doc={document} qrDataUrl={qrDataUrl} baseUrl={baseUrl} />
    );

    const fileName = `${document.refNumber}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("pdf error", e);
    console.error("STACK:", (e as Error)?.stack);
    return NextResponse.json({ message: "خطأ في توليد الملف" }, { status: 500 });
  }
}
