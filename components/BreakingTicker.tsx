"use client";
import { useState, useEffect } from "react";
const DEFAULT = ["Samsun Büyükşehir'den yeni ulaşım hamlesi","Samsunspor bu hafta kritik maça çıkıyor","Samsun'da hava bugün güneşli, 24°C","OMÜ Türkiye'nin en iyi 10 üniversitesi arasında"];
export default function BreakingTicker({ items = DEFAULT }: { items?: string[] }) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i+1) % items.length); setVis(true); }, 300);
    }, 4000);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <div style={{ background: "#e53935", display: "flex", alignItems: "stretch" }}>
      <div style={{ background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "5px 14px", letterSpacing: "0.14em", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>SON DAKİKA</div>
      <div style={{ padding: "5px 16px", overflow: "hidden", flex: 1 }}>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, opacity: vis ? 1 : 0, transition: "opacity 0.3s", whiteSpace: "nowrap" }}>{items[idx]}</span>
      </div>
    </div>
  );
}
