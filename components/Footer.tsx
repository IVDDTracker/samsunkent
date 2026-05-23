import Link from "next/link";
export default function Footer() {
  return (
    <footer style={{ background: "#0d4f7c", padding: "32px 0 20px", marginTop: 48 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 1, marginBottom: 10 }}>
            <span style={{ fontFamily: "Merriweather,serif", fontSize: 20, fontWeight: 900, color: "#fff" }}>samsunkent</span>
            <span style={{ fontFamily: "Merriweather,serif", fontSize: 20, fontWeight: 900, color: "#7dd3fc" }}>.</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#7dd3fc", marginLeft: 1 }}>com</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7 }}>Samsun&apos;un dijital şehir platformu. Haber, ilan, rehber — hepsi burada.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
          {([["Platform",[["Haberler","/haberler"],["İlanlar","/ilanlar"],["Şehir Rehberi","/rehber"],["Etkinlikler","/etkinlikler"]]],["Destek",[["İlan Ver","/ilan-ver"],["Reklam Ver","/reklam"],["İletişim","/iletisim"],["S.S.S.","/sss"]]],["Hukuki",[["Gizlilik","/gizlilik"],["KVKK","/kvkk"],["Kullanım Şartları","/sartlar"],["Çerezler","/cerezler"]]]] as [string,[string,string][]][]).map(([t,ls])=>(
            <div key={t}>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", marginBottom: 10 }}>{t.toUpperCase()}</p>
              {ls.map(([l,h])=><Link key={l} href={h} style={{ display: "block", color: "rgba(255,255,255,0.28)", fontSize: 13, marginBottom: 7 }}>{l}</Link>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12 }}>© 2026 samsunkent.com</span>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 12 }}>Karadeniz&apos;in dijital kalbi 🌊</span>
        </div>
      </div>
    </footer>
  );
}
