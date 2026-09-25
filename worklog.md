# Worklog — Shaher Verify منصة توثيق الوثائق والشهادات

---
Task ID: 1
Agent: Main Agent (Super Z)
Task: بناء نظام إصدار وتوثيق وثائق وشهادات كامل (Shaher Verify) لصالح المستخدم

Work Log:
- تهيئة بيئة Next.js 16 عبر init-fullstack.sh
- تثبيت @react-pdf/renderer@4.9.0 + qrcode@1.5.4
- تحميل خطوط Noto Naskh Arabic (Regular + Bold) إلى src/fonts/
- إنشاء Prisma schema بنموذج Document (refNumber, fullName, idNumber, docType, issueDate, expiryDate, status...)
- بناء API:
  - POST /api/verify — تحقق عام بالرقم المرجعي أو رقم الهوية
  - POST /api/admin/login — دخول الإدارة (كلمة المرور من ADMIN_PASSWORD في .env = shaher2026)
  - GET/POST /api/admin/documents — قائمة + إنشاء مع توليد رقم مرجعي فريد SH-YYYY-XXXXXX
  - PUT/DELETE /api/admin/documents/[id] — تعديل وحذف
  - GET /api/documents/[id]/pdf — توليد شهادة PDF عربية بباركود QR ورابط تحقق
- بناء واجهة RTL عربية بخط Tajawal (صفحة واحدة بتبديل views):
  - VerifyView: بطاقة تحقق + نتيجة نجاح خضراء بجدول بيانات / نتيجة فشل حمراء
  - AdminView: إحصائيات + جدول وثائق + بحث + إضافة/تعديل/حذف + تنزيل PDF
  - LoginForm: دخول الإدارة
  - header + footer ثابت + قسم "كيف تعمل المنصة"
- دعم ?ref= في الرابط للتحقق التلقائي عند مسح QR
- إصلاح خطأ react-pdf: Buffer غير مقبول كـ src للخط — استبدال بمسارات ملفات + حماية من التسجيل المكرر (global flag + حذف العائلة القديمة)
- إعادة تشغيل السيرفر وتفريغ كاش .next لحل حالة الخطوط العالقة
- اختبار شامل بـ agent-browser: الصفحة الرئيسية، دخول الإدارة، إنشاء وثيقة، توليد PDF، التحقق بالرقم المرجعي، مسار QR، التجاوب مع الجوال — كلها ناجحة
- فحص بصري عبر VLM: الموقع (تصميم نظيف RTL سليم) + الشهادة (عربية متصلة صحيحة، تقييم 9/10)

Stage Summary:
- الموقع يعمل بالكامل على منفذ 3000
- وثيقة تجريبية موجودة: SH-2026-781848 — شاهر محمد عبدالله — شهادة إتمام دورة تدريبية
- كلمة مرور الإدارة: shaher2026 (قابلة للتغيير من .env)
- PDF شهادة عربي احترافي بإطار مزدوج + QR يعمل + جدول بيانات + حالة الوثيقة
- نقاط مهمة: react-pdf Font.register يقبل مسارات وليس Buffer؛ Font.register يضيف ولا يستبدل (لذلك الحماية المزدوجة)؛ إعادة تشغيل السيرفر مطلوبة بعد تغيير serverExternalPackages
