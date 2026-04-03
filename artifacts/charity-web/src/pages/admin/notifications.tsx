import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  getNotifications,
  markNotificationReviewed,
  getPendingCases,
  getPendingDonations,
  approvePendingCase,
  rejectPendingCase,
  approvePendingDonation,
  rejectPendingDonation,
  type FirestoreNotification,
  type PendingCase,
  type PendingDonation,
} from "@/lib/firestore-service";
import { useCreateCase } from "@workspace/api-client-react";

export default function AdminNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [pendingCases, setPendingCases] = useState<PendingCase[]>([]);
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "cases" | "donations">("all");
  const createCase = useCreateCase();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [notifs, cases, donations] = await Promise.all([
        getNotifications(),
        getPendingCases(),
        getPendingDonations(),
      ]);
      setNotifications(notifs);
      setPendingCases(cases.filter(c => c.status === "pending"));
      setPendingDonations(donations.filter(d => d.status === "pending"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveCase(pendingCase: PendingCase) {
    try {
      await createCase.mutateAsync({
        data: {
          title: pendingCase.title,
          description: pendingCase.description,
          patientName: pendingCase.patientName,
          patientAge: pendingCase.patientAge,
          hospital: pendingCase.hospital,
          targetAmount: pendingCase.targetAmount,
          sharePrice: pendingCase.sharePrice,
          urgencyLevel: pendingCase.urgencyLevel,
        },
      });
      await approvePendingCase(pendingCase.id);
      toast({ title: "تم قبول الحالة ونشرها" });
      loadData();
    } catch {
      toast({ title: "خطأ أثناء قبول الحالة", variant: "destructive" });
    }
  }

  async function handleRejectCase(id: string) {
    await rejectPendingCase(id);
    toast({ title: "تم رفض الحالة" });
    loadData();
  }

  async function handleApproveDonation(donation: PendingDonation) {
    await approvePendingDonation(donation.id);
    toast({ title: "تم قبول التبرع وإضافته للحالة" });
    loadData();
  }

  async function handleRejectDonation(id: string) {
    await rejectPendingDonation(id);
    toast({ title: "تم رفض التبرع" });
    loadData();
  }

  const urgencyLabel = (level: string) => {
    if (level === "critical") return "حرج";
    if (level === "high") return "عالي";
    return "متوسط";
  };

  const urgencyColor = (level: string) => {
    if (level === "critical") return "destructive";
    if (level === "high") return "default";
    return "secondary";
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
            { key: "all", label: "الكل", count: pendingCases.length + pendingDonations.length },
            { key: "cases", label: "حالات معلقة", count: pendingCases.length },
            { key: "donations", label: "تبرعات معلقة", count: pendingDonations.length },
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

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
        ) : (
          <div className="space-y-4">
            {(activeTab === "all" || activeTab === "cases") && pendingCases.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">حالة جديدة</Badge>
                      <Badge variant={urgencyColor(c.urgencyLevel) as any}>{urgencyLabel(c.urgencyLevel)}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{c.description.slice(0, 120)}...</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-left shrink-0">
                    <div>{c.submitterName}</div>
                    <div>{c.submitterPhone}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <span>المريض: {c.patientName} ({c.patientAge} سنة)</span>
                  <span>المستشفى: {c.hospital}</span>
                  <span>المبلغ المطلوب: {c.targetAmount.toLocaleString()} جنيه</span>
                  <span>سعر السهم: {c.sharePrice} جنيه</span>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleRejectCase(c.id)}>
                    رفض
                  </Button>
                  <Button size="sm" onClick={() => handleApproveCase(c)}>
                    قبول ونشر
                  </Button>
                </div>
              </div>
            ))}

            {(activeTab === "all" || activeTab === "donations") && pendingDonations.map(d => (
              <div key={d.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-1">تبرع بانتظار التحقق</Badge>
                    <h3 className="font-semibold text-foreground">{d.donorName}</h3>
                    <p className="text-sm text-muted-foreground">{d.caseTitle}</p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {d.shares} سهم — {d.amount.toLocaleString()} جنيه
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground text-left shrink-0">
                    <div>{d.donorPhone}</div>
                  </div>
                </div>
                {d.screenshotUrl && (
                  <a href={d.screenshotUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sm text-primary hover:underline">
                    عرض لقطة الشاشة
                  </a>
                )}
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleRejectDonation(d.id)}>
                    رفض
                  </Button>
                  <Button size="sm" onClick={() => handleApproveDonation(d)}>
                    تحقق وموافقة
                  </Button>
                </div>
              </div>
            ))}

            {pendingCases.length === 0 && pendingDonations.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">لا توجد إشعارات معلقة</p>
                <p className="text-sm mt-2">ستظهر هنا الحالات والتبرعات التي تحتاج مراجعتك</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
