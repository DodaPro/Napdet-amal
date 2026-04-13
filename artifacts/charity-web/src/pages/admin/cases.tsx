import { useState } from "react";
import { useListCases, useDeleteCase, useUpdateCase } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEGP, formatDate } from "@/lib/utils";
import { Plus, MoreHorizontal, Edit, Trash, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { getListCasesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type CaseItem = {
  id: number;
  title: string;
  description: string;
  patientName: string;
  patientAge: number;
  hospital: string;
  targetAmount: number;
  sharePrice: number;
  status: string;
  urgencyLevel: string;
  imageUrl?: string | null;
  medicalReportUrl?: string | null;
  collectedAmount: number;
  createdAt: string;
};

type EditForm = {
  title: string;
  description: string;
  patientName: string;
  patientAge: string;
  hospital: string;
  targetAmount: string;
  sharePrice: string;
  urgencyLevel: string;
  status: string;
  imageUrl: string;
  medicalReportUrl: string;
};

export default function AdminCases() {
  const { data: cases, isLoading } = useListCases();
  const deleteMutation = useDeleteCase();
  const updateMutation = useUpdateCase();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editCase, setEditCase] = useState<CaseItem | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحالة؟")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف الحالة بنجاح" });
            queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          },
        }
      );
    }
  };

  function openEdit(item: CaseItem) {
    setEditCase(item);
    setEditForm({
      title: item.title,
      description: item.description,
      patientName: item.patientName,
      patientAge: String(item.patientAge),
      hospital: item.hospital,
      targetAmount: String(item.targetAmount),
      sharePrice: String(item.sharePrice),
      urgencyLevel: item.urgencyLevel,
      status: item.status,
      imageUrl: item.imageUrl ?? "",
      medicalReportUrl: item.medicalReportUrl ?? "",
    });
  }

  function handleEditSave() {
    if (!editCase || !editForm) return;
    updateMutation.mutate(
      {
        id: editCase.id,
        data: {
          title: editForm.title,
          description: editForm.description,
          patientName: editForm.patientName,
          patientAge: parseInt(editForm.patientAge) || editCase.patientAge,
          hospital: editForm.hospital,
          targetAmount: parseFloat(editForm.targetAmount) || editCase.targetAmount,
          sharePrice: parseFloat(editForm.sharePrice) || editCase.sharePrice,
          urgencyLevel: editForm.urgencyLevel as any,
          status: editForm.status as any,
          imageUrl: editForm.imageUrl || null,
          medicalReportUrl: editForm.medicalReportUrl || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم تحديث الحالة بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListCasesQueryKey() });
          setEditCase(null);
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" });
        },
      }
    );
  }

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
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(item as any)}>
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل الحالة
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        >
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

      <Dialog open={!!editCase} onOpenChange={open => !open && setEditCase(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الحالة</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">عنوان الحالة</label>
                  <Input
                    value={editForm.title}
                    onChange={e => setEditForm(f => f && ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">الوصف</label>
                  <Textarea
                    value={editForm.description}
                    onChange={e => setEditForm(f => f && ({ ...f, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">اسم المريض</label>
                  <Input
                    value={editForm.patientName}
                    onChange={e => setEditForm(f => f && ({ ...f, patientName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">العمر</label>
                  <Input
                    type="number"
                    value={editForm.patientAge}
                    onChange={e => setEditForm(f => f && ({ ...f, patientAge: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">المستشفى</label>
                  <Input
                    value={editForm.hospital}
                    onChange={e => setEditForm(f => f && ({ ...f, hospital: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">المبلغ المطلوب (جنيه)</label>
                  <Input
                    type="number"
                    value={editForm.targetAmount}
                    onChange={e => setEditForm(f => f && ({ ...f, targetAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">سعر السهم (جنيه)</label>
                  <Input
                    type="number"
                    value={editForm.sharePrice}
                    onChange={e => setEditForm(f => f && ({ ...f, sharePrice: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">مستوى الأهمية</label>
                  <Select
                    value={editForm.urgencyLevel}
                    onValueChange={v => setEditForm(f => f && ({ ...f, urgencyLevel: v }))}
                  >
                    <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="critical">حرجة جداً</SelectItem>
                      <SelectItem value="high">عاجلة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">حالة النشر</label>
                  <Select
                    value={editForm.status}
                    onValueChange={v => setEditForm(f => f && ({ ...f, status: v }))}
                  >
                    <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="funded">مكتمل</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">رابط الصورة (اختياري)</label>
                  <Input
                    dir="ltr"
                    value={editForm.imageUrl}
                    onChange={e => setEditForm(f => f && ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">رابط التقرير الطبي (اختياري)</label>
                  <Input
                    dir="ltr"
                    value={editForm.medicalReportUrl}
                    onChange={e => setEditForm(f => f && ({ ...f, medicalReportUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditCase(null)} disabled={updateMutation.isPending}>
                  إلغاء
                </Button>
                <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
