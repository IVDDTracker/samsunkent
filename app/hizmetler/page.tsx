import type { Metadata } from "next";
import { getActiveServices } from "../../lib/hizmet";

const BASE = "https://samsunkent.com";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Samsun Hizmet Rehberi — Firmalar & Servisler | samsunkent",
  description:
    "Samsun'un yerel hizmet firmaları tek yerde: nakliyat, oto çekici, klima-kombi servisi ve daha fazlası. İlçene göre bul, karşılaştır, doğrudan ara.",
  alternates: { canonical: "/hizmetler" },
  // Hizmet rehberi Google'da istenmiyor: noindex.
  robots: { index: false, follow: true },
};

export default async function HizmetlerHub() {
  const services = await getActiveServices();

  // Gruplara ayır (grup yoksa "Diğer")
  const groups: Record<string, typeof services> = {};
  for (const s of services) {
    const g = s.group || "Diğer";
    (groups[g] ||= []).push(s);
  }
  const groupNames = Object.keys(groups);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Hizmetler", item: `${BASE}/hizmetler` },
    ],
  };

  return (
    <div className="hz">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="hz-app">
        <div className="hz-brandbar">
          <a className="hz-brand" href="/" aria-label="Samsunkent ana sayfa">
            samsunkent<span className="dot">.</span>
            <span className="tag">Mekân · Sokak · Gündem</span>
          </a>
          <a className="hz-search" href="/hizmetler">🔍 Hizmetler</a>
        </div>

        <div className="hz-head">
          <nav className="hz-crumb" aria-label="Konum"><a href="/">Ana Sayfa</a> › Hizmetler</nav>
          <span className="hz-eyebrow">Samsunkent · Hizmet Rehberi</span>
          <h1 className="hz-h1">Samsun Hizmet Rehberi</h1>
          <p className="hz-sub">Samsun&apos;un yerel hizmet firmalarını bir araya getiriyoruz. Aradığın hizmeti seç, ilçene göre bul, doğrudan iletişime geç.</p>
        </div>

        {services.length === 0 ? (
          <div className="hz-empty" style={{ marginTop: 12 }}>Hizmetler yakında eklenecek.</div>
        ) : (
          <div className="hz-support" style={{ marginTop: 4, borderTop: "none" }}>
            {groupNames.map((g) => (
              <div key={g} style={{ marginBottom: 20 }}>
                <h2>{g}</h2>
                <div className="hz-relrow">
                  {groups[g].map((s) => (
                    <a className="hz-rel" key={s.slug} href={`/hizmetler/${s.slug}`}>{s.name}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="hz-foot">
          <p className="hz-role">
            Samsunkent firmaları bir araya getirir ve mümkün olduğunda kimlik/faaliyet teyidi yapar;
            hizmet kalitesini garanti etmez. İletişimi ve kararı doğrudan sen verirsin.
          </p>
          <div className="fn">© samsunkent · Samsun&apos;un hizmet rehberi</div>
        </div>
      </div>
    </div>
  );
}
