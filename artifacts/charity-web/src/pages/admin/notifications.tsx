import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CaseSubmission = {
  id: number;
  submitterName: string;
  phone: string;
  address: string;
  caseDetails: string;
  status: string;
  createdAt: string;
};

type PendingDonation = {
  id: number;
  caseId: number;
  caseTitle: string;
  donorName: string;
  senderPhone: string;
  shares: number;
  amount: number;
  transferScreenshotUrl: string | null;
  paymentStatus: string;
  createdAt: string;
};

async function fetchCaseSubmissions(): Promise<CaseSubmission[]> {
  const res = await fetch(`${BASE}/api/case-submissions`, { credentials: "include" });
  if (!res.ok) throw new Error("فشل التحميل");
  return res.json();
}

async function fetchPendingDonations(): Promise<PendingDonation[]> {
  const res = await fetch(`${BASE}/api/admin/pending-donations`, { credentials: "include" });
  if (!res.ok) throw new Error("فشل التحميل");
  return res.json();
}

async function rejectSubmission(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/case-submissions/${id}/reject`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("فشل الرفض");
}

async function verifyDonation(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/donations/${id}/verify`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("فشل التحقق");
}

async function rejectDonation(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/donations/${id}/reject`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("فشل الرفض");
}

type ApproveFormState = {
  title: string;
  description: string;
  patientName: string;
  patientAge: string;
  hospital: string;
  targetAmount: string;
  sharePrice: string;
  urgencyLevel: "critical" | "high" | "medium";
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"cases" | "donations">("cases");
  const [approveDialog, setApproveDialog] = useState<CaseSubmission | null>(null);
  const [form, setForm] = useState<ApproveFormState>({
    title: "",
    description: "",
    patientName: "",
    patientAge: "",
    hospital: "",
    targetAmount: "",
    sharePrice: "100",
    urgencyLevel: "high",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: caseSubmissions = [], isLoading: loadingCases } = useQuery({
    queryKey: ["admin-case-submissions"],
    queryFn: fetchCaseSubmissions,
  });

  const { data: pendingDonations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ["admin-pending-donations"],
    queryFn: fetchPendingDonations,
  });

  const pendingCases = caseSubmissions.filter(s => s.status === "pending");
  const pendingDonationsList = pendingDonations;

  function openApproveDialog(submission: CaseSubmission) {
    setForm({
      title: "",
      description: submission.caseDetails,
      patientName: submission.submitterName,
      patientAge: "",
      hospital: submission.address,
      targetAmount: "",
      sharePrice: "100",
      urgencyLevel: "high",
    });
    setApproveDialog(submission);
  }

  async function handleApproveCase() {
    if (!approveDialog) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/case-submissions/${approveDialog.id}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          patientName: form.patientName,
          patientAge: parseInt(form.patientAge) || 1,
          hospital: form.hospital,
          targetAmount: parseFloat(form.targetAmount) || 0,
          sharePrice: parseFloat(form.sharePrice) || 100,
          urgencyLevel: form.urgencyLevel,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل القبول");
      }
      toast({ title: "تم قبول الحالة ونشرها بنجاح" });
      setApproveDialog(null);
      queryClient.invalidateQueries({ queryKey: ["admin-case-submissions"] });
    } catch (e: any) {
      toast({ title: e.message || "حدث خطأ", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRejectCase(id: number) {
    try {
      await rejectSubmission(id);
      toast({ title: "تم رفض الطلب" });
      queryClient.invalidateQueries({ queryKey: ["admin-case-submissions"] });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  async function handleVerifyDonation(id: number) {
    try {
      await verifyDonation(id);
      toast({ title: "تم التحقق من التبرع وإضافته للحالة" });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-donations"] });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  async function handleRejectDonation(id: number) {
    try {
      await rejectDonation(id);
      toast({ title: "تم رفض التبرع" });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-donations"] });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  const urgencyLabel = (level: string) => {
    if (level === "critical") return "حرج";
    if (level === "high") return "عالي";
    return "متوسط";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإشعارات والموافقات</h1>
          <p className="text-muted-foreground mt-1">مراجعة الحالات والتبرعات المعلقة</p>
        </div>

        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { key: "cases", label: "حالات معلقة", count: pendingCases.length },
            { key: "donations", label: "تبرعات بانتظار التحقق", count: pendingDonationsList.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? "bg-white/20" : "bg-destructive text-destructive-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "cases" && (
          <div className="space-y-4">
            {loadingCases ? (
              <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
            ) : pendingCases.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">لا توجد طلبات حالات معلقة</p>
                <p className="text-sm mt-2">ستظهر هنا الحالات التي تحتاج مراجعتك</p>
              </div>
            ) : (
              pendingCases.map(sub => (
                <div key={sub.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2">طلب حالة جديدة</Badge>
                      <h3 className="font-semibold text-foreground">{sub.submitterName}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sub.caseDetails}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0 text-left">
                      <div>{sub.phone}</div>
                      <div className="text-xs mt-1">{sub.address}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button size="sm" variant="outline" onClick={() => handleRejectCase(sub.id)}>
                      رفض
                    </Button>
                    <Button size="sm" onClick={() => openApproveDialog(sub)}>
                      قبول ونشر
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "donations" && (
          <div className="space-y-4">
            {loadingDonations ? (
              <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
            ) : pendingDonationsList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">لا توجد تبرعات بانتظار التحقق</p>
                <p className="text-sm mt-2">ستظهر هنا تحويلات فودافون كاش التي تحتاج مراجعتك</p>
              </div>
            ) : (
              pendingDonationsList.map(d => (
                <div key={d.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2">تبرع فودافون بانتظار التحقق</Badge>
                      <h3 className="font-semibold text-foreground">{d.donorName}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{d.caseTitle}</p>
                      <p className="text-sm font-medium text-primary mt-1">
                        {d.shares} سهم — {d.amount.toLocaleString()} جنيه
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0 text-left">
                      <div dir="ltr">{d.senderPhone}</div>
                    </div>
                  </div>
                  {d.transferScreenshotUrl && (
                    <a
                      href={d.transferScreenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img
                        src={d.transferScreenshotUrl}
                        alt="إيصال التحويل"
                        className="max-h-40 rounded-lg border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </a>
                  )}
                  <div className="flex gap-2 justify-end pt-1">
                    <Button size="sm" variant="outline" onClick={() => handleRejectDonation(d.id)}>
                      رفض
                    </Button>
                    <Button size="sm" onClick={() => handleVerifyDonation(d.id)}>
                      تحقق وموافقة
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={!!approveDialog} onOpenChange={open => !open && setApproveDialog(null)}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>قبول ونشر الحالة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p><span className="font-medium">مقدم الطلب:</span> {approveDialog?.submitterName}</p>
              <p><span className="font-medium">الهاتف:</span> {approveDialog?.phone}</p>
              <p><span className="font-medium">تفاصيله:</span> {approveDialog?.caseDetails.slice(0, 120)}...</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">عنوان الحالة</label>
                <Input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="عنوان مختصر للحالة"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">الوصف</label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">اسم المريض</label>
                <Input
                  value={form.patientName}
                  onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">العمر</label>
                <Input
                  type="number"
                  value={form.patientAge}
                  onChange={e => setForm(f => ({ ...f, patientAge: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">المستشفى</label>
                <Input
                  value={form.hospital}
                  onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">المبلغ المطلوب (جنيه)</label>
                <Input
                  type="number"
                  value={form.targetAmount}
                  onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">سعر السهم (جنيه)</label>
                <Input
                  type="number"
                  value={form.sharePrice}
                  onChange={e => setForm(f => ({ ...f, sharePrice: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">مستوى الأهمية</label>
                <Select
                  value={form.urgencyLevel}
                  onValueChange={v => setForm(f => ({ ...f, urgencyLevel: v as any }))}
                >
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="critical">حرجة جداً</SelectItem>
                    <SelectItem value="high">عاجلة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setApproveDialog(null)} disabled={submitting}>
                إلغاء
              </Button>
              <Button onClick={handleApproveCase} disabled={submitting}>
                {submitting ? "جارٍ النشر..." : "نشر الحالة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
