import { useListDonations } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP, formatDate } from "@/lib/utils";

export default function AdminDonations() {
  const { data: donations, isLoading } = useListDonations();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">سجل التبرعات</h1>
        <p className="text-muted-foreground">عرض جميع عمليات التبرع وشراء الأسهم على المنصة</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم المرجع</TableHead>
              <TableHead>المتبرع</TableHead>
              <TableHead>رقم الحالة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>عدد الأسهم</TableHead>
              <TableHead>تغطية الرسوم</TableHead>
              <TableHead>التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
                    {item.coverFees ? (
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">نعم</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">لا</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  لا توجد تبرعات حتى الآن.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
