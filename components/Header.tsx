"use client";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { label: "Haberler", href: "/haberler" },
  { label: "İlanlar", href: "/ilanlar" },
  { label: "Şehir Rehberi", href: "/rehber" },
  { label: "Turizm", href: "/turizm" },
  { label: "Etkinlikler", href: "/etkinlikler" },
  { label: "Hava Durumu", href: "/hava" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: "#fff", borderBottom: "2px solid #1a6fa8", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(26,111,168,0.1)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 12px", borderBottom: "1px solid #e8ecf0" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 38, height: 38, background: "#1a6fa8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="18" viewBox="0 0 24 20" fill="none">
                <path d="M2 14 Q6 7 12 10 Q18 13 22 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M2 18 Q6 11 12 14 Q18 17 22 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span style={{ fontFamily: "Merriweather,serif", fontSize: 20, fontWeight: 900, color: "#0f1923" }}>samsunkent</span>
              <span style={{ fontFamily: "Merriweather,serif", fontSize: 20, fontWeight: 900, color: "#1a6fa8" }}>.</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#1a6fa8", marginLeft: 1 }}>com</span>
            </div>
          </Link>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/ilan-ver" style={{ background: "#1a6fa8", color: "#fff", borderRadius: 20, padding: "9px 16px", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
              + İlan Ver
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "1.5px solid #e8ecf0", borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
            >
              <span style={{ display: "block", width: 18, height: 2, background: "#6b7a8d", borderRadius: 2 }}/>
              <span style={{ display: "block", width: 18, height: 2, background: "#6b7a8d", borderRadius: 2 }}/>
              <span style={{ display: "block", width: 18, height: 2, background: "#6b7a8d", borderRadius: 2 }}/>
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav style={{ display: "flex", overflowX: "auto" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 600, padding: "11px 14px", display: "block", whiteSpace: "nowrap", borderBottom: "2.5px solid transparent" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #e8ecf0", padding: "8px 0" }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} style={{ display: "block", color: "#0f1923", fontSize: 15, fontWeight: 600, padding: "12px 20px", borderBottom: "1px solid #f7f9fb" }}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
