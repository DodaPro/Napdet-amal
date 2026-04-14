import { useState } from "react";
import { useListCases } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import CaseCard from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { HeartPulse, PlusCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: cases, isLoading } = useListCases({ status: "active", limit: 6 });
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState({ submitterName: "", phone: "", address: "", caseDetails: "" });
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!form.submitterName.trim() || !form.phone.trim() || !form.address.trim() || !form.caseDetails.trim()) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/case-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("فشل الإرسال");
      setSubmitSuccess(true);
    } catch {
      toast({ title: "حدث خطأ", description: "لم نتمكن من إرسال الطلب، يرجى المحاولة مرة أخرى", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitOpen(false);
    setTimeout(() => {
      setSubmitSuccess(false);
      setForm({ submitterName: "", phone: "", address: "", caseDetails: "" });
    }, 300);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight max-w-3xl mx-auto">
            عطاؤك الصغير يصنع <br/> فارقاً كبيراً في حياة إنسان
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            منصة نبضة أمل تتيح لك المساهمة في إنقاذ الأرواح من خلال التبرعات الصغيرة. 
            ساهم بشراء "أسهم" في تكلفة العمليات الجراحية العاجلة وكن سبباً في شفاء مريض.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-lg" asChild>
              <a href="#active-cases">تصفح الحالات العاجلة</a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto text-base h-14 px-8 rounded-full" asChild>
              <Link href="/transparency">قصص النجاح</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Active Cases Grid */}
      <section id="active-cases" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">حالات عاجلة تنتظر الأمل</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                هذه الحالات الطبية تحتاج لتدخل سريع. يمكنك المساهمة بشراء أسهم تغطي جزءاً من التكلفة.
              </p>
            </div>
            <Button
              onClick={() => setIsSubmitOpen(true)}
              className="flex items-center gap-2 shrink-0 h-12 px-6 rounded-full shadow"
            >
              <PlusCircle className="w-5 h-5" />
              إضافة حالة جديدة
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="w-full aspect-[4/3]" />
                  <div className="p-5 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(cases) && cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((item) => (
                <CaseCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد حالات عاجلة حالياً</h3>
              <p className="text-muted-foreground">الحمد لله، تم تغطية جميع الحالات الطبية المطروحة.</p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white border-t border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              بخطوات بسيطة وشفافة، نضمن وصول تبرعك لمستحقيه
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border -z-10" />
            
            <div className="relative bg-white pt-8">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md absolute -top-8 left-1/2 -translate-x-1/2 border-4 border-white">1</div>
              <h3 className="text-xl font-bold mb-3">دراسة الحالة</h3>
              <p className="text-muted-foreground leading-relaxed">
                يتم دراسة الحالات الطبية والتحقق من التقارير والمستشفيات من قبل فريق طبي متخصص.
              </p>
            </div>
            
            <div className="relative bg-white pt-8">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md absolute -top-8 left-1/2 -translate-x-1/2 border-4 border-white">2</div>
              <h3 className="text-xl font-bold mb-3">تقسيم التكلفة</h3>
              <p className="text-muted-foreground leading-relaxed">
                تُقسم التكلفة الإجمالية للعملية إلى "أسهم" صغيرة لتسهيل المساهمة على الجميع.
              </p>
            </div>
            
            <div className="relative bg-white pt-8">
              <div className="w-16 h-16 bg-success text-success-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md absolute -top-8 left-1/2 -translate-x-1/2 border-4 border-white">3</div>
              <h3 className="text-xl font-bold mb-3">الشفافية والتنفيذ</h3>
              <p className="text-muted-foreground leading-relaxed">
                عند اكتمال المبلغ، يتم سداده للمستشفى مباشرة ونشر تحديثات بنجاح العملية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Submission Modal */}
      <Dialog open={isSubmitOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">تم إرسال الطلب بنجاح!</h3>
              <p className="text-muted-foreground leading-relaxed">
                شكراً لك. سيقوم فريقنا بمراجعة الحالة والتواصل معك في أقرب وقت.
              </p>
              <Button className="mt-4 w-full" onClick={handleClose}>
                إغلاق
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">إضافة حالة جديدة</DialogTitle>
                <DialogDescription>
                  أرسل تفاصيل الحالة وسيتواصل معك فريقنا لمتابعة الإجراءات.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">اسم مقدم الطلب <span className="text-destructive">*</span></Label>
                  <Input
                    id="submitterName"
                    placeholder="الاسم الثلاثي"
                    value={form.submitterName}
                    onChange={(e) => setForm(f => ({ ...f, submitterName: e.target.value }))}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone"
                    placeholder="01xxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">العنوان <span className="text-destructive">*</span></Label>
                  <Input
                    id="address"
                    placeholder="المحافظة / المدينة / الحي"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseDetails">تفاصيل الحالة <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="caseDetails"
                    placeholder="اكتب وصفاً للحالة الطبية، التشخيص، والمبلغ المطلوب إن أمكن..."
                    value={form.caseDetails}
                    onChange={(e) => setForm(f => ({ ...f, caseDetails: e.target.value }))}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>

              <DialogFooter className="flex-row-reverse gap-3 sm:flex-row-reverse">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </Button>
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  إلغاء
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
