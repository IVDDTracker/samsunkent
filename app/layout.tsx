import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "samsunkent.com — Şehrin Dijital Merkezi", template: "%s | samsunkent.com" },
  description: "Samsun haberleri, ilanlar, şehir rehberi. Karadeniz'in dijital kalbi.",
  metadataBase: new URL("https://samsunkent.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
