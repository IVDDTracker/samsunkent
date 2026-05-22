"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Haberler", href: "/haberler" },
  { label: "İlanlar", href: "/ilanlar" },
  { label: "Şehir Rehberi", href: "/rehber" },
  { label: "Turizm", href: "/turizm" },
  { label: "Etkinlikler", href: "/etkinlikler" },
  { label: "Hava Durumu", href: "/hava" },
];

export default function Header() {
  const [menu, setMenu] = useState(false);

  return (
    <header style={{ background: "#fff", borderBottom: "2px solid #1a6fa8", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(26,111,168,0.1)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 10px", borderBottom: "1px solid #e8ecf0" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, background: "#1a6fa8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="18" viewBox="0 0 24 20" fill="none">
                <path d="M2 14 Q6 7 12 10 Q18 13 22 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M2 18 Q6 11 12 14 Q18 17 22 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span style={{ fontFamily: "Merriweather, serif", fontSize: 22, fontWeight: 900, color: "#0f1923" }}>samsunkent</span>
              <span style={{ fontFamily: "Merriweather, serif", fontSize: 22, fontWeight: 900, color: "#1a6fa8" }}>.</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1a6fa8", letterSpacing: "0.1em", marginLeft: 1 }}>com</span>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#e8f4fd", border: "1.5px solid rgba(26,111,168,0.25)", borderRadius: 24, padding: "9px 18px", width: 260 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6fa8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span style={{ color: "#0d4f7c", fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Samsun&apos;da ara...</span>
            </div>
            <Link href="/ilan-ver" style={{ background: "#1a6fa8", color: "#fff", borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
              + İlan Ver
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex" }}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} style={{ color: "#6b7a8d", fontSize: 13, fontWeight: 600, padding: "10px 14px", borderBottom: "2.5px solid transparent", textDecoration: "none", display: "block" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}