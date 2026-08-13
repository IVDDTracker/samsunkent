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
      ],
    };
  },
};
module.exports = nextConfig;
