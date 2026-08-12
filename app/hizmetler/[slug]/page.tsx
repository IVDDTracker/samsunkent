import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getService,
  getBusinessesForService,
  getActiveServices,
  getDistricts,
  getServiceSlugs,
  splitSponsored,
  serviceIsIndexable,
} from "../../../lib/hizmet";
import ServiceResults from "../../../components/ServiceResults";

const BASE = "https://samsunkent.com";
export const revalidate = 3600; // ISR — saatte bir tazele
export const dynamicParams = true; // listede olmayan slug istek anında render

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: "Hizmet bulunamadı — samsunkent" };
  const businesses = await getBusinessesForService(service);
  const indexable = serviceIsIndexable(service, businesses.length);
  return {
    title: service.meta_title || `${service.h1 || service.name} | samsunkent`,
    description: service.meta_desc || service.intro || undefined,
    alternates: { canonical: `/hizmetler/${service.slug}` },
    // İndekslenebilirlik kapısını geçmeyen sayfa noindex (yaşar ama aramaya girmez).
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function HizmetPage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);
  if (!service) notFound();

  const [businesses, districts, allServices] = await Promise.all([
    getBusinessesForService(service),
    getDistricts(),
    getActiveServices(),
  ]);
  const { sponsored, organic } = splitSponsored(businesses);

  const related = allServices.filter((s) => s.slug !== service.slug).slice(0, 5);

  // ---- Yapısal veri (yalnız gerçek) ----
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Hizmetler", item: `${BASE}/hizmetler` },
        { "@type": "ListItem", position: 3, name: service.name, item: `${BASE}/hizmetler/${service.slug}` },
      ],
    },
  ];
  const listed = [...sponsored, ...organic];
  if (listed.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: service.h1 || service.name,
      itemListElement: listed.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE}/firma/${b.slug}`,
        name: b.name,
      })),
    });
  }

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
          <nav className="hz-crumb" aria-label="Konum">
            <a href="/">Ana Sayfa</a> › <a href="/hizmetler">Hizmetler</a> › {service.name}
          </nav>
          <span className="hz-eyebrow">Samsunkent · Hizmet Rehberi</span>
          <h1 className="hz-h1">{service.h1 || service.name}</h1>
          {service.intro && <p className="hz-sub">{service.intro}</p>}
        </div>

        <ServiceResults
          serviceId={service.id}
          sponsored={sponsored}
          organic={organic}
          districts={districts}
        />

        {(service.howto.length > 0 || service.faq.length > 0) && (
          <div className="hz-support">
            {service.howto.length > 0 && (
              <>
                <h2>{service.name} nasıl seçilir?</h2>
                <div className="hz-howto">
                  {service.howto.map((h, i) => (
                    <div key={i}>
                      <div className="h">{h.title}</div>
                      <div className="b">{h.body}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {service.faq.length > 0 && (
              <>
                <h2>Sık sorulanlar</h2>
                {service.faq.map((f, i) => (
                  <details className="hz-details" key={i}>
                    <summary>{f.q}</summary>
                    <div className="ans">{f.a}</div>
                  </details>
                ))}
              </>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="hz-related">
            <div className="cap">İlgili hizmetler</div>
            <div className="hz-relrow">
              {related.map((s) => (
                <a className="hz-rel" key={s.slug} href={`/hizmetler/${s.slug}`}>{s.name}</a>
              ))}
            </div>
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
