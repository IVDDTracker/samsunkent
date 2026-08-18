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
        // Web & Yazılım hizmet sayfaları — SEO landing, temiz URL.
        { source: "/samsun-web-sitesi-yaptirma", destination: "/samsun-web-sitesi-yaptirma.html" },
        { source: "/samsun-web-sitesi-fiyatlari", destination: "/samsun-web-sitesi-fiyatlari.html" },
        { source: "/samsun-mobil-uygulama-yaptirma", destination: "/samsun-mobil-uygulama-yaptirma.html" },
        { source: "/samsun-e-ticaret-sitesi-kurma", destination: "/samsun-e-ticaret-sitesi-kurma.html" },
        // Dikey (sektör bazlı) SEO landing sayfaları.
        { source: "/samsun-berber-kuafor-randevu-sistemi", destination: "/samsun-berber-kuafor-randevu-sistemi.html" },
        { source: "/samsun-restoran-qr-menu", destination: "/samsun-restoran-qr-menu.html" },
        { source: "/samsun-hali-saha-rezervasyon-sistemi", destination: "/samsun-hali-saha-rezervasyon-sistemi.html" },
        { source: "/samsun-emlak-web-sitesi", destination: "/samsun-emlak-web-sitesi.html" },
        { source: "/samsun-dis-klinigi-doktor-web-sitesi", destination: "/samsun-dis-klinigi-doktor-web-sitesi.html" },
        { source: "/samsun-oto-galeri-web-sitesi", destination: "/samsun-oto-galeri-web-sitesi.html" },
        { source: "/samsun-guzellik-salonu-randevu-web-sitesi", destination: "/samsun-guzellik-salonu-randevu-web-sitesi.html" },
        { source: "/samsun-spor-salonu-uyelik-sistemi", destination: "/samsun-spor-salonu-uyelik-sistemi.html" },
        { source: "/samsun-kafe-restoran-web-sitesi", destination: "/samsun-kafe-restoran-web-sitesi.html" },
        { source: "/samsun-veteriner-web-sitesi", destination: "/samsun-veteriner-web-sitesi.html" },
        { source: "/samsun-instagram-satis-sayfasi", destination: "/samsun-instagram-satis-sayfasi.html" },
      ],
    };
  },
};
module.exports = nextConfig;
