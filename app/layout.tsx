import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "samsunkent — Mekân · Sokak · Gündem",
  description:
    "Buralıyım, buraları biliyorum. Samsun'un mekânı, sokağı, gündemi — ve iş birliği için ulaşabileceğin tek pano.",
  metadataBase: new URL("https://samsunkent.com"),
  openGraph: {
    title: "samsunkent — Mekân · Sokak · Gündem",
    description: "Buralıyım, buraları biliyorum. İş birliği için: samsunkent.com",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
