"use client";
import { useState, useEffect, useCallback } from "react";
import type { Stok, Hesap } from "../../../lib/db";

const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

const emptyStok = { ad: "", maliyet: "", satis_fiyati: "", adet: "", platform: "", not_alani: "" };
const emptyHesap = { tur: "borc", kisi: "", tutar: "", aciklama: "", tarih: "" };

export default function PanelPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [stok, setStok] = useState<Stok[]>([]);
  const [hesap, setHesap] = useState<Hesap[]>([]);
  const [tab, setTab] = useState<"stok" | "hesap">("stok");

  // yeni kayıt formları
  const [ns, setNs] = useState({ ...emptyStok });
  const [nh, setNh] = useState({ ...emptyHesap });
  // düzenleme
  const [editStok, setEditStok] = useState<string | null>(null);
  const [es, setEs] = useState({ ...emptyStok });
  const [editHesap, setEditHesap] = useState<string | null>(null);
  const [eh, setEh] = useState({ ...emptyHesap });

  useEffect(() => {
    const saved = localStorage.getItem("sk_admin_key");
    if (saved) setKey(saved);
  }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/panel", { headers: { "x-admin-key": k } });
    if (!res.ok) {
      setErr("Parola yanlış.");
      setAuthed(false);
      return false;
    }
    const d = await res.json();
    setStok(d.stok || []);
    setHesap(d.hesap || []);
    setAuthed(true);
    setErr("");
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
    else setErr("İşlem başarısız.");
  }

  // ---- hesaplamalar ----
  const stokMaliyet = stok.reduce((t, s) => t + s.maliyet * s.adet, 0);
  const stokSatis = stok.reduce((t, s) => t + s.satis_fiyati * s.adet, 0);
  const karPotansiyeli = stokSatis - stokMaliyet;
  const bekleyenBorc = hesap.filter((h) => h.tur === "borc" && h.durum === "bekliyor").reduce((t, h) => t + h.tutar, 0);
  const bekleyenAlacak = hesap.filter((h) => h.tur === "alacak" && h.durum === "bekliyor").reduce((t, h) => t + h.tutar, 0);
  const net = bekleyenAlacak - bekleyenBorc;

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>Patron Paneli — Giriş</h2>
          <div className="field">
            <label>Parola</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Yönetim parolası"
            />
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
        <div className="row">
          <a className="btn ghost" href="/sk-yonetim-2025">← Yönetim</a>
        </div>
      </header>

      {/* ÖZET KARTLARI */}
      <div className="kpis">
        <div className="kpi">
          <span className="k-lbl">📦 Stokta bağlı para</span>
          <span className="k-val">{TL(stokMaliyet)}</span>
          <span className="k-sub">maliyet üzerinden</span>
        </div>
        <div className="kpi green">
          <span className="k-lbl">💰 Kâr potansiyeli</span>
          <span className="k-val">{TL(karPotansiyeli)}</span>
          <span className="k-sub">stok tümüyle satılırsa</span>
        </div>
        <div className="kpi red">
          <span className="k-lbl">🔴 Bekleyen borç</span>
          <span className="k-val">{TL(bekleyenBorc)}</span>
          <span className="k-sub">ödenmemiş</span>
        </div>
        <div className="kpi green">
          <span className="k-lbl">🟢 Bekleyen alacak</span>
          <span className="k-val">{TL(bekleyenAlacak)}</span>
          <span className="k-sub">tahsil edilmemiş</span>
        </div>
        <div className={`kpi ${net >= 0 ? "green" : "red"}`}>
          <span className="k-lbl">⚖️ Net durum</span>
          <span className="k-val">{TL(net)}</span>
          <span className="k-sub">alacak − borç</span>
        </div>
      </div>

      <div className="row" style={{ margin: "18px 0" }}>
        <button className={`btn ${tab === "stok" ? "" : "ghost"}`} onClick={() => setTab("stok")}>
          Stok ({stok.length})
        </button>
        <button className={`btn ${tab === "hesap" ? "" : "ghost"}`} onClick={() => setTab("hesap")}>
          Borç / Alacak ({hesap.length})
        </button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      {tab === "stok" ? (
        <>
          <div className="card">
            <h2>Yeni ürün</h2>
            <div className="grid2">
              <div className="field"><label>Ürün adı</label>
                <input value={ns.ad} onChange={(e) => setNs({ ...ns, ad: e.target.value })} placeholder="Örn: Clina Tea Tree" /></div>
              <div className="field"><label>Platform (ops.)</label>
                <input value={ns.platform} onChange={(e) => setNs({ ...ns, platform: e.target.value })} placeholder="Hepsiburada / ikas" /></div>
              <div className="field"><label>Birim maliyet ₺</label>
                <input type="number" inputMode="decimal" value={ns.maliyet} onChange={(e) => setNs({ ...ns, maliyet: e.target.value })} placeholder="0" /></div>
              <div className="field"><label>Satış fiyatı ₺</label>
                <input type="number" inputMode="decimal" value={ns.satis_fiyati} onChange={(e) => setNs({ ...ns, satis_fiyati: e.target.value })} placeholder="0" /></div>
              <div className="field"><label>Stok adedi</label>
                <input type="number" inputMode="numeric" value={ns.adet} onChange={(e) => setNs({ ...ns, adet: e.target.value })} placeholder="0" /></div>
              <div className="field"><label>Not (ops.)</label>
                <input value={ns.not_alani} onChange={(e) => setNs({ ...ns, not_alani: e.target.value })} placeholder="serbest not" /></div>
            </div>
            <button className="btn" onClick={async () => { if (!ns.ad.trim()) return; await act({ action: "stok_create", ...ns }); setNs({ ...emptyStok }); }}>
              Ekle
            </button>
          </div>

          <div className="card" style={{ overflowX: "auto" }}>
            <h2>Stok listesi</h2>
            {stok.length === 0 && <p className="muted">Henüz ürün yok.</p>}
            {stok.length > 0 && (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Ürün</th><th className="r">Maliyet</th><th className="r">Satış</th>
                    <th className="r">Birim kâr</th><th className="r">Adet</th><th className="r">Stok değeri</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {stok.map((s) => {
                    const birimKar = s.satis_fiyati - s.maliyet;
                    const dusuk = s.adet <= 3;
                    if (editStok === s.id) {
                      return (
                        <tr key={s.id} className="editrow">
                          <td colSpan={7}>
                            <div className="grid2">
                              <div className="field"><label>Ad</label><input value={es.ad} onChange={(e) => setEs({ ...es, ad: e.target.value })} /></div>
                              <div className="field"><label>Platform</label><input value={es.platform} onChange={(e) => setEs({ ...es, platform: e.target.value })} /></div>
                              <div className="field"><label>Maliyet ₺</label><input type="number" value={es.maliyet} onChange={(e) => setEs({ ...es, maliyet: e.target.value })} /></div>
                              <div className="field"><label>Satış ₺</label><input type="number" value={es.satis_fiyati} onChange={(e) => setEs({ ...es, satis_fiyati: e.target.value })} /></div>
                              <div className="field"><label>Adet</label><input type="number" value={es.adet} onChange={(e) => setEs({ ...es, adet: e.target.value })} /></div>
                              <div className="field"><label>Not</label><input value={es.not_alani} onChange={(e) => setEs({ ...es, not_alani: e.target.value })} /></div>
                            </div>
                            <div className="row">
                              <button className="btn" onClick={async () => { await act({ action: "stok_update", id: s.id, ...es }); setEditStok(null); }}>Kaydet</button>
                              <button className="btn ghost" onClick={() => setEditStok(null)}>Vazgeç</button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={s.id}>
                        <td>
                          <b>{s.ad}</b>
                          {s.platform && <span className="chip">{s.platform}</span>}
                          {dusuk && <span className="chip warn">az stok</span>}
                          {s.not_alani && <div className="muted sm">{s.not_alani}</div>}
                        </td>
                        <td className="r">{TL(s.maliyet)}</td>
                        <td className="r">{TL(s.satis_fiyati)}</td>
                        <td className={`r ${birimKar < 0 ? "neg" : "pos"}`}>{TL(birimKar)}</td>
                        <td className="r">{s.adet}</td>
                        <td className="r"><b>{TL(s.maliyet * s.adet)}</b></td>
                        <td className="r nowrap">
                          <button className="lnk" onClick={() => { setEditStok(s.id); setEs({ ad: s.ad, maliyet: String(s.maliyet), satis_fiyati: String(s.satis_fiyati), adet: String(s.adet), platform: s.platform || "", not_alani: s.not_alani || "" }); }}>Düzenle</button>
                          <button className="lnk del" onClick={() => confirm("Silinsin mi?") && act({ action: "stok_delete", id: s.id })}>Sil</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td><b>Toplam</b></td><td colSpan={4}></td>
                    <td className="r"><b>{TL(stokMaliyet)}</b></td><td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>Yeni kayıt</h2>
            <div className="grid2">
              <div className="field"><label>Tür</label>
                <select value={nh.tur} onChange={(e) => setNh({ ...nh, tur: e.target.value })}>
                  <option value="borc">🔴 Borç (ben ödeyeceğim)</option>
                  <option value="alacak">🟢 Alacak (bana ödenecek)</option>
                </select>
              </div>
              <div className="field"><label>Kişi / yer</label>
                <input value={nh.kisi} onChange={(e) => setNh({ ...nh, kisi: e.target.value })} placeholder="Hakan / Hepsiburada" /></div>
              <div className="field"><label>Tutar ₺</label>
                <input type="number" inputMode="decimal" value={nh.tutar} onChange={(e) => setNh({ ...nh, tutar: e.target.value })} placeholder="0" /></div>
              <div className="field"><label>Tarih (ops.)</label>
                <input type="date" value={nh.tarih} onChange={(e) => setNh({ ...nh, tarih: e.target.value })} /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}><label>Açıklama (ops.)</label>
                <input value={nh.aciklama} onChange={(e) => setNh({ ...nh, aciklama: e.target.value })} placeholder="ne için" /></div>
            </div>
            <button className="btn" onClick={async () => { if (!nh.tutar) return; await act({ action: "hesap_create", ...nh }); setNh({ ...emptyHesap }); }}>
              Ekle
            </button>
          </div>

          <div className="card">
            <h2>Defter</h2>
            {hesap.length === 0 && <p className="muted">Henüz kayıt yok.</p>}
            {hesap.map((h) => {
              if (editHesap === h.id) {
                return (
                  <div key={h.id} className="a-item">
                    <div className="grid2">
                      <div className="field"><label>Tür</label>
                        <select value={eh.tur} onChange={(e) => setEh({ ...eh, tur: e.target.value })}>
                          <option value="borc">🔴 Borç</option>
                          <option value="alacak">🟢 Alacak</option>
                        </select></div>
                      <div className="field"><label>Kişi / yer</label><input value={eh.kisi} onChange={(e) => setEh({ ...eh, kisi: e.target.value })} /></div>
                      <div className="field"><label>Tutar ₺</label><input type="number" value={eh.tutar} onChange={(e) => setEh({ ...eh, tutar: e.target.value })} /></div>
                      <div className="field"><label>Tarih</label><input type="date" value={eh.tarih} onChange={(e) => setEh({ ...eh, tarih: e.target.value })} /></div>
                      <div className="field" style={{ gridColumn: "1 / -1" }}><label>Açıklama</label><input value={eh.aciklama} onChange={(e) => setEh({ ...eh, aciklama: e.target.value })} /></div>
                    </div>
                    <div className="row">
                      <button className="btn" onClick={async () => { await act({ action: "hesap_update", id: h.id, ...eh }); setEditHesap(null); }}>Kaydet</button>
                      <button className="btn ghost" onClick={() => setEditHesap(null)}>Vazgeç</button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={h.id} className={`ledger ${h.tur} ${h.durum === "odendi" ? "done" : ""}`}>
                  <div className="l-main">
                    <span className={`dotbig ${h.tur}`} />
                    <div>
                      <b>{h.kisi || (h.tur === "borc" ? "Borç" : "Alacak")}</b>
                      {h.aciklama && <div className="muted sm">{h.aciklama}</div>}
                      <div className="muted sm">{new Date(h.tarih).toLocaleDateString("tr-TR")}</div>
                    </div>
                  </div>
                  <div className="l-right">
                    <span className={`amt ${h.tur}`}>{h.tur === "borc" ? "−" : "+"}{TL(h.tutar)}</span>
                    <div className="row" style={{ marginTop: 6, justifyContent: "flex-end" }}>
                      <button className="lnk" onClick={() => act({ action: "hesap_toggle", id: h.id, durum: h.durum === "odendi" ? "bekliyor" : "odendi" })}>
                        {h.durum === "odendi" ? "↩ bekliyor yap" : "✓ ödendi"}
                      </button>
                      <button className="lnk" onClick={() => { setEditHesap(h.id); setEh({ tur: h.tur, kisi: h.kisi || "", tutar: String(h.tutar), aciklama: h.aciklama || "", tarih: h.tarih?.slice(0, 10) || "" }); }}>Düzenle</button>
                      <button className="lnk del" onClick={() => confirm("Silinsin mi?") && act({ action: "hesap_delete", id: h.id })}>Sil</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
