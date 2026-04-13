import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS } from "@/lib/auth-roles";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type SqlUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

async function fetchUsers(): Promise<SqlUser[]> {
  const res = await fetch(`${BASE}/api/users`, { credentials: "include" });
  if (!res.ok) throw new Error("فشل تحميل المستخدمين");
  return res.json();
}

async function updateRole(id: number, role: string): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("فشل تحديث الدور");
}

export default function AdminStaff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "تم تحديث الدور بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" });
    },
    onSettled: () => setUpdatingId(null),
  });

  async function handleRoleChange(id: number, role: string) {
    if (id === user?.id) {
      toast({ title: "لا يمكنك تغيير دورك الخاص", variant: "destructive" });
      return;
    }
    setUpdatingId(id);
    roleMutation.mutate({ id, role });
  }

  const roleColors: Record<string, string> = {
    super_admin: "destructive",
    sub_admin: "default",
    admin: "default",
    moderator: "secondary",
    donor: "outline",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الفريق</h1>
          <p className="text-muted-foreground mt-1">تعيين أدوار الموظفين والمشرفين</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الدور الحالي</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">تغيير الدور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{u.name}</td>
                    <td className="py-3 px-4 text-muted-foreground" dir="ltr">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={roleColors[u.role] as any}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {u.id === user?.id ? (
                        <span className="text-muted-foreground text-xs">(حسابك)</span>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={v => handleRoleChange(u.id, v)}
                          disabled={updatingId === u.id}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">مدير عام</SelectItem>
                            <SelectItem value="sub_admin">مسؤول</SelectItem>
                            <SelectItem value="moderator">مشرف</SelectItem>
                            <SelectItem value="donor">متبرع</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">
                      لا يوجد مستخدمون مسجلون بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
