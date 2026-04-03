import { useListCases, useDeleteCase } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP, formatDate } from "@/lib/utils";
import { Plus, MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { getListCasesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCases() {
  const { data: cases, isLoading } = useListCases();
  const deleteMutation = useDeleteCase();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحالة؟")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف الحالة بنجاح" });
            queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-primary hover:bg-primary/80">نشط</Badge>;
      case "funded":
        return <Badge variant="default" className="bg-success hover:bg-success/80">مكتمل</Badge>;
      case "closed":
        return <Badge variant="secondary">مغلق</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الحالات</h1>
          <p className="text-muted-foreground">قائمة بجميع الحالات الطبية المسجلة في المنصة</p>
        </div>
        <Button asChild>
          <Link href="/admin/cases/new">
            <Plus className="w-4 h-4 ml-2" />
            إضافة حالة جديدة
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان الحالة</TableHead>
              <TableHead>المريض</TableHead>
              <TableHead>المبلغ المطلوب</TableHead>
              <TableHead>تم جمعه</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : cases && cases.length > 0 ? (
              cases.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[300px] truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                  <TableCell>{item.patientName}</TableCell>
                  <TableCell>{formatEGP(item.targetAmount)}</TableCell>
                  <TableCell>{formatEGP(item.collectedAmount)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/cases/${item.id}`} className="cursor-pointer w-full flex items-center">
                            <ExternalLink className="w-4 h-4 ml-2" />
                            عرض الصفحة
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(item.id)}>
                          <Trash className="w-4 h-4 ml-2" />
                          حذف الحالة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  لا توجد حالات مضافة حتى الآن.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
