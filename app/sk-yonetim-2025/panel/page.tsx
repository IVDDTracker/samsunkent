"use client";
import { useState, useEffect, useCallback } from "react";
import type { Urun } from "../../../lib/urunler";

interface Hareket {
  id: string;
  tur: "alim" | "satis" | "odeme";
  urun_id: string | null;
  urun_ad: string | null;
  adet: number;
  tutar: number;
  kisi: string | null;
  not_alani: string | null;
  tarih: string;
  created_at: string;
}

const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );
const dt = (s: string) => {
  try { return new Date(s).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }); } catch { return ""; }
};

export default function PanelPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [hareket, setHareket] = useState<Hareket[]>([]);
  const [tab, setTab] = useState<"alim" | "satis" | "stok">("satis");

  // formlar
  const [aUrun, setAUrun] = useState("");
  const [aAdet, setAAdet] = useState("");
  const [sUrun, setSUrun] = useState("");
  const [sAdet, setSAdet] = useState("");
  const [oTutar, setOTutar] = useState("");
  const [oKisi, setOKisi] = useState("Hakan");

  useEffect(() => {
    const saved = localStorage.getItem("sk_admin_key");
    if (saved) setKey(saved);
  }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/panel", { headers: { "x-admin-key": k } });
    if (!res.ok) { setErr("Parola yanlış."); setAuthed(false); return false; }
    const d = await res.json();
    setUrunler(d.urunler || []);
    setHareket(d.hareket || []);
    setAuthed(true); setErr("");
    return true;
  }, []);

  async function login() {
    const ok = await load(key);
    if (ok) localStorage.setItem("sk_admin_key", key);
  }
  async function act(payload: Record<string, unknown>) {
    const res = await fetch("/api/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(payload),
    });
    if (res.ok) await load(key);
    else { const d = await res.json().catch(() => ({})); setErr(d.error || "İşlem başarısız."); }
  }

  // ---- hesaplar ----
  const alimlar = hareket.filter((h) => h.tur === "alim");
  const satislar = hareket.filter((h) => h.tur === "satis");
  const odemeler = hareket.filter((h) => h.tur === "odeme");
  const toplamAlim = alimlar.reduce((t, h) => t + h.tutar, 0);
  const toplamOdeme = odemeler.reduce((t, h) => t + h.tutar, 0);
  const kalanBorc = toplamAlim - toplamOdeme;
  const toplamKar = satislar.reduce((t, h) => t + h.tutar, 0);

  // ürün bazında stok = alınan - satılan
  const stokMap: Record<string, number> = {};
  for (const u of urunler) stokMap[u.id] = 0;
  for (const h of hareket) {
    if (!h.urun_id) continue;
    if (h.tur === "alim") stokMap[h.urun_id] = (stokMap[h.urun_id] || 0) + h.adet;
    if (h.tur === "satis") stokMap[h.urun_id] = (stokMap[h.urun_id] || 0) - h.adet;
  }
  const toplamStok = Object.values(stokMap).reduce((t, n) => t + n, 0);

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>Patron Paneli — Giriş</h2>
          <div className="field">
            <label>Parola</label>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Yönetim parolası" />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn" onClick={login}>Giriş</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="top" style={{ marginBottom: 18 }}>
        <div className="brand" style={{ color: "var(--ink)", textShadow: "none" }}>
          Patron Paneli<span className="dot">.</span>
          <span className="tag" style={{ color: "var(--ink-soft)" }}>Sadece sana özel</span>
        </div>
        <div className="row"><a className="btn ghost" href="/sk-yonetim-2025">← Yönetim</a></div>
      </header>

      {/* ÖZET */}
      <div className="kpis">
        <div className="kpi green">
          <span className="k-lbl">🟢 Toplam kâr</span>
          <span className="k-val">{TL(toplamKar)}</span>
          <span className="k-sub">{satislar.reduce((t, h) => t + h.adet, 0)} satıştan bugüne</span>
        </div>
        <div className="kpi red">
          <span className="k-lbl">🔴 Kalan borç</span>
          <span className="k-val">{TL(kalanBorc)}</span>
          <span className="k-sub">alım {TL(toplamAlim)} − ödeme {TL(toplamOdeme)}</span>
        </div>
        <div className="kpi">
          <span className="k-lbl">📦 Eldeki stok</span>
          <span className="k-val">{toplamStok} adet</span>
          <span className="k-sub">alınan − satılan</span>
        </div>
      </div>

      <div className="row" style={{ margin: "18px 0" }}>
        <button className={`btn ${tab === "satis" ? "" : "ghost"}`} onClick={() => setTab("satis")}>Satış / Kâr</button>
        <button className={`btn ${tab === "alim" ? "" : "ghost"}`} onClick={() => setTab("alim")}>Alım / Borç</button>
        <button className={`btn ${tab === "stok" ? "" : "ghost"}`} onClick={() => setTab("stok")}>Stok</button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      {/* ---- SATIŞ ---- */}
      {tab === "satis" && (
        <>
          <div className="card">
            <h2>Satış gir — kaç sattın?</h2>
            <div className="grid2">
              <div className="field"><label>Ürün</label>
                <select value={sUrun} onChange={(e) => setSUrun(e.target.value)}>
                  <option value="">Seç…</option>
                  {urunler.map((u) => <option key={u.id} value={u.id}>{u.ad} — kâr {TL(u.kar)}</option>)}
                </select>
              </div>
              <div className="field"><label>Adet</label>
                <input type="number" inputMode="numeric" value={sAdet} onChange={(e) => setSAdet(e.target.value)} placeholder="1" />
              </div>
            </div>
            {sUrun && sAdet && (
              <p className="muted" style={{ marginBottom: 12 }}>
                Bu satıştan kazancın: <b style={{ color: "#217a49" }}>
                  {TL((urunler.find((u) => u.id === sUrun)?.kar || 0) * (Number(sAdet) || 0))}
                </b>
              </p>
            )}
            <button className="btn" onClick={async () => {
              if (!sUrun || !sAdet) return;
              await act({ action: "satis", urun_id: sUrun, adet: sAdet });
              setSUrun(""); setSAdet("");
            }}>Sattım ✓</button>
          </div>

          <div className="card">
            <h2>Satış geçmişi</h2>
            {satislar.length === 0 && <p className="muted">Henüz satış yok.</p>}
            {satislar.map((h) => (
              <div key={h.id} className="ledger alacak">
                <div className="l-main">
                  <span className="dotbig alacak" />
                  <div>
                    <b>{h.urun_ad} × {h.adet}</b>
                    <div className="muted sm">{dt(h.tarih)}</div>
                  </div>
                </div>
                <div className="l-right">
                  <span className="amt alacak">+{TL(h.tutar)}</span>
                  <div className="row" style={{ marginTop: 6, justifyContent: "flex-end" }}>
                    <button className="lnk del" onClick={() => confirm("Bu satış silinsin mi?") && act({ action: "delete", id: h.id })}>Sil</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- ALIM / BORÇ ---- */}
      {tab === "alim" && (
        <>
          <div className="card">
            <h2>Alım gir — kaç aldın?</h2>
            <div className="grid2">
              <div className="field"><label>Ürün</label>
                <select value={aUrun} onChange={(e) => setAUrun(e.target.value)}>
                  <option value="">Seç…</option>
                  {urunler.map((u) => <option key={u.id} value={u.id}>{u.ad} — alış {TL(u.alis)}</option>)}
                </select>
              </div>
              <div className="field"><label>Adet</label>
                <input type="number" inputMode="numeric" value={aAdet} onChange={(e) => setAAdet(e.target.value)} placeholder="10" />
              </div>
            </div>
            {aUrun && aAdet && (
              <p className="muted" style={{ marginBottom: 12 }}>
                Borcuna eklenecek: <b style={{ color: "#b32d20" }}>
                  {TL((urunler.find((u) => u.id === aUrun)?.alis || 0) * (Number(aAdet) || 0))}
                </b>
              </p>
            )}
            <button className="btn" onClick={async () => {
              if (!aUrun || !aAdet) return;
              await act({ action: "alim", urun_id: aUrun, adet: aAdet });
              setAUrun(""); setAAdet("");
            }}>Aldım (borca ekle)</button>
          </div>

          <div className="card">
            <h2>Ödeme gir — borç düş</h2>
            <div className="grid2">
              <div className="field"><label>Kime</label>
                <input value={oKisi} onChange={(e) => setOKisi(e.target.value)} placeholder="Hakan" />
              </div>
              <div className="field"><label>Tutar ₺</label>
                <input type="number" inputMode="decimal" value={oTutar} onChange={(e) => setOTutar(e.target.value)} placeholder="0" />
              </div>
            </div>
            <button className="btn ghost" onClick={async () => {
              if (!oTutar) return;
              await act({ action: "odeme", tutar: oTutar, kisi: oKisi });
              setOTutar("");
            }}>Ödedim (borçtan düş)</button>
          </div>

          <div className="card">
            <h2>Alım & ödeme geçmişi</h2>
            {alimlar.length === 0 && odemeler.length === 0 && <p className="muted">Henüz kayıt yok.</p>}
            {[...alimlar, ...odemeler]
              .sort((a, b) => (b.tarih + b.created_at).localeCompare(a.tarih + a.created_at))
              .map((h) => (
                <div key={h.id} className={`ledger ${h.tur === "odeme" ? "alacak" : "borc"}`}>
                  <div className="l-main">
                    <span className={`dotbig ${h.tur === "odeme" ? "alacak" : "borc"}`} />
                    <div>
                      <b>{h.tur === "odeme" ? `Ödeme → ${h.kisi || "Hakan"}` : `${h.urun_ad} × ${h.adet} (alım)`}</b>
                      <div className="muted sm">{dt(h.tarih)}</div>
                    </div>
                  </div>
                  <div className="l-right">
                    <span className={`amt ${h.tur === "odeme" ? "alacak" : "borc"}`}>
                      {h.tur === "odeme" ? "−" : "+"}{TL(h.tutar)}
                    </span>
                    <div className="row" style={{ marginTop: 6, justifyContent: "flex-end" }}>
                      <button className="lnk del" onClick={() => confirm("Silinsin mi?") && act({ action: "delete", id: h.id })}>Sil</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* ---- STOK ---- */}
      {tab === "stok" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <h2>Ürün bazında stok</h2>
          <table className="tbl">
            <thead>
              <tr><th>Ürün</th><th className="r">Alınan</th><th className="r">Satılan</th><th className="r">Kalan</th></tr>
            </thead>
            <tbody>
              {urunler.map((u) => {
                const alinan = alimlar.filter((h) => h.urun_id === u.id).reduce((t, h) => t + h.adet, 0);
                const satilan = satislar.filter((h) => h.urun_id === u.id).reduce((t, h) => t + h.adet, 0);
                const kalan = alinan - satilan;
                return (
                  <tr key={u.id}>
                    <td><b>{u.ad}</b>{kalan <= 3 && alinan > 0 && <span className="chip warn">az</span>}</td>
                    <td className="r">{alinan}</td>
                    <td className="r">{satilan}</td>
                    <td className="r"><b>{kalan}</b></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr><td><b>Toplam</b></td><td colSpan={2}></td><td className="r"><b>{toplamStok}</b></td></tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
