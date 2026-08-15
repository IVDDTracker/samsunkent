import type { MetadataRoute } from "next";

const BASE = "https://samsunkent.com";
export const revalidate = 3600; // saatte bir tazele

// Sitemap YALNIZCA aramada istenen sayfaları içerir:
//   anasayfa + Büyük Ekran/PS kiralama sayfaları (kirala + niyet bazlı landing'ler).
// Firma/hizmet rehberi sayfaları (/firma, /hizmetler) istenmiyor → noindex, sitemap'e girmez.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    // Büyük Ekran / PS5 Kiralama — asıl ürün sayfası.
    { url: `${BASE}/kirala`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // Kiralama SEO landing sayfaları (niyet bazlı).
    { url: `${BASE}/samsun-ps5-kiralama`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/samsun-projeksiyon-kiralama`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/samsun-mac-izleme-kiralama`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/evde-sinema-kiralama-samsun`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];
}
