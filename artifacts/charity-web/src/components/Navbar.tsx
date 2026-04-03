import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary tracking-tight">نبضة أمل</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/transparency" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              الشفافية
            </Link>
            <Link href="/community" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              لجنة المجتمع
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            لوحة التحكم
          </Link>
        </div>
      </div>
    </header>
  );
}
