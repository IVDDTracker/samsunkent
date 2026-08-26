import type { Metadata } from "next";
import { Anton } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Sinematik hero başlığı için sıkışık, ağır grotesk.
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "samsunkent — Mekân · Sokak · Gündem",
  description:
    "Buralıyım, buraları biliyorum. Samsun'un mekânı, sokağı, gündemi — ve iş birliği için ulaşabileceğin tek pano.",
  metadataBase: new URL("https://samsunkent.com"),
  verification: {
    google: "SFdjOmq3jjKd4vUGMGgR7N4cymxTwfCyYYYRX0GquSQ",
  },
  openGraph: {
    title: "samsunkent — Mekân · Sokak · Gündem",
    description: "Buralıyım, buraları biliyorum. İş birliği için: samsunkent.com",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={anton.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
