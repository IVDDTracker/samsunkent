import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "../lib/supabase";
import type { Announcement } from "../lib/db";
import VideoHero from "../components/VideoHero";
import SiteNav from "../components/SiteNav";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Organization + WebSite yapısal verisi (sameAs: sosyal hesaplar).
// Yalnızca gerçek, doğru bilgi — uydurma alan yok.
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "samsunkent",
    url: "https://samsunkent.com",
    sameAs: [
      "https://www.instagram.com/samsunkentcom",
      "https://www.tiktok.com/@samsunkentcom",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "samsunkent",
    url: "https://samsunkent.com",
  },
];

const ROTS = ["1.6deg", "-2.2deg", "1.1deg", "-1.4deg", "2deg", "-1.1deg"];
const TONES = ["kraft", "sticky", "", "kraft", ""];

async function getAnnouncements(): Promise<Announcement[]> {
  noStore();
  try {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,body,is_active,sort,created_at")
      .eq("is_active", true)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false });
    return (data as Announcement[]) || [];
  } catch {
    return [];
  }
}

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export default async function HomePage() {
  const anns = await getAnnouncements();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <SiteNav />
      <VideoHero />
      <div className="darkbg" aria-hidden="true" />
      <div className="wrap home" id="pano">
        <div className="board">
          {/* Web & Yazılım */}
          <article className="note" style={{ "--rot": "1.2deg" } as React.CSSProperties}>
            <span className="pin navy" />
            <span className="eyebrow">💻 Web &amp; Yazılım</span>
            <h3>Web sitesi mi lazım?</h3>
            <p>
              Kurumsal site, e-ticaret, mobil uygulama — markaya özel, Google&apos;da çıkan
              işler. Hazır tema değil. İşte yaptıklarımızdan bazıları:
            </p>
            <div className="btnrow">
              <a className="brandlink" href="https://dailydermo.com" target="_blank" rel="noopener noreferrer">dailydermo.com →</a>
              <a className="brandlink" href="https://www.anivo.app" target="_blank" rel="noopener noreferrer">anivo.app →</a>
              <a className="brandlink" href="https://samsunpettransfer.com" target="_blank" rel="noopener noreferrer">pet transfer →</a>
            </div>
            <a className="channel" href="/samsun-web-sitesi-yaptirma">Hizmetler &amp; fiyatlar →</a>
            <span className="meta">Samsun&apos;da web tasarım · e-ticaret · mobil 💻</span>
          </article>

          {/* Kiralık */}
          <article className="note" style={{ "--rot": "-1.1deg" } as React.CSSProperties}>
            <span className="pin green" />
            <span className="eyebrow">🎮 Kiralık</span>
            <h3>Evine büyük ekran keyfi.</h3>
            <p>
              PS5 (oyunlar hazır dahil), projeksiyon ve perde — maç günü, film gecesi, oyun
              gecesi. Canik, Atakum, İlkadım&apos;a ücretsiz teslim + kurulum.
            </p>
            <a className="channel" href="/kirala">Fiyat al &amp; rezervasyon →</a>
            <span className="meta">Teslimde nakit/kart · Samsun 🕹️📽️</span>
          </article>

          {/* Sabit iş birliği notu */}
          <article className="note" style={{ "--rot": "1.6deg" } as React.CSSProperties}>
            <span className="pin navy" />
            <span className="eyebrow">İş birliği</span>
            <h3>Seni Samsun&apos;a duyuralım.</h3>
            <p>
              Markan, mekânın, işin — doğru kitleye, doğru dille. Telefonunu ve iki satır mesajını
              bırak, ben dönerim.
            </p>
            <ContactForm
              source="İş birliği"
              label="Ulaşayım"
              messagePlaceholder="Ne yapmak istiyorsun?"
            />
            <span className="meta">Genelde birkaç saat içinde dönerim.</span>
          </article>

          {/* Memleketten — merak + hemşeri */}
          <article className="note promo" style={{ "--rot": "-2deg" } as React.CSSProperties}>
            <span className="pin green" />
            <span className="eyebrow">Aramızda kalsın 🤫</span>
            <h3>Bu marka nereden çıktı?</h3>
            <p>
              İpucu: memleketten. Gerisini sitesinde gör, Instagram&apos;dan takip et.
            </p>
            <div className="btnrow">
              <a
                className="brandlink"
                href="https://dailydermo.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Web sitesi →
              </a>
              <a
                className="brandlink ig"
                href="https://instagram.com/dailydermo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
            <span className="meta">Bir hemşeri işi 🤝</span>
          </article>

          {/* Admin duyuru notları */}
          {anns.map((a, i) => {
            const tone = TONES[i % TONES.length];
            const rot = ROTS[i % ROTS.length];
            const navy = i % 2 === 1;
            return (
              <article
                key={a.id}
                className={`note ${tone}`}
                style={{ "--rot": rot } as React.CSSProperties}
              >
                <span className={`pin ${navy ? "navy" : ""}`} />
                <span className="eyebrow">Duyuru</span>
                <h3>{a.title}</h3>
                {a.body && <p>{a.body}</p>}
                <ContactForm source={a.title} messagePlaceholder="Notun / telefonun yanına iki satır" />
                <span className="meta">{fmt(a.created_at)}</span>
              </article>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
