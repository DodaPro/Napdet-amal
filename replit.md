# مساحة العمل

## نظرة عامة

مساحة عمل monorepo باستخدام pnpm و TypeScript. هذا منصة تبرعات صغيرة تسمى "نبضة أمل" (Pulse of Hope) — منصة لتمويل العمليات الطبية العاجلة عبر التبرعات الصغيرة (شراء أسهم من المبلغ المستهدف بالجنيه المصري).

## التقنيات المستخدمة

- **أداة Monorepo**: pnpm workspaces
- **إصدار Node.js**: 24
- **مدير الحزم**: pnpm
- **إصدار TypeScript**: 5.9
- **إطار العمل للـ API**: Express 5
- **قاعدة البيانات**: PostgreSQL + Drizzle ORM
- **التحقق من الصحة**: Zod (`zod/v4`), `drizzle-zod`
- **توليد كود الـ API**: Orval (من مواصفة OpenAPI)
- **البناء**: esbuild (حزمة CJS)
- **الواجهة الأمامية**: React + Vite + Tailwind CSS + Wouter (التوجيه)

## المخرجات

- **charity-web** (`artifacts/charity-web/`) — التطبيق الرئيسي بالعربية RTL على `/`
- **api-server** (`artifacts/api-server/`) — خادم Express API على `/api`

## الأوامر الرئيسية

- `pnpm run typecheck` — فحص نوع كامل عبر جميع الحزم
- `pnpm run build` — فحص نوع + بناء جميع الحزم
- `pnpm --filter @workspace/api-spec run codegen` — إعادة توليد hooks الـ API و مخططات Zod من مواصفة OpenAPI
- `pnpm --filter @workspace/db run push` — دفع تغييرات مخطط قاعدة البيانات (تطوير فقط)
- `pnpm --filter @workspace/api-server run dev` — تشغيل خادم الـ API محليًا

## مخطط قاعدة البيانات

- **cases** — الحالات الطبية مع المبالغ المستهدفة/المجموعة، الأسهم، مستوى الإلحاح، الحالة (نشط/ممول/مغلق)
- **donations** — التبرعات المرتبطة بالحالات؛ موسعة بـ paymentMethod (vodafone_cash/null), paymentStatus (pending/approved/rejected), transferScreenshotUrl, senderPhone
- **votes** — أصوات المجتمع على النفقات الإضافية لكل حالة (عدد نعم/لا، مفتوح/مغلق)
- **users** — مستخدمو المنصة مع الأدوار: super_admin, sub_admin, moderator, donor
- **case_submissions** — طلبات تقديم الحالات العامة (submitterName, phone, address, caseDetails, status: pending/approved/rejected)
- **notifications** — إشعارات الإدارة/المستخدم (type, title, message, recipientId null=بث إداري, relatedId, isRead)
- **case_messages** — رسائل لوحة المجتمع لكل حالة (authorId FK users, type: message|vote_request, content, voteTitle, voteExpense)

## تصميم UI/UX

- اللغة: العربية (RTL, `dir="rtl"`)
- العملة: جنيه (EGP)
- لوحة الألوان: أزرق ثقة عميق (أساسي), أخضر زمردي (ثانوي/نجاح), خلفية بيضاء
- الخط: Tajawal (عربي أولاً)
- لا إيموجي في الواجهة

## المصادقة والصلاحيات

- **مصادقة قائمة على الجلسة** — express-session, ليس Firebase Auth
- الأدوار: `super_admin`, `sub_admin`, `moderator`, `donor`
- بريد الإدارة العليا: `mahmoudalgdawy@gmail.com` (يتم تعيينه تلقائيًا عند التسجيل)
- مكون `ProtectedRoute` يحمي صفحات الإدارة (يعيد توجيه إلى `/login` إذا غير مصادق)
- `isAdminRole()` يرجع true لـ super_admin, sub_admin, admin, moderator
- سياق المصادقة: `src/contexts/AuthContext.tsx`
- Firebase لا يزال مستخدمًا لـ: رسائل Firestore (لوحة المجتمع), أخبار Firestore, Firebase Storage (رفع قديم)
- Cloudinary مستخدم لرفع صور لقطات التبرعات (env: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)

## الصفحات

