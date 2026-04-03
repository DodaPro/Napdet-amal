import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">نبضة أمل</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              منصة مجتمعية شفافة للتبرعات الصغيرة. معاً نساهم في علاج الحالات الطبية العاجلة ومنحهم أمل جديد في الحياة.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  الحالات العاجلة
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  قصص النجاح والشفافية
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  تصويت المجتمع
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">تواصل معنا</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">info@nabdat-amal.com</li>
              <li className="text-sm text-muted-foreground">+20 100 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} نبضة أمل. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
