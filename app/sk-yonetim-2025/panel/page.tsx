"use client";
import { useState, useEffect, useCallback } from "react";
import type { Urun } from "../../../lib/urunler";

interface Hareket {
  id: string;
  tur: "alim" | "satis";
  urun_id: string | null;
  urun_ad: string | null;
  adet: number;
  birim_fiyat: number;
  tutar: number;
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
  const [tab, setTab] = useState<"alim" | "satis">("alim");

  // satır girişleri (urun_id -> değer)
  const [aQty, setAQty] = useState<Record<string, string>>({});
  const [sQty, setSQty] = useState<Record<string, string>>({});
  const [sFiyat, setSFiyat] = useState<Record<string, string>>({});

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
    if (res.ok) { await load(key); return true; }
    const d = await res.json().catch(() => ({}));
    setErr(d.error || "İşlem başarısız.");
    return false;
  }

  // ---- hesaplar ----
  const alimlar = hareket.filter((h) => h.tur === "alim");
  const satislar = hareket.filter((h) => h.tur === "satis");
  const toplamBorc = alimlar.reduce((t, h) => t + h.tutar, 0);
  const toplamGelir = satislar.reduce((t, h) => t + h.tutar, 0);
  const net = toplamBorc - toplamGelir; // >0: hâlâ borç · <0: alacak/kârda

  const stokOf = (id: string) =>
    alimlar.filter((h) => h.urun_id === id).reduce((t, h) => t + h.adet, 0) -
    satislar.filter((h) => h.urun_id === id).reduce((t, h) => t + h.adet, 0);
  const toplamStok = urunler.reduce((t, u) => t + stokOf(u.id), 0);

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

      {/* ÖZET KARTLARI */}
      <div className="kpis">
        <div className="kpi red">
          <span className="k-lbl">🔴 Toplam borç (alım)</span>
          <span className="k-val">{TL(toplamBorc)}</span>
          <span className="k-sub">{alimlar.reduce((t, h) => t + h.adet, 0)} adet alındı · sabit</span>
        </div>
        <div className="kpi green">
          <span className="k-lbl">💵 Toplam satış geliri</span>
          <span className="k-val">{TL(toplamGelir)}</span>
          <span className="k-sub">{satislar.reduce((t, h) => t + h.adet, 0)} adet satıldı</span>
        </div>
        <div className="kpi">
          <span className="k-lbl">📦 Eldeki stok</span>
          <span className="k-val">{toplamStok} adet</span>
          <span className="k-sub">alınan − satılan</span>
        </div>
      </div>

      <div className="row" style={{ margin: "18px 0" }}>
        <button className={`btn ${tab === "alim" ? "" : "ghost"}`} onClick={() => setTab("alim")}>Alım / Borç</button>
        <button className={`btn ${tab === "satis" ? "" : "ghost"}`} onClick={() => setTab("satis")}>Satış / Gelir</button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      {/* ---- ALIM ---- */}
      {tab === "alim" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <h2>Alım gir — hangi üründen kaç aldın?</h2>
          <table className="tbl">
            <thead>
              <tr><th>Ürün</th><th className="r">Alış (KDV dahil)</th><th className="r">Adet</th><th></th></tr>
            </thead>
            <tbody>
              {urunler.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.ad}</b></td>
                  <td className="r">{TL(u.alis)}</td>
                  <td className="r">
                    <input className="qin" type="number" inputMode="numeric" placeholder="0"
                      value={aQty[u.id] || ""} onChange={(e) => setAQty({ ...aQty, [u.id]: e.target.value })} />
                  </td>
                  <td className="r">
                    <button className="btn" style={{ padding: "7px 14px" }} onClick={async () => {
                      if (!Number(aQty[u.id])) return;
                      if (await act({ action: "alim", urun_id: u.id, adet: aQty[u.id] })) setAQty({ ...aQty, [u.id]: "" });
                    }}>Aldım</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 22 }}>Alım geçmişi</h2>
          {alimlar.length === 0 && <p className="muted">Henüz alım yok.</p>}
          {alimlar.map((h) => (
            <div key={h.id} className="ledger borc">
              <div className="l-main">
                <span className="dotbig borc" />
                <div><b>{h.urun_ad} × {h.adet}</b><div className="muted sm">{dt(h.tarih)} · {TL(h.birim_fiyat)}/adet</div></div>
              </div>
              <div className="l-right">
                <span className="amt borc">+{TL(h.tutar)}</span>
                <div className="row" style={{ marginTop: 6, justifyContent: "flex-end" }}>
                  <button className="lnk del" onClick={() => confirm("Bu alım silinsin mi?") && act({ action: "delete", id: h.id })}>Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- SATIŞ ---- */}
      {tab === "satis" && (
        <div className="card" style={{ overflowX: "auto" }}>
          <h2>Satış gir — kaç sattın, kaç paraya?</h2>
          <table className="tbl">
            <thead>
              <tr><th>Ürün</th><th className="r">Stok</th><th className="r">Adet</th><th className="r">Satış ₺ (KDV dahil)</th><th></th></tr>
            </thead>
            <tbody>
              {urunler.map((u) => {
                const stok = stokOf(u.id);
                return (
                  <tr key={u.id}>
                    <td><b>{u.ad}</b></td>
                    <td className="r"><span className={stok <= 0 ? "neg" : ""}>{stok}</span></td>
                    <td className="r">
                      <input className="qin" type="number" inputMode="numeric" placeholder="0"
                        value={sQty[u.id] || ""} onChange={(e) => setSQty({ ...sQty, [u.id]: e.target.value })} />
                    </td>
                    <td className="r">
                      <input className="qin wide" type="number" inputMode="decimal" placeholder="0"
                        value={sFiyat[u.id] || ""} onChange={(e) => setSFiyat({ ...sFiyat, [u.id]: e.target.value })} />
                    </td>
                    <td className="r">
                      <button className="btn" style={{ padding: "7px 14px" }} onClick={async () => {
                        if (!Number(sQty[u.id]) || !Number(sFiyat[u.id])) return;
                        if (await act({ action: "satis", urun_id: u.id, adet: sQty[u.id], fiyat: sFiyat[u.id] })) {
                          setSQty({ ...sQty, [u.id]: "" }); setSFiyat({ ...sFiyat, [u.id]: "" });
                        }
                      }}>Sattım</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 style={{ marginTop: 22 }}>Satış geçmişi</h2>
          {satislar.length === 0 && <p className="muted">Henüz satış yok.</p>}
          {satislar.map((h) => (
            <div key={h.id} className="ledger alacak">
              <div className="l-main">
                <span className="dotbig alacak" />
                <div><b>{h.urun_ad} × {h.adet}</b><div className="muted sm">{dt(h.tarih)} · {TL(h.birim_fiyat)}/adet</div></div>
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
      )}

      {/* ---- ÖZET (altta, hep görünür) ---- */}
      <div className="card" style={{ overflowX: "auto", marginTop: 8 }}>
        <h2>📊 Özet</h2>
        <table className="tbl">
          <thead><tr><th>Ürün</th><th className="r">Stok</th></tr></thead>
          <tbody>
            {urunler.map((u) => {
              const stok = stokOf(u.id);
              return (
                <tr key={u.id}>
                  <td><b>{u.ad}</b>{stok <= 3 && stok > 0 && <span className="chip warn">az</span>}</td>
                  <td className="r"><b>{stok}</b></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr><td><b>Toplam stok</b></td><td className="r"><b>{toplamStok} adet</b></td></tr></tfoot>
        </table>
        <div className="netbox">
          {net > 0 ? (
            <><span>🔴 Hakan&apos;a kalan borç</span><b className="neg">{TL(net)}</b></>
          ) : (
            <><span>🟢 Borç kapandı — alacak / kârda</span><b className="pos">{TL(-net)}</b></>
          )}
        </div>
        <p className="muted sm" style={{ marginTop: 8 }}>
          Toplam alım borcu {TL(toplamBorc)} · toplam satış geliri {TL(toplamGelir)} → net.
        </p>
      </div>
    </div>
  );
}
