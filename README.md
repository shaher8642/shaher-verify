# شهّر | Shaher Verify — منصة توثيق الوثائق والشهادات

نظام ويب متكامل لإصدار وتوثيق الوثائق والشهادات (شهادات دورات تدريبية، شهادات حضور، خطابات تعريف، وثائق تسليم واستلام) مع إمكانية التحقق العام عبر رقم مرجعي أو رمز QR.

> منصة مستقلة بهويتها وتصميمها الخاص، غير مرتبطة بأي جهة حكومية أو رسمية.

## المزايا

- **إدارة كاملة للوثائق**: إضافة وتعديل وحذف مع بحث فوري وإحصائيات
- **توليد شهادات PDF عربية احترافية** بإطار مزدوج ورمز QR للتحقق
- **تحقق عام فوري** بالرقم المرجعي أو رقم الهوية مع تمييز الوثائق السارية / المنتهية / الملغاة
- **واجهة عربية RTL** بالكامل بتصميم متجاوب مع الجوال

## التقنيات

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- Prisma ORM + SQLite
- @react-pdf/renderer لتوليد شهادات PDF عربية بخطوط Noto Naskh Arabic
- qrcode لتوليد رموز التحقق

## التشغيل المحلي

```bash
npm install
cp .env.example .env   # أو أنشئ .env يدوياً
npm run db:push        # تهيئة قاعدة البيانات
npm run dev
```

متغيرات البيئة:

| المتغير | الوصف | الافتراضي |
|---------|-------|----------|
| `DATABASE_URL` | مسار قاعدة بيانات SQLite | — |
| `ADMIN_PASSWORD` | كلمة مرور لوحة الإدارة | `shaher2026` |

## البنية

```
src/
  app/                  الصفحات و API Routes
    api/verify          التحقق العام (POST)
    api/admin/*         واجهات الإدارة (محمية بترويسة x-admin-key)
    api/documents/[id]/pdf   توليد شهادة PDF مع QR
  components/shaher/    مكونات الواجهة (Verify, Admin, Login)
  lib/                  الأدوات المشتركة (db, auth, types)
prisma/schema.prisma   مخطط قاعدة البيانات
db/custom.db           قاعدة البيانات
```

## النشر على Render

1. ارفع المستودع إلى GitHub
2. أنشئ Web Service جديد (Free) واربطه بالمستودع
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. متغيرات البيئة: `DATABASE_URL=file:/opt/render/project/src/db/custom.db` و `ADMIN_PASSWORD`

> ملاحظة: النطاق المجاني في Render يفقد بيانات القرص عند كل نشر جديد — أعد الرفع مع `db/custom.db` محدثاً أو اربط قاعدة بيانات خارجية للثبات الدائم.
