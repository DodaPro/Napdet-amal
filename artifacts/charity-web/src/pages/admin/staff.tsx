import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, updateUserRole, type FirestoreUser } from "@/lib/firestore-service";
import { ROLE_LABELS } from "@/lib/auth-roles";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminStaff() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const all = await getAllUsers();
      setUsers(all);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(uid: string, role: FirestoreUser["role"]) {
    if (uid === user?.uid) {
      toast({ title: "لا يمكنك تغيير دورك الخاص", variant: "destructive" });
      return;
    }
    setUpdatingUid(uid);
    try {
      await updateUserRole(uid, role);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
      toast({ title: "تم تحديث الدور بنجاح" });
    } catch {
      toast({ title: "حدث خطأ أثناء التحديث", variant: "destructive" });
    } finally {
      setUpdatingUid(null);
    }
  }

  const roleColors: Record<string, string> = {
    super_admin: "destructive",
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

        {loading ? (
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
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{u.name}</td>
                    <td className="py-3 px-4 text-muted-foreground" dir="ltr">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={roleColors[u.role] as any}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {u.uid === user?.uid ? (
                        <span className="text-muted-foreground text-xs">(حسابك)</span>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={v => handleRoleChange(u.uid, v as FirestoreUser["role"])}
                          disabled={updatingUid === u.uid}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="super_admin">مدير عام</SelectItem>
                            <SelectItem value="admin">مسؤول</SelectItem>
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
