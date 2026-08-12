import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusiness, getPublishedBusinessSlugs } from "../../../lib/hizmet";
import ProfileActions from "../../../components/ProfileActions";
import { mapsHref } from "../../../lib/phone";

const BASE = "https://samsunkent.com";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedBusinessSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const b = await getBusiness(params.slug);
  if (!b) return { title: "Firma bulunamadı — samsunkent" };
  const svc = b.services.map((s) => s.name).join(", ");
  return {
    title: `${b.name}${svc ? ` — ${svc}` : ""} | samsunkent`,
    description: b.description || `${b.name}, Samsun. ${svc}`.slice(0, 160),
    alternates: { canonical: `/firma/${b.slug}` },
  };
}

export default async function FirmaPage({ params }: { params: { slug: string } }) {
  const b = await getBusiness(params.slug);
  if (!b) notFound();

  const districtNames = b.districts.map((d) => d.name);

  // LocalBusiness — yalnız gerçek alanlar. Review/rating YOK.
  const local: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    url: `${BASE}/firma/${b.slug}`,
    areaServed: districtNames.length ? districtNames.map((n) => `${n}, Samsun`) : "Samsun",
  };
  if (b.phone) local.telephone = b.phone;
  if (b.website) local.sameAs = [b.website];
  if (b.description) local.description = b.description;
  if (b.address) local.address = { "@type": "PostalAddress", streetAddress: b.address, addressLocality: "Samsun", addressCountry: "TR" };
  if (typeof b.lat === "number" && typeof b.lng === "number") {
    local.geo = { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng };
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Hizmetler", item: `${BASE}/hizmetler` },
      ...(b.services[0]
        ? [{ "@type": "ListItem", position: 3, name: b.services[0].name, item: `${BASE}/hizmetler/${b.services[0].slug}` }]
        : []),
      { "@type": "ListItem", position: b.services[0] ? 4 : 3, name: b.name, item: `${BASE}/firma/${b.slug}` },
    ],
  };

  const maps = mapsHref(b.name, b.address, b.lat, b.lng);
  const hoursEntries = b.hours ? Object.entries(b.hours) : [];

  return (
    <div className="hz">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumb, local]) }} />

      <div className="hz-app">
        <div className="hz-brandbar">
          <a className="hz-brand" href="/" aria-label="Samsunkent ana sayfa">
            samsunkent<span className="dot">.</span>
            <span className="tag">Mekân · Sokak · Gündem</span>
          </a>
          <a className="hz-search" href="/hizmetler">🔍 Hizmetler</a>
        </div>

        <div className="hz-head">
          <nav className="hz-crumb" aria-label="Konum">
            <a href="/">Ana Sayfa</a> › <a href="/hizmetler">Hizmetler</a>
            {b.services[0] && <> › <a href={`/hizmetler/${b.services[0].slug}`}>{b.services[0].name}</a></>}
            {" "}› {b.name}
          </nav>
          <div className="hz-biz-top" style={{ alignItems: "center" }}>
            <h1 className="hz-h1" style={{ marginBottom: 0 }}>{b.name}</h1>
            {b.verified && (
              <span className="hz-verified" title="Samsunkent kimlik/faaliyet teyidi — tavsiye veya garanti değildir">
                <span className="tick">✓</span> Doğrulandı
              </span>
            )}
          </div>
          <p className="hz-sub" style={{ marginTop: 8 }}>
            {districtNames.length ? `${districtNames.join(" · ")} · Samsun` : "Samsun"}
          </p>
        </div>

        {/* Yapışkan temas barı + izlemeli aksiyonlar (client) */}
        <ProfileActions
          businessId={b.id}
          serviceId={b.services[0]?.id}
          phone={b.phone}
          whatsapp={b.whatsapp}
          website={b.website}
          mapsHref={maps}
        />

        <div className="hz-support" style={{ marginTop: 4 }}>
          {b.description && (
            <>
              <h2>Hakkında</h2>
              <p>{b.description}</p>
            </>
          )}

          {b.services.length > 0 && (
            <>
              <h2>Hizmetler</h2>
              <div className="hz-relrow" style={{ marginBottom: 16 }}>
                {b.services.map((s) => (
                  <a className="hz-rel" key={s.id} href={`/hizmetler/${s.slug}`}>{s.name}</a>
                ))}
              </div>
            </>
          )}

          {districtNames.length > 0 && (
            <>
              <h2>Hizmet verdiği ilçeler</h2>
              <div className="hz-tags" style={{ marginBottom: 16 }}>
                {districtNames.map((n) => (<span className="hz-tag2" key={n}>{n}</span>))}
              </div>
            </>
          )}

          {hoursEntries.length > 0 && (
            <>
              <h2>Çalışma saatleri</h2>
              <div className="hz-howto" style={{ marginBottom: 16 }}>
                {hoursEntries.map(([gun, saat]) => (
                  <div key={gun} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span className="h">{gun}</span><span className="b">{String(saat)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
            Bu işletmenin sahibi misiniz?{" "}
            <a href="/" style={{ color: "var(--navy)", fontWeight: 700 }}>Bize ulaş, profilini güncelleyelim →</a>
          </p>
        </div>

        <div className="hz-foot">
          <div className="fn">© samsunkent · Samsun&apos;un hizmet rehberi</div>
        </div>
      </div>
    </div>
  );
}
