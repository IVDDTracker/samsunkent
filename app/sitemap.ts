import type { MetadataRoute } from "next";

const BASE = "https://samsunkent.com";

// Şimdilik yalnızca ana sayfa.
// FAZ 1: /hizmetler, /hizmetler/[hizmet] ve /firma/[slug] URL'leri buraya
// Supabase'den EKLENECEK — ama SADECE indekslenebilirlik kapısını geçenler:
//   minimum supply (>=3 yayında işletme) VE unique user value birlikte.
// Kapıyı geçmeyen sayfalar noindex kalır ve sitemap'e HİÇ girmez.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
