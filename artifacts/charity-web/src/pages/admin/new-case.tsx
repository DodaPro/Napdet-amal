import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateCase } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const caseSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرف على الأقل"),
  patientName: z.string().min(2, "اسم المريض مطلوب"),
  patientAge: z.coerce.number().min(1, "العمر مطلوب").max(120),
  hospital: z.string().min(2, "اسم المستشفى مطلوب"),
  targetAmount: z.coerce.number().min(100, "المبلغ المطلوب يجب أن يكون 100 جنيه على الأقل"),
  sharePrice: z.coerce.number().min(10, "قيمة السهم يجب أن تكون 10 جنيه على الأقل"),
  urgencyLevel: z.enum(["critical", "high", "medium"]),
  imageUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
  medicalReportUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
});

type CaseFormValues = z.infer<typeof caseSchema>;

export default function NewCase() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateCase();
  const { toast } = useToast();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: "",
      description: "",
      patientName: "",
      patientAge: 0,
      hospital: "",
      targetAmount: 0,
      sharePrice: 100,
      urgencyLevel: "high",
      imageUrl: "",
      medicalReportUrl: "",
    },
  });

  const onSubmit = (data: CaseFormValues) => {
    createMutation.mutate(
      { data: { ...data, imageUrl: data.imageUrl || null, medicalReportUrl: data.medicalReportUrl || null } },
      {
        onSuccess: () => {
          toast({ title: "تم إضافة الحالة بنجاح" });
          setLocation("/admin/cases");
        },
        onError: () => {
          toast({ title: "حدث خطأ أثناء الإضافة", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">إضافة حالة جديدة</h1>
          <p className="text-muted-foreground">أدخل تفاصيل الحالة الطبية لنشرها للمتبرعين</p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/admin/cases")}>إلغاء</Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الحالة</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: عملية قلب مفتوح عاجلة للطفل أحمد" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القصة والوصف</FormLabel>
                        <FormControl>
                          <Textarea placeholder="اشرح تفاصيل الحالة الطبية والوضع الاجتماعي..." className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>بيانات المريض والمستشفى</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المريض</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العمر</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hospital"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>المستشفى المعالج</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>التمويل والتصنيف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ المطلوب إجمالاً (بالجنيه)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sharePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قيمة السهم الواحد (بالجنيه)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مستوى الأهمية</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger dir="rtl">
                              <SelectValue placeholder="اختر مستوى الأهمية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl">
                            <SelectItem value="critical">حرجة جداً</SelectItem>
                            <SelectItem value="high">عاجلة</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>الوسائط والتقارير</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط صورة الحالة (اختياري)</FormLabel>
                        <FormControl>
                          <Input dir="ltr" className="text-right" placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalReportUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط التقرير الطبي (اختياري)</FormLabel>
                        <FormControl>
                          <Input dir="ltr" className="text-right" placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full h-12" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإضافة..." : "حفظ ونشر الحالة"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
