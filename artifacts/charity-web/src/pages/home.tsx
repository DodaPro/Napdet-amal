import { useListCases } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import CaseCard from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HeartPulse } from "lucide-react";

export default function Home() {
  const { data: cases, isLoading } = useListCases({ status: "active", limit: 6 });

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
          ) : cases && cases.length > 0 ? (
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
    </Layout>
  );
}
