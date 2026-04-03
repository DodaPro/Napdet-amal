import { useGetStatsOverview } from "@workspace/api-client-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEGP, formatNumber } from "@/lib/utils";
import { Heart, Activity, CheckCircle2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStatsOverview();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">نظرة عامة</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم منصة نبضة أمل</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التبرعات</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-24" /> : formatEGP(stats?.totalDonations || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحالات النشطة</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(stats?.activeCases || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالات مكتملة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(stats?.fundedCases || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبرعين</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : formatNumber(stats?.totalDonors || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional dashboard widgets could go here */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>مرحباً بك في لوحة التحكم</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">استخدم القائمة الجانبية لإدارة الحالات والتبرعات والمستخدمين.</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
