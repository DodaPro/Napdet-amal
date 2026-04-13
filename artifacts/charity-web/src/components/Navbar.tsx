import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth-roles";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WHATSAPP_URL = "https://wa.me/201030163755";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${BASE}/api/notifications/unread-count`, { credentials: "include" });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${BASE}/api/notifications`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function markAllRead(): Promise<void> {
  await fetch(`${BASE}/api/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });
}

async function markOneRead(id: number): Promise<void> {
  await fetch(`${BASE}/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = isAdminRole(user?.role ?? null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications-list"],
    queryFn: fetchNotifications,
    enabled: !!user,
    staleTime: 30000,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
    },
  });

  async function handleSignOut() {
    await signOut();
    navigate("/");
    toast({ title: "تم تسجيل الخروج بنجاح" });
  }

  function getTypeLabel(type: string) {
    if (type === "admin_case_submission") return "طلب حالة جديدة";
    if (type === "admin_vodafone_donation") return "تبرع فودافون";
    if (type === "case_approved") return "حالة منشورة";
    if (type === "donation_verified") return "تبرع مُوافق عليه";
    return "إشعار";
  }

  const unread = notifications.filter(n => !n.isRead);
  const hasNotifications = notifications.length > 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary tracking-tight">نبضة أمل</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                الرئيسية
              </Link>
              <Link href="/transparency" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                الشفافية
              </Link>
              <Link href="/community" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                لجنة المجتمع
              </Link>
              <Link href="/news" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                الأخبار
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                لوحة التحكم
              </Link>
            )}

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20c05c] text-white text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              تواصل للخير
            </a>

            {user && (
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5 text-foreground/70" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>الإشعارات</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllMutation.mutate()}
                        className="text-xs text-primary hover:underline font-normal"
                      >
                        قراءة الكل
                      </button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!hasNotifications ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start gap-0.5 py-2.5 px-3 cursor-pointer ${
                          !n.isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() => {
                          if (!n.isRead) {
                            markOneRead(n.id).then(() => {
                              queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
                              queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
                            });
                          }
                          if (isAdmin) navigate("/admin/notifications");
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <span className={`text-xs font-semibold truncate ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                            {n.title}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 w-full pr-3.5">
                          {n.message}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                  {isAdmin && hasNotifications && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/notifications" className="text-center text-xs text-primary justify-center w-full py-2">
                          عرض جميع الإشعارات
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.name || user.email}
                </span>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  خروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="outline">دخول</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">إنشاء حساب</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20c05c] text-white px-4 py-3 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 sm:hidden"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        تواصل للخير
      </a>
    </>
  );
}
