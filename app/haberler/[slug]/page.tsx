import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CAT_COLORS: Record<string, string> = {
  gundem: "#e53935", spor: "#1a6fa8", ekonomi: "#f59e0b",
  kultur: "#9b59b6", saglik: "#27ae60", egitim: "#2980b9",
  turizm: "#f59e0b", ulasim: "#16a085",
};

const CAT_LABELS: Record<string, string> = {
  gundem: "GÜNDEM", spor: "SPOR", ekonomi: "EKONOMİ",
  kultur: "KÜLTÜR", saglik: "SAĞLIK", egitim: "EĞİTİM",
  turizm: "TURİZM", ulasim: "ULAŞIM",
};

const STOCK_IMAGES: Record<string, string> = {
  spor: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=90",
  ekonomi: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=90",
  kultur: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=90",
  saglik: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=90",
  egitim: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=90",
  turizm: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90",
  gundem: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=90",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from("news_articles")
    .select("title, summary")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "Haber Bulunamadı" };

  return {
    title: data.title,
    description: data.summary,
    openGraph: {
      title: data.title,
      description: data.summary,
      siteName: "samsunkent.com",
    },
  };
}

export default async function HaberDetay({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_approved", true)
    .single();

  if (!article) notFound();

  // View count artır
  await supabase
    .from("news_articles")
    .update({ views: (article.views || 0) + 1 })
    .eq("id", article.id);

  // İlgili haberler
  const { data: related } = await supabase
    .from("news_articles")
    .select("id, slug, title, category, created_at")
    .eq("is_approved", true)
    .eq("category", article.category)
    .neq("id", article.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const coverImage = article.cover_image || STOCK_IMAGES[article.category] || STOCK_IMAGES.gundem;
  const catColor = CAT_COLORS[article.category] || "#1a6fa8";
  const catLabel = CAT_LABELS[article.category] || article.category.toUpperCase();

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 12, color: "#6b7a8d", fontWeight: 600 }}>
          <Link href="/" style={{ color: "#1a6fa8" }}>Ana Sayfa</Link>
          <span>›</span>
          <Link href="/haberler" style={{ color: "#1a6fa8" }}>Haberler</Link>
          <span>›</span>
          <span>{catLabel}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>

          {/* Makale */}
          <article>
            {/* Kategori */}
            <span style={{ background: catColor, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, letterSpacing: "0.1em", display: "inline-block", marginBottom: 16 }}>
              {catLabel}
            </span>

            {/* Başlık */}
            <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 30, fontWeight: 900, color: "#0f1923", lineHeight: 1.35, marginBottom: 16, letterSpacing: "-0.01em" }}>
              {article.title}
            </h1>

            {/* Meta */}
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #e8ecf0" }}>
              <span style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 600 }}>
                📅 {timeAgo(article.published_at || article.created_at)}
              </span>
              <span style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 600 }}>
                👁 {(article.views || 0) + 1} görüntülenme
              </span>
              <span style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 600 }}>
                samsunkent.com
              </span>
            </div>

            {/* Özet */}
            <p style={{ fontFamily: "Merriweather,serif", fontSize: 17, color: "#2c3e50", lineHeight: 1.8, marginBottom: 24, fontStyle: "italic", borderLeft: "4px solid " + catColor, paddingLeft: 16 }}>
              {article.summary}
            </p>

            {/* Kapak fotoğrafı */}
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
              <img src={coverImage} alt={article.title} style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
            </div>

            {/* İçerik */}
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#0f1923", lineHeight: 1.9 }}>
              {article.content?.split("\n\n").map((para: string, i: number) => (
                <p key={i} style={{ marginBottom: 20 }}>{para}</p>
              ))}
            </div>

            {/* Paylaş */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #e8ecf0", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 700 }}>Paylaş:</span>
              {["𝕏 Twitter", "📘 Facebook", "💬 WhatsApp"].map(s => (
                <button key={s} style={{ background: "#f7f9fb", border: "1px solid #e8ecf0", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#0f1923", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside>
            {/* Hava durumu */}
            <div style={{ background: "#1a6fa8", borderRadius: 10, padding: "16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>SAMSUN</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 2 }}>
                  <span style={{ fontFamily: "Merriweather,serif", fontSize: 32, fontWeight: 900, color: "#fff" }}>24</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>°C</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}>Güneşli · 18 km/sa</p>
              </div>
              <span style={{ fontSize: 44 }}>☀️</span>
            </div>

            {/* İlgili haberler */}
            {related && related.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "Merriweather,serif", fontSize: 16, fontWeight: 900, color: "#0f1923", marginBottom: 14 }}>İlgili Haberler</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {related.map(r => (
                    <Link key={r.id} href={`/haberler/${r.slug}`} style={{ background: "#fff", border: "1px solid #e8ecf0", borderRadius: 8, padding: "12px", textDecoration: "none", display: "block" }}>
                      <span style={{ background: CAT_COLORS[r.category] || "#1a6fa8", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, display: "inline-block", marginBottom: 6 }}>
                        {CAT_LABELS[r.category] || r.category.toUpperCase()}
                      </span>
                      <p style={{ fontFamily: "Merriweather,serif", fontSize: 13, fontWeight: 700, color: "#0f1923", lineHeight: 1.4 }}>{r.title}</p>
                      <p style={{ color: "#6b7a8d", fontSize: 11, marginTop: 4 }}>{timeAgo(r.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reklam */}
            <div style={{ background: "#e8f4fd", border: "1.5px solid rgba(26,111,168,0.25)", borderRadius: 10, padding: "16px", marginTop: 20, textAlign: "center" }}>
              <span style={{ fontSize: 9, color: "#6b7a8d", fontWeight: 700, letterSpacing: "0.12em" }}>REKLAM</span>
              <p style={{ fontFamily: "Merriweather,serif", color: "#0f1923", fontSize: 14, fontWeight: 700, marginTop: 8, marginBottom: 10 }}>samsunkent.com&apos;da reklam ver</p>
              <button style={{ background: "#1a6fa8", color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Bilgi Al</button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
