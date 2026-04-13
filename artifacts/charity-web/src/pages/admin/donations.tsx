import { useState } from "react";
import { useListDonations } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

async function fetchPending(): Promise<PendingDonation[]> {
  const res = await fetch(`${BASE}/api/admin/pending-donations`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export default function AdminDonations() {
  const { data: donations, isLoading } = useListDonations();
  const [activeTab, setActiveTab] = useState<"all" | "pending">("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingDonations = [], isLoading: loadingPending } = useQuery({
    queryKey: ["admin-pending-donations"],
    queryFn: fetchPending,
  });

  async function handleVerify(id: number) {
    const res = await fetch(`${BASE}/api/admin/donations/${id}/verify`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      toast({ title: "تم التحقق من التبرع وإضافته للحالة" });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-donations"] });
    } else {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  async function handleReject(id: number) {
    const res = await fetch(`${BASE}/api/admin/donations/${id}/reject`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      toast({ title: "تم رفض التبرع" });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-donations"] });
    } else {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">التبرعات</h1>
        <p className="text-muted-foreground">إدارة ومتابعة التبرعات</p>
      </div>

      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          بانتظار التحقق
          {pendingDonations.length > 0 && (
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${
              activeTab === "pending" ? "bg-white/20" : "bg-destructive text-destructive-foreground"
            }`}>
              {pendingDonations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          جميع التبرعات
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="space-y-4">
          {loadingPending ? (
            <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
          ) : pendingDonations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">لا توجد تبرعات بانتظار التحقق</p>
              <p className="text-sm mt-2">ستظهر هنا تحويلات فودافون كاش</p>
            </div>
          ) : (
            pendingDonations.map(d => (
              <div key={d.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="mb-2">فودافون كاش — بانتظار التحقق</Badge>
                    <h3 className="font-semibold text-foreground">{d.donorName}</h3>
                    <p className="text-sm text-muted-foreground">{d.caseTitle}</p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {d.shares} سهم — {d.amount.toLocaleString()} جنيه
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0 text-left">
                    <div dir="ltr">{d.senderPhone}</div>
                    <div className="text-xs mt-1">{formatDate(d.createdAt)}</div>
                  </div>
                </div>
                {d.transferScreenshotUrl && (
                  <a
                    href={d.transferScreenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={d.transferScreenshotUrl}
                      alt="إيصال التحويل"
                      className="max-h-48 rounded-lg border border-border object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                )}
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleReject(d.id)}>
                    رفض
                  </Button>
                  <Button size="sm" onClick={() => handleVerify(d.id)}>
                    تحقق وموافقة
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم المرجع</TableHead>
                <TableHead>المتبرع</TableHead>
                <TableHead>رقم الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>عدد الأسهم</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : donations && donations.length > 0 ? (
                donations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">#{item.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item.donorName}</span>
                        {item.anonymous && <Badge variant="outline" className="text-xs">مجهول</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>#{item.caseId}</TableCell>
                    <TableCell className="font-bold text-primary">{formatEGP(item.amount)}</TableCell>
                    <TableCell>{item.shares}</TableCell>
                    <TableCell>
                      {(item as any).paymentMethod === "vodafone_cash" ? (
                        <Badge variant="outline" className="text-xs">فودافون كاش</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">مباشر</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(item as any).paymentStatus === "approved" ? (
                        <Badge className="bg-success/10 text-success text-xs">مُوافق</Badge>
                      ) : (item as any).paymentStatus === "pending" ? (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">معلق</Badge>
                      ) : (item as any).paymentStatus === "rejected" ? (
                        <Badge variant="destructive" className="text-xs">مرفوض</Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success text-xs">مُكتمل</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    لا توجد تبرعات حتى الآن.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
