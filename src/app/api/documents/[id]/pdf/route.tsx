import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthorized, formatDateAr } from "@/lib/auth";
import QRCode from "qrcode";
import path from "path";
import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Font, Link } from "@react-pdf/renderer";

export const runtime = "nodejs";

// تسجيل الخطوط العربية (بمسار الملف — لا يقبل react-pdf كائن Buffer)
// مع حماية من التسجيل المكرر عند إعادة تحميل الوحدة أثناء التطوير
const fontsDir = path.join(process.cwd(), "src", "fonts");
const globalAny = globalThis as unknown as { __shaherFontsRegistered?: boolean };
if (!globalAny.__shaherFontsRegistered) {
  // إزالة أي تسجيلات سابقة عالقة للعائلة قبل التسجيل
  try {
    const registered = (Font as unknown as { getRegisteredFonts?: () => Record<string, unknown> })
      .getRegisteredFonts?.();
    if (registered && "Naskh" in registered) {
      delete registered["Naskh"];
    }
  } catch {
    // تجاهل أي خطأ في التنظيف
  }
  Font.register({
    family: "Naskh",
    fonts: [
      { src: path.join(fontsDir, "NotoNaskhArabic-Regular.ttf") },
      { src: path.join(fontsDir, "NotoNaskhArabic-Bold.ttf"), fontWeight: 700 },
    ],
  });
  globalAny.__shaherFontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Naskh",
    fontSize: 11,
    padding: 0,
    backgroundColor: "#ffffff",
  },
  borderOuter: {
    margin: 18,
    borderWidth: 2.5,
    borderColor: "#0f766e",
    borderRadius: 10,
    height: "96%",
  },
  borderInner: {
    margin: 6,
    borderWidth: 1,
    borderColor: "#14b8a6",
    borderRadius: 7,
    height: "98.6%",
    padding: 24,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f766e",
    marginBottom: 18,
  },
  brandBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#0f766e",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  brandLogoText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 700,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f766e",
  },
  brandSub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  refBadge: {
    backgroundColor: "#f0fdfa",
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refLabel: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
  refValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f766e",
    textAlign: "center",
    marginTop: 2,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  docTypeTitle: {
    fontSize: 19,
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "center",
  },
  docTitleText: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
  },
  introText: {
    fontSize: 11,
    color: "#334155",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 1.8,
  },
  table: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  rowLabel: {
    width: "28%",
    backgroundColor: "#f0fdfa",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: 700,
    color: "#0f766e",
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },
  rowValue: {
    width: "72%",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#0f172a",
  },
  statusSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 700,
  },
  footer: {
    flexDirection: "row",
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrBox: {
    alignItems: "center",
  },
  qrImage: {
    width: 86,
    height: 86,
  },
  verifySection: {
    flex: 1,
    marginRight: 16,
    alignItems: "center",
  },
  verifyTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f766e",
    textAlign: "center",
  },
  verifyText: {
    fontSize: 9,
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 1.6,
  },
  verifyLink: {
    fontSize: 9,
    color: "#0369a1",
    textAlign: "center",
    marginTop: 3,
  },
  notesBox: {
    marginTop: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 10,
  },
  notesText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.7,
  },
});

interface DocData {
  refNumber: string;
  fullName: string;
  idNumber: string;
  nationality?: string | null;
  docType: string;
  docTitle?: string | null;
  issueDate: Date;
  expiryDate?: Date | null;
  status: string;
  notes?: string | null;
}

function Certificate({ doc, qrDataUrl, baseUrl }: { doc: DocData; qrDataUrl: string; baseUrl: string }) {
  const statusColor =
    doc.status === "سارية" ? "#15803d" : doc.status === "ملغاة" ? "#b91c1c" : "#b45309";
  const statusBg =
    doc.status === "سارية" ? "#f0fdf4" : doc.status === "ملغاة" ? "#fef2f2" : "#fffbeb";

  const rows: Array<[string, string]> = [
    ["الاسم الكامل", doc.fullName],
    ["رقم الهوية / الإقامة", doc.idNumber],
  ];
  if (doc.nationality) rows.push(["الجنسية", doc.nationality]);
  rows.push(["نوع الوثيقة", doc.docType]);
  if (doc.docTitle) rows.push(["عنوان الوثيقة", doc.docTitle]);
  rows.push(["تاريخ الإصدار", formatDateAr(doc.issueDate)]);
  if (doc.expiryDate) rows.push(["تاريخ الانتهاء", formatDateAr(doc.expiryDate)]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            {/* الترويسة */}
            <View style={styles.header}>
              <View style={styles.brandBox}>
                <View style={styles.brandLogo}>
                  <Text style={styles.brandLogoText}>ش</Text>
                </View>
                <View>
                  <Text style={styles.brandName}>شهّر | Shaher Verify</Text>
                  <Text style={styles.brandSub}>نظام إصدار وتوثيق الوثائق والشهادات</Text>
                </View>
              </View>
              <View style={styles.refBadge}>
                <Text style={styles.refLabel}>الرقم المرجعي</Text>
                <Text style={styles.refValue}>{doc.refNumber}</Text>
              </View>
            </View>

            {/* العنوان */}
            <View style={styles.titleSection}>
              <Text style={styles.docTypeTitle}>{doc.docType}</Text>
              {doc.docTitle ? <Text style={styles.docTitleText}>« {doc.docTitle} »</Text> : null}
              <Text style={styles.introText}>
                تشهد منصة شهّر للتوثيق بأن البيانات الموضحة أدناه صادرة ومسجلة لدى النظام، ويمكن
                التحقق من صحتها في أي وقت عبر الرقم المرجعي أو مسح رمز الاستجابة السريعة الموجود في
                أسفل هذه الوثيقة.
              </Text>
            </View>

            {/* جدول البيانات */}
            <View style={styles.table}>
              {rows.map(([label, value], i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowValue}>{value}</Text>
                </View>
              ))}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>حالة الوثيقة</Text>
                <Text style={styles.rowValue}>{doc.status}</Text>
              </View>
            </View>

            {/* حالة الوثيقة */}
            <View style={styles.statusSection}>
              <View style={[styles.statusBadge, { backgroundColor: statusBg, borderWidth: 1, borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {doc.status === "سارية" ? "✓ وثيقة سارية وموثقة" : doc.status === "ملغاة" ? "✕ وثيقة ملغاة" : "وثيقة منتهية"}
                </Text>
              </View>
            </View>

            {/* ملاحظات */}
            {doc.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>ملاحظات: {doc.notes}</Text>
              </View>
            ) : null}

            {/* التذييل: QR + التحقق */}
            <View style={styles.footer}>
              <View style={styles.qrBox}>
                <Image style={styles.qrImage} src={qrDataUrl} alt="رمز الاستجابة السريعة للتحقق" />
                <Text style={{ fontSize: 8, color: "#64748b", marginTop: 3 }}>{doc.refNumber}</Text>
              </View>
              <View style={styles.verifySection}>
                <Text style={styles.verifyTitle}>للتحقق من صحة هذه الوثيقة</Text>
                <Text style={styles.verifyText}>
                  امسح رمز الاستجابة السريعة (QR) بالكاميرا، أو قم بزيارة صفحة التحقق في موقعنا
                  وأدخل الرقم المرجعي الموضح أعلاه
                </Text>
                <Link style={styles.verifyLink} src={baseUrl}>
                  {baseUrl}
                </Link>
              </View>
            </View>
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
      color: { dark: "#0f766e", light: "#ffffff" },
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