- `/` — الرئيسية: Hero + شبكة بطاقات الحالات النشطة + نافذة تقديم "إضافة حالة" عامة
- `/cases/:id` — تفاصيل الحالة: قصة الحالة, محدد الأسهم, نافذة دفع Vodafone Cash متعددة الخطوات, زر المشاركة
- `/transparency` — الشفافية: الحالات الممولة
- `/community` — لجنة المجتمع: لوحة تصويت المجتمع
- `/news` — الأخبار: الأخبار/الإعلانات من Firestore
- `/login` — تسجيل الدخول
- `/register` — إنشاء حساب
- `/admin` — لوحة التحكم: نظرة عامة على الإحصائيات
- `/admin/notifications` — الإشعارات: قائم على SQL; طلبات تقديم الحالات المعلقة (قبول/رفض + نموذج إنشاء حالة) + تبرعات Vodafone المعلقة (معاينة الصورة + التحقق/الرفض)
- `/admin/cases` — إدارة الحالات: جدول الحالات مع إنشاء/تحرير/حذف
- `/admin/cases/new` — إضافة حالة: نموذج إنشاء حالة
- `/admin/donations` — التبرعات: تبويب "في انتظار التحقق" (Vodafone Cash) + تبويب "جميع التبرعات"
- `/admin/users` — المستخدمون: قائمة المستخدمين
- `/admin/staff` — إدارة الفريق: إدارة الأدوار القائمة على SQL (super_admin فقط)

## نقاط نهاية الـ API

- `GET/POST /api/cases` — قائمة/إنشاء الحالات
- `GET/PATCH/DELETE /api/cases/:id` — CRUD الحالات
- `POST /api/cases/:id/donate` — التبرع (مباشر, يحدث إجماليات الحالة فورًا)
- `POST /api/cases/:id/donate-vodafone` — تبرع Vodafone Cash (paymentStatus=pending, ينشئ إشعار إداري)
- `GET /api/donations` — قائمة جميع التبرعات
- `GET/POST /api/votes` — قائمة/إنشاء الأصوات
- `POST /api/votes/:id/cast` — التصويت
- `GET /api/stats/overview` — إحصائيات المنصة العامة
- `GET /api/stats/recent-activity` — تغذية التبرعات الأخيرة
- `GET/PATCH /api/users` / `GET/PATCH /api/users/:id` — CRUD المستخدمين
- `POST /api/auth/register|login|logout` — مصادقة الجلسة
- `GET /api/auth/me` — مستخدم الجلسة الحالي
- `POST /api/case-submissions` — تقديم حالة عام (ينشئ إشعار إداري)
- `GET /api/case-submissions` — قائمة جميع التقديمات (إداري فقط)
- `POST /api/case-submissions/:id/approve` — الموافقة + إنشاء حالة (إداري, يأخذ حقول الحالة الكاملة في الجسم)
- `POST /api/case-submissions/:id/reject` — رفض التقديم (إداري)
- `GET /api/admin/pending-donations` — قائمة تبرعات Vodafone Cash المعلقة (إداري)
- `POST /api/admin/donations/:id/verify` — التحقق من التبرع, تحديث إجماليات الحالة (إداري)
- `POST /api/admin/donations/:id/reject` — رفض التبرع (إداري)
- `GET /api/notifications` — قائمة الإشعارات (مفلترة بالدور: الإداريون يرون البث, المستخدمون يرون الشخصي)
- `GET /api/notifications/unread-count` — العدد لشارة الجرس (يرجع 0 للغير مصادق)
- `PATCH /api/notifications/:id/read` — وضع علامة قراءة على واحدة
- `PATCH /api/notifications/read-all` — وضع علامة قراءة على الكل
- `GET /api/cases/:id/messages` — قائمة رسائل لوحة المجتمع لحالة (عام)
- `POST /api/cases/:id/messages` — نشر رسالة أو طلب تصويت على لوحة مجتمع الحالة (مصادق); يثير إشعار إداري

## جرس الإشعارات (Navbar)

- مرئي للمستخدمين المسجلين فقط
- يستعلم كل 30 ثانية عبر React Query
- يظهر شارة حمراء بعدد غير المقروء (9+ إذا أكثر من 9)
- القائمة المنسدلة تظهر آخر 8 إشعارات; النقر يوجه الإداري إلى /admin/notifications
- "قراءة الكل" يضع علامة قراءة على الكل

## الشريط الجانبي للإدارة (AdminLayout)

- يظهر عدد الإشعارات غير المقروءة على عنصر "الإشعارات" في القائمة
- يستعلم كل 30 ثانية

## أنواع الإشعارات

- `admin_case_submission` — يُطلق عند تقديم مستخدم عام لطلب حالة
- `admin_vodafone_donation` — يُطلق عند تقديم مستخدم تبرع Vodafone Cash
- `case_approved` — بث عند موافقة الإداري على تقديم حالة
- `donation_verified` — بث عند التحقق من تبرع من قبل الإداري
- `community_message` — يُطلق عند نشر مستخدم مصادق رسالة أو طلب تصويت على لوحة مجتمع حالة (بث إداري)

راجع مهارة `pnpm-workspace` للهيكل، إعداد TypeScript، وتفاصيل الحزم.
