export function getFirebaseAuthError(code: string): string {
  const errors: Record<string, string> = {
    // Credentials
    "auth/invalid-credential":         "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "auth/user-not-found":             "لا يوجد حساب بهذا البريد الإلكتروني",
    "auth/wrong-password":             "كلمة المرور غير صحيحة",
    "auth/email-already-in-use":       "هذا البريد الإلكتروني مستخدم بالفعل",
    "auth/weak-password":              "كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل",
    "auth/invalid-email":              "صيغة البريد الإلكتروني غير صحيحة",
    "auth/user-disabled":              "هذا الحساب موقوف، تواصل مع الإدارة",
    "auth/too-many-requests":          "تم تجاوز عدد المحاولات، انتظر قليلاً وحاول مجدداً",

    // Configuration / Setup
    "auth/operation-not-allowed":
      "تسجيل الدخول بالبريد الإلكتروني غير مفعّل — يجب تفعيله في Firebase Console > Authentication > Sign-in method",
    "auth/unauthorized-domain":
      "هذا النطاق غير مصرح به في Firebase — أضفه في Firebase Console > Authentication > Settings > Authorized domains",
    "auth/invalid-api-key":            "مفتاح Firebase API غير صحيح — تحقق من متغيرات البيئة",
    "auth/configuration-not-found":    "إعدادات Firebase غير مكتملة — تحقق من VITE_FIREBASE_* في إعدادات المشروع",
    "auth/project-not-found":          "مشروع Firebase غير موجود — تحقق من VITE_FIREBASE_PROJECT_ID",
    "auth/app-deleted":                "تطبيق Firebase محذوف، تحقق من الإعدادات",

    // Network
    "auth/network-request-failed":
      "فشل الاتصال بالإنترنت — تحقق من اتصالك وحاول مجدداً",
    "auth/timeout":                    "انتهت مهلة الاتصال — حاول مجدداً",
    "auth/internal-error":             "خطأ داخلي في Firebase، حاول مجدداً",
  };

  return errors[code] ?? `خطأ غير متوقع (${code})`;
}
