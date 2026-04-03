import { useState } from "react";
import { useListVotes, useCastVote } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { formatEGP } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Community() {
  const { data: votes, isLoading, refetch } = useListVotes({ status: "open" });
  const [voterName, setVoterName] = useState("");
  const castVote = useCastVote();
  const { toast } = useToast();

  const handleVote = (voteId: number, choice: "yes" | "no") => {
    if (!voterName.trim()) {
      toast({
        title: "يرجى إدخال اسمك",
        description: "يجب إدخال اسمك للمشاركة في التصويت",
        variant: "destructive"
      });
      return;
    }

    castVote.mutate(
      { id: voteId, data: { choice, voterName } },
      {
        onSuccess: () => {
          toast({
            title: "تم تسجيل تصويتك بنجاح",
            description: "شكراً لمشاركتك في قرار المجتمع",
          });
          refetch();
        },
        onError: () => {
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من تسجيل تصويتك. حاول مرة أخرى.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="bg-primary py-16 text-primary-foreground border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto max-w-4xl px-4 text-center relative z-10">
          <Users className="w-12 h-12 mx-auto mb-4 text-primary-foreground/80" />
          <h1 className="text-4xl font-bold mb-4">لجنة المجتمع</h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
            في بعض الحالات الطبية، قد تظهر مصاريف إضافية غير متوقعة (أدوية، إقامة، تحاليل). 
            نعرض هذه المصاريف على مجتمع المتبرعين للتصويت على تغطيتها من صندوق الطوارئ لتحقيق أقصى درجات الشفافية.
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          
          <div className="bg-card border border-border p-6 rounded-xl mb-10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
             <div className="flex-1">
                <Label htmlFor="voterName" className="text-base mb-2 block font-bold text-foreground">اسم المتبرع (للتصويت)</Label>
                <p className="text-sm text-muted-foreground mb-4">يجب أن تكون مساهماً في المنصة ليحق لك التصويت.</p>
                <Input 
                  id="voterName" 
                  value={voterName} 
                  onChange={(e) => setVoterName(e.target.value)} 
                  placeholder="الاسم الكامل" 
                  className="max-w-md bg-white"
                />
             </div>
             <div className="w-full sm:w-auto p-4 bg-muted/50 rounded-lg flex items-start gap-3 border border-border">
               <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
               <p className="text-sm text-foreground leading-relaxed">
                 التصويت يغلق تلقائياً بعد 48 ساعة أو عند وصول نسبة الموافقة 75%.
               </p>
             </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-8">المواضيع المفتوحة للتصويت</h2>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i} className="border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : votes && votes.length > 0 ? (
            <div className="space-y-6">
              {votes.map((vote) => {
                const totalVotes = vote.yesCount + vote.noCount;
                const yesPercentage = totalVotes > 0 ? Math.round((vote.yesCount / totalVotes) * 100) : 0;
                
                return (
                  <Card key={vote.id} className="border-border overflow-hidden hover-elevate transition-shadow">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                            موضوع تصويت #{vote.id}
                          </Badge>
                          <CardTitle className="text-xl leading-tight text-foreground">{vote.title}</CardTitle>
                          <CardDescription className="mt-2 text-base text-muted-foreground">{vote.description}</CardDescription>
                        </div>
                        <div className="text-left shrink-0 bg-white p-3 rounded-lg border border-border shadow-sm">
                          <div className="text-xs text-muted-foreground mb-1">المبلغ المطلوب</div>
                          <div className="text-xl font-bold text-primary">{formatEGP(vote.expense)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-success">موافق ({vote.yesCount})</span>
                          <span className="text-muted-foreground">إجمالي الأصوات: {totalVotes}</span>
                          <span className="text-destructive">غير موافق ({vote.noCount})</span>
                        </div>
                        <div className="h-3 w-full bg-destructive/20 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-success transition-all duration-500" 
                            style={{ width: `${yesPercentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted/20 border-t border-border pt-4 justify-between">
                      <p className="text-sm text-muted-foreground">
                        هل توافق على تغطية هذا المبلغ من صندوق الطوارئ؟
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground min-w-[100px]"
                          onClick={() => handleVote(vote.id, "no")}
                          disabled={castVote.isPending}
                        >
                          <ThumbsDown className="w-4 h-4 ml-2" />
                          لا أوافق
                        </Button>
                        <Button 
                          className="bg-success text-success-foreground hover:bg-success/90 min-w-[100px]"
                          onClick={() => handleVote(vote.id, "yes")}
                          disabled={castVote.isPending}
                        >
                          <ThumbsUp className="w-4 h-4 ml-2" />
                          أوافق
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد مواضيع مفتوحة للتصويت</h3>
              <p className="text-muted-foreground">مجتمعنا مستقر حالياً ولا توجد مصاريف طارئة تتطلب التصويت.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
