import type { MetadataRoute } from "next";

const BASE = "https://samsunkent.com";

// Arama motorlarına: her şeyi tara, ama yönetim panelini ve API'yi tarama.
// Sitemap yalnızca indekslenebilirlik kapısını geçen URL'leri içerir (bkz. app/sitemap.ts).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/sk-yonetim-2025", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    // Not: `host` direktifini Google desteklemiyor (Search Console "yok sayıldı"
    // uyarısı verir). Kaldırıldı; hiçbir sayfayı engellemez, sadece uyarıyı temizler.
  };
}
