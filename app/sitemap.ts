import type { MetadataRoute } from "next";

const BASE = "https://samsunkent.com";
export const revalidate = 3600; // saatte bir tazele

// Sitemap YALNIZCA aramada istenen sayfaları içerir:
//   anasayfa + Büyük Ekran/PS kiralama sayfaları + Web & Yazılım hizmet sayfaları.
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
    // Web & Yazılım hizmet sayfaları (SEO landing).
    { url: `${BASE}/samsun-web-sitesi-yaptirma`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/samsun-web-sitesi-fiyatlari`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/samsun-mobil-uygulama-yaptirma`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/samsun-e-ticaret-sitesi-kurma`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // Dikey (sektör bazlı) hizmet sayfaları.
    { url: `${BASE}/samsun-berber-kuafor-randevu-sistemi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-restoran-qr-menu`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-hali-saha-rezervasyon-sistemi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-emlak-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-dis-klinigi-doktor-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-oto-galeri-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-guzellik-salonu-randevu-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-spor-salonu-uyelik-sistemi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-kafe-restoran-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-veteriner-web-sitesi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/samsun-instagram-satis-sayfasi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
