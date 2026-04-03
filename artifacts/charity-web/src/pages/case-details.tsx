import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetCase, getGetCaseQueryKey, useDonateToCase } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { formatEGP, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Activity, MapPin, Share2, Info, Plus, Minus, HeartHandshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CaseDetails() {
  const [, params] = useRoute("/cases/:id");
  const caseId = params?.id ? parseInt(params.id) : 0;
  const { data: caseItem, isLoading } = useGetCase(caseId, { query: { enabled: !!caseId, queryKey: getGetCaseQueryKey(caseId) } });
  const [shares, setShares] = useState(1);
  const [coverFees, setCoverFees] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const donateMutation = useDonateToCase();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="w-full aspect-video rounded-xl" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!caseItem) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">لم يتم العثور على الحالة</h2>
        </div>
      </Layout>
    );
  }

  const percentage = Math.min(Math.round((caseItem.soldShares / caseItem.totalShares) * 100), 100);
  const sharesLeft = caseItem.totalShares - caseItem.soldShares;
  const isFunded = caseItem.status === "funded" || sharesLeft <= 0;
  
  const paymentFeePercentage = 0.025; // 2.5% fee
  const baseAmount = shares * caseItem.sharePrice;
  const feeAmount = coverFees ? baseAmount * paymentFeePercentage : 0;
  const totalAmount = baseAmount + feeAmount;

  const handleSharesChange = (delta: number) => {
    const newShares = shares + delta;
    if (newShares >= 1 && newShares <= sharesLeft) {
      setShares(newShares);
    }
  };

  const handleDonateSubmit = () => {
    if (!anonymous && !donorName.trim()) {
      toast({
        title: "الاسم مطلوب",
        description: "يرجى إدخال اسمك أو اختيار التبرع كفاعل خير",
        variant: "destructive"
      });
      return;
    }

    donateMutation.mutate(
      { 
        id: caseId, 
        data: { 
          donorName: anonymous ? "فاعل خير" : donorName, 
          shares, 
          coverFees, 
          anonymous 
        } 
      },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          toast({
            title: "تم التبرع بنجاح",
            description: "جزاك الله خيراً وجعله في ميزان حسناتك",
          });
          queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
        },
        onError: () => {
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من معالجة التبرع، يرجى المحاولة مرة أخرى",
            variant: "destructive"
          });
        }
      }
    );
  };

  const urgencyColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
  };

  const urgencyLabels = {
    critical: "حالة حرجة جداً",
    high: "حالة عاجلة",
    medium: "حالة متوسطة",
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-xl overflow-hidden bg-card border border-border relative">
              {caseItem.imageUrl ? (
                <img 
                  src={caseItem.imageUrl} 
                  alt={caseItem.title} 
                  className="w-full aspect-[21/9] object-cover"
                />
              ) : (
                <div className="w-full aspect-[21/9] bg-muted flex items-center justify-center">
                  <Activity className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
              
              {caseItem.status === "active" && (
                <div className="absolute top-4 right-4">
                  <Badge className={`${urgencyColors[caseItem.urgencyLevel]} text-sm px-3 py-1 shadow-sm`} variant="default">
                    <Clock className="w-4 h-4 ml-2" />
                    {urgencyLabels[caseItem.urgencyLevel]}
                  </Badge>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-border p-6 md:p-8">
              <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">{caseItem.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs">المريض</p>
                    <p className="font-medium text-foreground">{caseItem.patientName} ({caseItem.patientAge} سنة)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs">المستشفى المعالج</p>
                    <p className="font-medium text-foreground">{caseItem.hospital}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-foreground/90">
                <h3 className="text-xl font-bold mb-4">قصة الحالة</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-lg">{caseItem.description}</p>
              </div>

              {caseItem.medicalReportUrl && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-xl font-bold mb-4">التقرير الطبي</h3>
                  <div className="relative rounded-lg overflow-hidden border border-border group bg-muted">
                    <img 
                      src={caseItem.medicalReportUrl} 
                      alt="التقرير الطبي" 
                      className="w-full h-48 object-cover blur-md opacity-60"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white p-4 text-center">
                      <Info className="w-8 h-8 mb-2" />
                      <p className="font-medium">تم التحقق من التقرير الطبي من قبل فريق نبضة أمل</p>
                      <p className="text-sm opacity-80 mt-1">حفاظاً على خصوصية المريض، لا يتم عرض التفاصيل الطبية الدقيقة للعموم</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Donation Widget */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-xl border border-border shadow-md overflow-hidden">
              <div className="p-6 pb-0">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-3xl font-black text-foreground">
                    {formatEGP(caseItem.collectedAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    المبلغ المطلوب {formatEGP(caseItem.targetAmount)}
                  </div>
                </div>
                <Progress value={percentage} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>تم جمع {percentage}%</span>
                  <span>متبقي {isFunded ? 0 : formatNumber(sharesLeft)} سهم</span>
                </div>
              </div>

              <div className="p-6 mt-6 bg-muted/20 border-t border-border space-y-6">
                {isFunded ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                      <HeartHandshake className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-success mb-2">اكتمل التمويل</h3>
                    <p className="text-muted-foreground">
                      بفضل الله ثم بتبرعاتكم، تم جمع المبلغ بالكامل لهذه الحالة.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-bold text-lg mb-4">اختر عدد الأسهم</h3>
                      <div className="flex items-center justify-between bg-white border border-border rounded-lg p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleSharesChange(-1)}
                          disabled={shares <= 1}
                          className="h-10 w-10 shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold">{shares}</span>
                          <span className="text-xs text-muted-foreground">سهم ({formatEGP(caseItem.sharePrice)} للسهم)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleSharesChange(1)}
                          disabled={shares >= sharesLeft}
                          className="h-10 w-10 shrink-0 text-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-medium">قيمة التبرع</span>
                      <span className="text-2xl font-bold text-primary">{formatEGP(shares * caseItem.sharePrice)}</span>
                    </div>

                    <Button 
                      className="w-full h-14 text-lg font-bold shadow-lg" 
                      onClick={() => setIsConfirmOpen(true)}
                    >
                      متابعة التبرع
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full bg-white">
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة الحالة
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-2">تأكيد التبرع</DialogTitle>
            <DialogDescription className="text-center">
              أنت على وشك التبرع لـ {caseItem.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                <span className="font-medium">عدد الأسهم</span>
                <span className="font-bold">{shares} سهم</span>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse justify-between bg-white border border-border p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cover-fees" className="font-bold cursor-pointer">تغطية رسوم بوابات الدفع (2.5%)</Label>
                  <span className="text-xs text-muted-foreground">تأكد من وصول تبرعك كاملاً للحالة</span>
                </div>
                <Switch 
                  id="cover-fees" 
                  checked={coverFees} 
                  onCheckedChange={setCoverFees} 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <Switch 
                  id="anonymous" 
                  checked={anonymous} 
                  onCheckedChange={setAnonymous} 
                />
                <Label htmlFor="anonymous" className="cursor-pointer">التبرع كفاعل خير (مجهول)</Label>
              </div>
              
              {!anonymous && (
                <div className="space-y-2">
                  <Label htmlFor="donorName">الاسم الكريم</Label>
                  <Input 
                    id="donorName" 
                    placeholder="الاسم الثلاثي" 
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-2 border border-primary/10">
              <div className="flex justify-between text-sm">
                <span>قيمة التبرع</span>
                <span>{formatEGP(baseAmount)}</span>
              </div>
              {coverFees && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>رسوم بوابات الدفع</span>
                  <span>{formatEGP(feeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/10 mt-2">
                <span>الإجمالي</span>
                <span className="text-primary">{formatEGP(totalAmount)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row sm:justify-between gap-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="w-full sm:w-auto">
              إلغاء
            </Button>
            <Button onClick={handleDonateSubmit} disabled={donateMutation.isPending} className="w-full sm:w-auto px-8">
              {donateMutation.isPending ? "جاري التنفيذ..." : "تأكيد الدفع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
