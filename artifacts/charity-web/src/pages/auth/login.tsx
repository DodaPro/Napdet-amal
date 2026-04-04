import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseAuthError } from "@/lib/firebase-errors";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorDetail(null);
    try {
      await signIn(email, password);
      navigate("/");
      toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في نبضة أمل" });
    } catch (err: any) {
      const code = err?.code ?? "unknown";
      const msg = getFirebaseAuthError(code);
      setErrorDetail(msg);
      toast({ title: "خطأ في تسجيل الدخول", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary mb-2">نبضة أمل</h1>
          <p className="text-muted-foreground">سجّل دخولك للمتابعة</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-foreground mb-6">تسجيل الدخول</h2>

          {errorDetail && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 text-right">
              {errorDetail}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                required
                dir="ltr"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
