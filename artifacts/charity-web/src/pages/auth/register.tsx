import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseAuthError } from "@/lib/firebase-errors";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) {
      setErrorDetail("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    setErrorDetail(null);
    try {
      await signUp(email, password, name);
      navigate("/");
      toast({ title: "تم إنشاء الحساب", description: `مرحباً يا ${name}، أنت الآن عضو في نبضة أمل` });
    } catch (err: any) {
      const code = err?.code ?? "unknown";
      const msg = getFirebaseAuthError(code);
      setErrorDetail(msg);
      toast({ title: "خطأ في إنشاء الحساب", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary mb-2">نبضة أمل</h1>
          <p className="text-muted-foreground">انضم إلينا وساهم في إنقاذ الأرواح</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-foreground mb-6">إنشاء حساب جديد</h2>

          {errorDetail && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 text-right">
              {errorDetail}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="محمد أحمد"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="٦ أحرف على الأقل"
                required
                dir="ltr"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
