import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getNews, type NewsItem } from "@/lib/firestore-service";

function formatDate(ts: any): string {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews().then(items => {
      setNews(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">الأخبار والإعلانات</h1>
          <p className="text-muted-foreground mt-2">آخر المستجدات من منصة نبضة أمل</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جارٍ التحميل...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">لا توجد أخبار حتى الآن</p>
            <p className="text-sm mt-2">تابعنا لمعرفة آخر المستجدات</p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map(item => (
              <article key={item.id} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-3 gap-4">
                  <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.createdAt)}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{item.content}</p>
                <p className="text-xs text-muted-foreground mt-4">بقلم: {item.authorName}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
