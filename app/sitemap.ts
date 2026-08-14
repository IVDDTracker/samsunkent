import type { MetadataRoute } from "next";
import {
  getActiveServices,
  getBusinessesForService,
  getPublishedBusinessSlugs,
  serviceIsIndexable,
} from "../lib/hizmet";

const BASE = "https://samsunkent.com";
export const revalidate = 3600; // saatte bir tazele

// Sitemap YALNIZCA indekslenebilirlik kapısını geçen sayfaları içerir:
//   hizmet → minimum supply (>=3 yayında işletme) VE unique user value BİRLİKTE.
// Kapıyı geçmeyen sayfalar noindex kalır ve buraya HİÇ girmez.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    // Büyük Ekran Kiralama — gerçek ürün/hizmet sayfası, indekslenebilir.
    { url: `${BASE}/kirala`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const services = await getActiveServices();
  if (services.length > 0) {
    entries.push({ url: `${BASE}/hizmetler`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }

  for (const svc of services) {
    const businesses = await getBusinessesForService(svc);
    if (serviceIsIndexable(svc, businesses.length)) {
      entries.push({
        url: `${BASE}/hizmetler/${svc.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  const bizSlugs = await getPublishedBusinessSlugs();
  for (const slug of bizSlugs) {
    entries.push({
      url: `${BASE}/firma/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
