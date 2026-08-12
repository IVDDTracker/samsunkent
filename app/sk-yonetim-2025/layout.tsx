import type { Metadata } from "next";

// Yönetim paneli aramada ASLA görünmemeli.
// robots.txt zaten disallow ediyor; bu meta noindex ikinci ve daha güçlü katman.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
