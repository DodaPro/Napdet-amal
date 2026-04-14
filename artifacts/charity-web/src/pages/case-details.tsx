import { useState, useRef, useEffect, useCallback } from "react";
import { useRoute } from "wouter";
import { useGetCase, getGetCaseQueryKey } from "@workspace/api-client-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, Activity, MapPin, Share2, Info, Plus, Minus, HeartHandshake, CheckCircle2, Upload, Copy, Smartphone, MessageSquare, Send, Vote, Users, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface CaseMessage {
  id: number;
  caseId: number;
  authorId: number;
  authorName: string;
  type: "message" | "vote_request";
  content: string;
  voteTitle: string | null;
  voteExpense: string | null;
  createdAt: string;
}

const VODAFONE_RECEIVING_NUMBER = "01030163755";

type PaymentMethod = "vodafone_cash" | "direct";
type Step = "select_method" | "vodafone_form" | "confirm" | "success_pending" | "success";

export default function CaseDetails() {
  const [, params] = useRoute("/cases/:id");
  const caseId = params?.id ? parseInt(params.id) : 0;
  const { data: caseItem, isLoading } = useGetCase(caseId, { query: { enabled: !!caseId, queryKey: getGetCaseQueryKey(caseId) } });
  const [shares, setShares] = useState(1);
  const [coverFees, setCoverFees] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<Step>("select_method");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vodafone_cash");
  const [senderPhone, setSenderPhone] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Community Board state
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [voteTitle, setVoteTitle] = useState("");
  const [voteExpense, setVoteExpense] = useState("");
  const [voteDescription, setVoteDescription] = useState("");
  const [isSendingVote, setIsSendingVote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!caseId) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silent
    } finally {
      setMessagesLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    if (caseId) fetchMessages();
  }, [caseId, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSendingMsg(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newMessage.trim(), type: "message" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "حدث خطأ");
      }
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (e: unknown) {
      toast({ title: "خطأ", description: e instanceof Error ? e.message : "لم يتم الإرسال", variant: "destructive" });
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleSendVoteRequest = async () => {
    if (!voteTitle.trim() || !voteDescription.trim()) {
      toast({ title: "البيانات مطلوبة", description: "يرجى تعبئة عنوان ووصف طلب التصويت", variant: "destructive" });
      return;
    }
    if (!voteExpense || isNaN(parseFloat(voteExpense)) || parseFloat(voteExpense) <= 0) {
      toast({ title: "المبلغ غير صحيح", description: "يرجى إدخال مبلغ صحيح", variant: "destructive" });
      return;
    }
    setIsSendingVote(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: voteDescription.trim(),
          type: "vote_request",
          voteTitle: voteTitle.trim(),
          voteExpense: voteExpense.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "حدث خطأ");
      }
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setVoteTitle("");
      setVoteExpense("");
      setVoteDescription("");
      setIsVoteModalOpen(false);
      toast({ title: "تم إرسال طلب التصويت", description: "سيراجع المسؤولون طلبك قريباً" });
    } catch (e: unknown) {
      toast({ title: "خطأ", description: e instanceof Error ? e.message : "لم يتم الإرسال", variant: "destructive" });
    } finally {
      setIsSendingVote(false);
    }
  };

  function formatMessageTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  const resetModal = () => {
    setStep("select_method");
    setPaymentMethod("vodafone_cash");
    setSenderPhone("");
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setDonorName("");
    setAnonymous(false);
    setCoverFees(false);
  };

  const handleModalClose = (open: boolean) => {
    if (!open) resetModal();
    setIsModalOpen(open);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: caseItem?.title ?? "حالة طبية تحتاج دعمك",
      text: `ساعد في تمويل: ${caseItem?.title ?? ""}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "تم نسخ الرابط!", description: "يمكنك الآن مشاركة رابط الحالة." });
      } catch {
        toast({ title: "تعذّر النسخ", description: shareUrl, variant: "destructive" });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("فشل رفع الصورة");
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleVodafoneSubmit = async () => {
    if (!anonymous && !donorName.trim()) {
      toast({ title: "الاسم مطلوب", description: "يرجى إدخال اسمك أو اختيار التبرع كفاعل خير", variant: "destructive" });
      return;
    }
    if (!senderPhone.trim()) {
      toast({ title: "رقم الهاتف مطلوب", description: "يرجى إدخال رقم الهاتف المُرسَل منه", variant: "destructive" });
      return;
    }
    if (!screenshotFile) {
      toast({ title: "صورة التحويل مطلوبة", description: "يرجى رفع صورة تأكيد التحويل", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl: string | undefined;
      try {
        screenshotUrl = await uploadToCloudinary(screenshotFile);
      } catch {
        toast({ title: "تعذّر رفع الصورة", description: "سيتم حفظ الطلب بدون الصورة. يمكنك التواصل معنا لاحقاً.", variant: "destructive" });
      }

      const res = await fetch(`/api/cases/${caseId}/donate-vodafone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: anonymous ? "فاعل خير" : donorName,
          shares,
          coverFees,
          anonymous,
          senderPhone,
          transferScreenshotUrl: screenshotUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "حدث خطأ");
      }

      setStep("success_pending");
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "لم نتمكن من معالجة الطلب";
      toast({ title: "حدث خطأ", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSubmit = async () => {
    if (!anonymous && !donorName.trim()) {
      toast({ title: "الاسم مطلوب", description: "يرجى إدخال اسمك أو اختيار التبرع كفاعل خير", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: anonymous ? "فاعل خير" : donorName,
          shares,
          coverFees,
          anonymous,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "حدث خطأ");
      }

      setStep("success");
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "لم نتمكن من معالجة الطلب";
      toast({ title: "حدث خطأ", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  const paymentFeePercentage = 0.025;
  const baseAmount = shares * caseItem.sharePrice;
  const feeAmount = coverFees ? baseAmount * paymentFeePercentage : 0;
  const totalAmount = baseAmount + feeAmount;

  const handleSharesChange = (delta: number) => {
    const newShares = shares + delta;
    if (newShares >= 1 && newShares <= sharesLeft) {
      setShares(newShares);
    }
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
                      onClick={() => { resetModal(); setIsModalOpen(true); }}
                    >
                      متابعة التبرع
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full bg-white" onClick={handleShare}>
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة الحالة
            </Button>
          </div>
        </div>

        {/* Community Board */}
        <div className="mt-10 bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">لوحة المجتمع</h2>
                <p className="text-xs text-muted-foreground">نقاش الحالة وطلبات التصويت على المصاريف الإضافية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{messages.length} رسالة</span>
              <Button variant="outline" size="sm" onClick={fetchMessages} className="text-xs">
                تحديث
              </Button>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto" dir="rtl">
            {messagesLoading && messages.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <div className="animate-pulse">جاري تحميل الرسائل...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">لا توجد رسائل بعد. كن أول من يبدأ النقاش!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${user?.id === msg.authorId ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {msg.authorName.charAt(0)}
                  </div>
                  <div className={`max-w-[75%] ${user?.id === msg.authorId ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{msg.authorName}</span>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                    </div>
                    {msg.type === "vote_request" ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-right">
                        <div className="flex items-center gap-2 text-amber-700 font-bold">
                          <Vote className="w-4 h-4 shrink-0" />
                          <span>طلب تصويت: {msg.voteTitle}</span>
                        </div>
                        <p className="text-sm text-amber-800">{msg.content}</p>
                        {msg.voteExpense && (
                          <div className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                            المبلغ المطلوب: {formatEGP(msg.voteExpense)}
                          </div>
                        )}
                        <p className="text-xs text-amber-600">سيقوم فريق الإدارة بمراجعة هذا الطلب</p>
                      </div>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          user?.id === msg.authorId
                            ? "bg-primary text-primary-foreground rounded-tl-sm"
                            : "bg-muted text-foreground rounded-tr-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4" dir="rtl">
            {user ? (
              <div className="space-y-3">
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك للنقاش حول هذه الحالة..."
                    className="resize-none text-sm min-h-[60px]"
                    dir="rtl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSendingMsg || !newMessage.trim()}
                    size="icon"
                    className="h-10 w-10 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    اضغط Enter للإرسال، Shift+Enter لسطر جديد
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVoteModalOpen(true)}
                    className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Vote className="w-3 h-3 ml-1" />
                    طلب تصويت على مصروف إضافي
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-4 bg-muted/30 rounded-xl">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  يجب{" "}
                  <a href="/login" className="text-primary font-medium hover:underline">
                    تسجيل الدخول
                  </a>{" "}
                  للمشاركة في النقاش
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vote Request Modal */}
      <Dialog open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-600" />
              طلب تصويت على مصروف إضافي
            </DialogTitle>
            <DialogDescription>
              اقترح مصروفاً إضافياً لهذه الحالة — سيقوم المجتمع بالتصويت عليه
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="vote-title">عنوان الاقتراح <span className="text-destructive">*</span></Label>
              <Input
                id="vote-title"
                placeholder="مثال: تكاليف نقل المريض"
                value={voteTitle}
                onChange={(e) => setVoteTitle(e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vote-expense">المبلغ المطلوب (جنيه) <span className="text-destructive">*</span></Label>
              <Input
                id="vote-expense"
                placeholder="مثال: 500"
                type="number"
                min="1"
                value={voteExpense}
                onChange={(e) => setVoteExpense(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vote-desc">وصف الاقتراح <span className="text-destructive">*</span></Label>
              <Textarea
                id="vote-desc"
                placeholder="اشرح سبب الحاجة لهذا المبلغ الإضافي..."
                value={voteDescription}
                onChange={(e) => setVoteDescription(e.target.value)}
                dir="rtl"
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              سيتم إرسال هذا الاقتراح إلى فريق الإدارة للمراجعة، وإشعار المجتمع للتصويت عليه.
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-3">
            <Button onClick={handleSendVoteRequest} disabled={isSendingVote} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isSendingVote ? "جاري الإرسال..." : "إرسال الاقتراح"}
            </Button>
            <Button variant="outline" onClick={() => setIsVoteModalOpen(false)} className="flex-1">
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md" dir="rtl">

          {/* Step: Select Payment Method */}
          {step === "select_method" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">اختر طريقة الدفع</DialogTitle>
                <DialogDescription className="text-center">
                  التبرع لـ {caseItem.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <button
                  onClick={() => { setPaymentMethod("vodafone_cash"); setStep("vodafone_form"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-500 bg-red-50 hover:bg-red-100 transition-colors text-right"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-red-700 text-lg">فودافون كاش</p>
                    <p className="text-sm text-red-600">أرسل عبر فودافون كاش وارفع صورة التحويل</p>
                  </div>
                </button>

                <button
                  onClick={() => { setPaymentMethod("direct"); setStep("confirm"); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-right"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-lg">دفع مباشر</p>
                    <p className="text-sm text-muted-foreground">تبرع مباشر وفوري عبر المنصة</p>
                  </div>
                </button>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
                عدد الأسهم المختارة: <span className="font-bold text-foreground">{shares} سهم</span> — الإجمالي: <span className="font-bold text-primary">{formatEGP(shares * caseItem.sharePrice)}</span>
              </div>
            </>
          )}

          {/* Step: Vodafone Cash Form */}
          {step === "vodafone_form" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">الدفع عبر فودافون كاش</DialogTitle>
                <DialogDescription>
                  أرسل المبلغ عبر فودافون كاش ثم ارفع صورة التأكيد
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Our Vodafone Number */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-red-600 mb-1">رقم فودافون كاش الخاص بنا</p>
                  <p className="text-3xl font-black text-red-700 tracking-wider" dir="ltr">{VODAFONE_RECEIVING_NUMBER}</p>
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-xs text-red-600 mx-auto hover:text-red-800"
                    onClick={() => {
                      navigator.clipboard.writeText(VODAFONE_RECEIVING_NUMBER).then(() =>
                        toast({ title: "تم نسخ الرقم!" })
                      );
                    }}
                  >
                    <Copy className="w-3 h-3" />
                    نسخ الرقم
                  </button>
                </div>

                <div className="bg-primary/5 rounded-lg p-3 text-center text-sm">
                  المبلغ المطلوب تحويله: <span className="font-bold text-primary text-base">{formatEGP(shares * caseItem.sharePrice)}</span>
                </div>

                {/* Donor Name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="anon-vf" checked={anonymous} onCheckedChange={setAnonymous} />
                    <Label htmlFor="anon-vf" className="cursor-pointer text-sm">التبرع كفاعل خير</Label>
                  </div>
                </div>

                {!anonymous && (
                  <div className="space-y-1">
                    <Label htmlFor="donorName-vf">اسمك الكريم</Label>
                    <Input id="donorName-vf" placeholder="الاسم الثلاثي" value={donorName} onChange={(e) => setDonorName(e.target.value)} dir="rtl" />
                  </div>
                )}

                {/* Sender Phone */}
                <div className="space-y-1">
                  <Label htmlFor="senderPhone">رقم هاتفك المُرسَل منه <span className="text-destructive">*</span></Label>
                  <Input id="senderPhone" placeholder="01xxxxxxxxx" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} dir="ltr" className="text-left" />
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label>صورة تأكيد التحويل <span className="text-destructive">*</span></Label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {screenshotPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img src={screenshotPreview} alt="صورة التحويل" className="w-full h-40 object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                        onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                      >
                        تغيير
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">اضغط لرفع صورة التأكيد</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, JPEG</p>
                    </button>
                  )}
                </div>
              </div>

              <DialogFooter className="flex-row-reverse gap-3">
                <Button onClick={handleVodafoneSubmit} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "جاري الإرسال..." : "إرسال طلب التبرع"}
                </Button>
                <Button variant="outline" onClick={() => setStep("select_method")} className="flex-1">
                  رجوع
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Direct Payment Confirm */}
          {step === "confirm" && (
            <>
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
                    <Switch id="cover-fees" checked={coverFees} onCheckedChange={setCoverFees} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 space-x-reverse mb-4">
                    <Switch id="anonymous" checked={anonymous} onCheckedChange={setAnonymous} />
                    <Label htmlFor="anonymous" className="cursor-pointer">التبرع كفاعل خير (مجهول)</Label>
                  </div>
                  
                  {!anonymous && (
                    <div className="space-y-2">
                      <Label htmlFor="donorName">الاسم الكريم</Label>
                      <Input id="donorName" placeholder="الاسم الثلاثي" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
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
                <Button variant="outline" onClick={() => setStep("select_method")} className="w-full sm:w-auto">
                  رجوع
                </Button>
                <Button onClick={handleDirectSubmit} disabled={isSubmitting} className="w-full sm:w-auto px-8">
                  {isSubmitting ? "جاري التنفيذ..." : "تأكيد الدفع"}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* Step: Vodafone Cash Pending Success */}
          {step === "success_pending" && (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-orange-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">قيد التحقق</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                تم استلام طلب تبرعك بنجاح! سيقوم فريقنا بالتحقق من التحويل خلال 24 ساعة وإضافة سهمك للحالة.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                جزاك الله خيراً على كل سهم في هذا العمل الطيب.
              </div>
              <Button className="mt-4 w-full" onClick={() => handleModalClose(false)}>
                إغلاق
              </Button>
            </div>
          )}

          {/* Step: Direct Payment Success */}
          {step === "success" && (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">تم التبرع بنجاح!</h3>
              <p className="text-muted-foreground leading-relaxed">
                جزاك الله خيراً وجعله في ميزان حسناتك
              </p>
              <Button className="mt-4 w-full" onClick={() => handleModalClose(false)}>
                إغلاق
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </Layout>
  );
}
