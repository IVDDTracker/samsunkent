/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Firma tanıtım demoları: temiz URL (/oznakliyat) statik HTML'e yönlenir.
        { source: "/oznakliyat", destination: "/oznakliyat.html" },
        // Büyük Ekran Kiralama (PS5 · projeksiyon · perde) — temiz URL.
        { source: "/kirala", destination: "/kirala.html" },
        // SEO landing sayfaları — niyet bazlı, temiz URL, /kirala'ya yönlendirir.
        { source: "/samsun-ps5-kiralama", destination: "/samsun-ps5-kiralama.html" },
        { source: "/samsun-projeksiyon-kiralama", destination: "/samsun-projeksiyon-kiralama.html" },
        { source: "/samsun-mac-izleme-kiralama", destination: "/samsun-mac-izleme-kiralama.html" },
        { source: "/evde-sinema-kiralama-samsun", destination: "/evde-sinema-kiralama-samsun.html" },
      ],
    };
  },
};
module.exports = nextConfig;
