import type { Metadata } from "next";
import OznakliyatClient from "./OznakliyatClient";

// Bu bir firmaya özel tanıtım/örnek sayfasıdır. Arama motorlarında indekslenmesini
// istemiyoruz — link doğrudan paylaşılınca açılır (samsunkent.com'un SEO'suna karışmaz).
export const metadata: Metadata = {
  title: "Özin Nakliyat — Samsun Evden Eve Nakliyat",
  description:
    "Samsun evden eve nakliyat. Eşyalarınız tek tek balonlu naylonla sarılır, sigortalı taşınır. Ücretsiz keşif ve net fiyat.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Özin Nakliyat — Samsun Evden Eve Nakliyat",
    description:
      "Eşyalarınız tek tek sarılır, sigortalı taşınır. Ücretsiz keşif, net fiyat. Hemen fiyat alın.",
    images: ["/oznakliyat/ozin-1.jpg"],
    locale: "tr_TR",
    type: "website",
  },
};

export default function Page() {
  return <OznakliyatClient />;
}
