import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, FileText, Heart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/admin/cases", label: "إدارة الحالات", icon: FileText },
    { href: "/admin/donations", label: "التبرعات", icon: Heart },
    { href: "/admin/users", label: "المستخدمين", icon: Users },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-muted/30">
      <aside className="w-full md:w-64 bg-sidebar border-l border-sidebar-border shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50 shrink-0">
          <Link href="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-white transition-colors">
            <Activity className="w-5 h-5 text-sidebar-primary" />
            <span className="font-bold tracking-tight">لوحة التحكم</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border/50 shrink-0">
           <Link href="/" className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors flex items-center gap-2 justify-center">
             العودة للموقع
           </Link>
        </div>
      </aside>
      
      <main className="flex-1 w-full min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
