import { useListCases, useGetStatsOverview } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import CaseCard from "@/components/CaseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP, formatNumber } from "@/lib/utils";
import { CheckCircle2, Heart, Users, Activity } from "lucide-react";

export default function Transparency() {
  const { data: cases, isLoading: isLoadingCases } = useListCases({ status: "funded" });
  const { data: stats, isLoading: isLoadingStats } = useGetStatsOverview();

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">الشفافية وقصص النجاح</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نؤمن بأن الشفافية هي أساس الثقة. هنا نستعرض الأثر الحقيقي لتبرعاتكم والحالات التي تكللت بالنجاح بفضل الله ثم بفضل مساهماتكم.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-border p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border text-center">
              <div className="px-4 py-2">
                <div className="mx-auto w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {isLoadingStats ? <Skeleton className="h-9 w-20 mx-auto" /> : formatNumber(stats?.fundedCases || 0)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">حالة مكتملة</div>
              </div>
              <div className="px-4 py-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {isLoadingStats ? <Skeleton className="h-9 w-24 mx-auto" /> : formatEGP(stats?.totalDonations || 0)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">إجمالي التبرعات</div>
              </div>
              <div className="px-4 py-2">
                <div className="mx-auto w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {isLoadingStats ? <Skeleton className="h-9 w-20 mx-auto" /> : formatNumber(stats?.totalDonors || 0)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">متبرع ومساهم</div>
              </div>
              <div className="px-4 py-2">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {isLoadingStats ? <Skeleton className="h-9 w-20 mx-auto" /> : formatNumber(stats?.totalSharesSold || 0)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">سهم تم شراؤه</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funded Cases Grid */}
      <section className="py-12 pb-24">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">عمليات تم تمويلها بنجاح</h2>
          
          {isLoadingCases ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="w-full aspect-[4/3]" />
                  <div className="p-5 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cases && cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((item) => (
                <div key={item.id} className="relative">
                  <CaseCard item={item} />
                  {/* Mission Accomplished Stamp */}
                  <div className="absolute -top-3 -right-3 z-10 rotate-12 drop-shadow-md">
                    <div className="bg-success text-success-foreground text-sm font-black px-4 py-1.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      تم التمويل بنجاح
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-border">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد حالات مكتملة بعد</h3>
              <p className="text-muted-foreground">ساهم في الحالات العاجلة لتكون أول من يصنع الأمل.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
