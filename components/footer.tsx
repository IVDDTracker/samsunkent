import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0d4f7c", padding: "36px 0 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 36, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 1, marginBottom: 12 }}>
              <span style={{ fontFamily: "Merriweather, serif", fontSize: 20, fontWeight: 900, color: "#fff" }}>samsunkent</span>
              <span style={{ fontFamily: "Merriweather, serif", fontSize: 20, fontWeight: 900, color: "#7dd3fc" }}>.</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#7dd3fc", letterSpacing: "0.1em", marginLeft: 1 }}>com</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.8, fontWeight: 600 }}>
              Samsun&apos;un dijital şehir platformu.<br />
              Haber, ilan, rehber — hepsi burada.
            </p>
          </div>
          {[
            ["Platform", ["Haberler", "İlanlar", "Şehir Rehberi", "Etkinlikler"]],
            ["Destek", ["İlan Ver", "Reklam Ver", "İletişim", "S.S.S."]],
            ["Hukuki", ["Gizlilik", "Kullanım Şartları", "KVKK", "Çerezler"]],
          ].map(([title, links]) => (
            <div key={title as string}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14 }}>
                {(title as string).toUpperCase()}
              </p>
              {(links as string[]).map((l) => (
                <Link key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.28)", fontSize: 13, fontWeight: 600, marginBottom: 9, textDecoration: "none" }}>
                  {l}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12, fontWeight: 600 }}>© 2026 samsunkent.com</span>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12, fontWeight: 600 }}>Karadeniz&apos;in dijital kalbi 🌊</span>
        </div>
      </div>
    </footer>
  );
}