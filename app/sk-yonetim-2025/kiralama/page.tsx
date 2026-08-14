"use client";
import { useState, useEffect, useCallback } from "react";

interface Rental {
  id: string;
  created_at: string;
  items: string[];
  start_date: string;
  days: number;
  end_date: string;
  customer_name: string | null;
  customer_phone: string;
  total: number | null;
  payment: string | null;
  note: string | null;
  status: "pending" | "confirmed" | "cancelled";
}
interface WaitItem {
  id: string;
  created_at: string;
  items: string[];
  start_date: string;
  days: number | null;
  customer_name: string | null;
  customer_phone: string;
  status: "waiting" | "notified" | "done";
}

const ITEM_LABEL: Record<string, string> = { ps5: "🎮 PS5", proj: "📽️ Projeksiyon", perde: "🖥️ Perde" };
const PAY_LABEL: Record<string, string> = { "kapida-nakit": "Kapıda nakit", "kapida-kart": "Kapıda kart" };
const TL = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
const d = (s: string) => {
  try { return new Date(s + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", weekday: "short" }); }
  catch { return s; }
};
const dtFull = (s: string) => {
  try { return new Date(s).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

export default function KiralamaAdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [warn, setWarn] = useState("");
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [waitlist, setWaitlist] = useState<WaitItem[]>([]);
  const [view, setView] = useState<"rezervasyon" | "bekleme">("rezervasyon");
  const [filter, setFilter] = useState<"aktif" | "pending" | "confirmed" | "cancelled" | "hepsi">("aktif");

  useEffect(() => {
    const saved = localStorage.getItem("sk_admin_key");
    if (saved) setKey(saved);
  }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/kiralama-yonetim", { headers: { "x-admin-key": k } });
    if (!res.ok) { setErr("Parola yanlış."); setAuthed(false); return false; }
    const j = await res.json();
    setRentals(j.rentals || []);
    setWaitlist(j.waitlist || []);
    setWarn(j.warn || "");
    setAuthed(true); setErr("");
    return true;
  }, []);

  async function login() {
    const ok = await load(key);
    if (ok) localStorage.setItem("sk_admin_key", key);
  }
  async function act(payload: Record<string, unknown>) {
    const res = await fetch("/api/kiralama-yonetim", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(payload),
    });
    if (res.ok) { await load(key); return true; }
    const j = await res.json().catch(() => ({}));
    setErr(j.error || "İşlem başarısız.");
    return false;
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const pendingCount = rentals.filter((r) => r.status === "pending").length;
  const confirmedUpcoming = rentals.filter((r) => r.status === "confirmed" && r.end_date >= todayIso);
  const gelir = confirmedUpcoming.reduce((t, r) => t + (r.total || 0), 0);

  const shown = rentals.filter((r) => {
    if (filter === "hepsi") return true;
    if (filter === "aktif") return r.status !== "cancelled" && r.end_date >= todayIso;
    return r.status === filter;
  });

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>Kiralamalar — Giriş</h2>
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
          Kiralamalar<span className="dot">.</span>
          <span className="tag" style={{ color: "var(--ink-soft)" }}>Büyük Ekran rezervasyonları</span>
        </div>
        <div className="row"><a className="btn ghost" href="/sk-yonetim-2025">← Yönetim</a></div>
      </header>

      {warn && <div className="err" style={{ marginBottom: 12 }}>{warn}</div>}

      <div className="row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <button className={`btn ${view === "rezervasyon" ? "" : "ghost"}`} onClick={() => setView("rezervasyon")}>📋 Rezervasyonlar</button>
        <button className={`btn ${view === "bekleme" ? "" : "ghost"}`} onClick={() => setView("bekleme")}>
          🔖 Bekleme listesi ({waitlist.filter((w) => w.status === "waiting").length})
        </button>
        <button className="btn ghost" onClick={() => load(key)}>↻ Yenile</button>
      </div>

      {view === "rezervasyon" ? (
      <>
      <div className="kpis">
        <div className="kpi red">
          <span className="k-lbl">🟠 Onay bekleyen</span>
          <span className="k-val">{pendingCount}</span>
          <span className="k-sub">müşteriyi ara, teyit et</span>
        </div>
        <div className="kpi green">
          <span className="k-lbl">✅ Onaylı (gelecek)</span>
          <span className="k-val">{confirmedUpcoming.length}</span>
          <span className="k-sub">yaklaşan teslimler</span>
        </div>
        <div className="kpi">
          <span className="k-lbl">💵 Onaylı gelir (gelecek)</span>
          <span className="k-val">{TL(gelir)}</span>
          <span className="k-sub">tahmini tutar toplamı</span>
        </div>
      </div>

      <div className="row" style={{ margin: "18px 0", flexWrap: "wrap" }}>
        {([
          ["aktif", "Aktif"],
          ["pending", `Onay bekleyen (${pendingCount})`],
          ["confirmed", "Onaylı"],
          ["cancelled", "İptal"],
          ["hepsi", "Hepsi"],
        ] as const).map(([f, lbl]) => (
          <button key={f} className={`btn ${filter === f ? "" : "ghost"}`} onClick={() => setFilter(f)}>{lbl}</button>
        ))}
        <button className="btn ghost" onClick={() => load(key)}>↻ Yenile</button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      <div className="card">
        {shown.length === 0 && <p className="muted" style={{ color: "var(--ink-soft)", fontSize: 14 }}>Bu görünümde rezervasyon yok.</p>}
        {shown.map((r) => {
          const past = r.end_date < todayIso;
          const cls = r.status === "cancelled" ? "done" : r.status === "confirmed" ? "alacak" : "borc";
          return (
            <div key={r.id} className={`ledger ${cls}`} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <b style={{ fontSize: 15 }}>{r.items.map((i) => ITEM_LABEL[i] || i).join(" · ")}</b>
                  <div className="muted sm" style={{ color: "var(--ink-soft)", marginTop: 3 }}>
                    {d(r.start_date)} → {d(r.end_date)} · <b>{r.days} gün</b>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="amt" style={{ fontSize: 16 }}>{TL(r.total)}</span>
                  <div>
                    <span className="chip" style={{
                      background: r.status === "confirmed" ? "rgba(46,139,87,.14)" : r.status === "cancelled" ? "rgba(0,0,0,.08)" : "rgba(203,58,43,.12)",
                      color: r.status === "confirmed" ? "#217a49" : r.status === "cancelled" ? "var(--ink-soft)" : "var(--red)",
                    }}>
                      {r.status === "confirmed" ? "onaylı" : r.status === "cancelled" ? "iptal" : "bekliyor"}
                    </span>
                    {past && r.status !== "cancelled" && <span className="chip warn">geçmiş</span>}
                  </div>
                </div>
              </div>

              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 13 }}>
                  📞 <a href={`tel:${r.customer_phone}`} style={{ fontWeight: 800, color: "var(--navy)" }}>{r.customer_phone}</a>
                  {r.customer_name && <span style={{ color: "var(--ink-soft)" }}> · {r.customer_name}</span>}
                  {r.payment && <span style={{ color: "var(--ink-soft)" }}> · {PAY_LABEL[r.payment] || r.payment}</span>}
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>geldi: {dtFull(r.created_at)}</span>
              </div>
              {r.note && <p style={{ fontSize: 12.5, color: "var(--ink-soft)", whiteSpace: "pre-wrap" }}>📝 {r.note}</p>}

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {r.status !== "confirmed" && (
                  <button className="btn" style={{ padding: "7px 14px" }} onClick={() => act({ action: "confirm", id: r.id })}>✅ Onayla</button>
                )}
                {r.status !== "cancelled" && (
                  <button className="btn ghost" style={{ padding: "7px 14px" }} onClick={() => confirm("Bu rezervasyon iptal edilsin mi? (Günler tekrar müsait olur)") && act({ action: "cancel", id: r.id })}>İptal et</button>
                )}
                {r.status !== "pending" && (
                  <button className="btn ghost" style={{ padding: "7px 14px" }} onClick={() => act({ action: "pending", id: r.id })}>Beklemeye al</button>
                )}
                <a className="btn ghost" style={{ padding: "7px 14px" }} href={`https://wa.me/${r.customer_phone.replace(/\D/g, "").replace(/^0/, "90")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <button className="btn red" style={{ padding: "7px 14px", marginLeft: "auto" }} onClick={() => confirm("Kayıt tamamen silinsin mi?") && act({ action: "delete", id: r.id })}>Sil</button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="muted sm" style={{ marginTop: 12, color: "var(--ink-soft)", fontSize: 12.5 }}>
        Not: Yalnızca <b>bekleyen</b> ve <b>onaylı</b> rezervasyonlar takvimde günü kapatır. İptal edilenler günü tekrar açar.
      </p>
      </>
      ) : (
      <>
      <div className="kpis">
        <div className="kpi red">
          <span className="k-lbl">🔖 Bekleyen talep</span>
          <span className="k-val">{waitlist.filter((w) => w.status === "waiting").length}</span>
          <span className="k-sub">dolu güne talip müşteri</span>
        </div>
        <div className="kpi">
          <span className="k-lbl">📊 Toplam kayıt</span>
          <span className="k-val">{waitlist.length}</span>
          <span className="k-sub">kaçan talep = 2. set verisi</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {waitlist.length === 0 && (
          <p className="muted" style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Henüz bekleyen talep yok. Dolu bir güne tıklayıp telefon bırakan müşteriler burada birikir.
          </p>
        )}
        {waitlist.map((w) => (
          <div key={w.id} className={`ledger ${w.status === "waiting" ? "borc" : "done"}`} style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <b style={{ fontSize: 15 }}>{w.items.map((i) => ITEM_LABEL[i] || i).join(" · ")}</b>
                <div className="muted sm" style={{ color: "var(--ink-soft)", marginTop: 3 }}>
                  İstenen: <b>{d(w.start_date)}</b>{w.days ? ` · ${w.days} gün` : ""}
                </div>
              </div>
              <span className="chip" style={{
                background: w.status === "waiting" ? "rgba(203,58,43,.12)" : "rgba(0,0,0,.08)",
                color: w.status === "waiting" ? "var(--red)" : "var(--ink-soft)",
              }}>
                {w.status === "waiting" ? "bekliyor" : w.status === "notified" ? "arandı" : "kapandı"}
              </span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
              <span style={{ fontSize: 13 }}>
                📞 <a href={`tel:${w.customer_phone}`} style={{ fontWeight: 800, color: "var(--navy)" }}>{w.customer_phone}</a>
                {w.customer_name && <span style={{ color: "var(--ink-soft)" }}> · {w.customer_name}</span>}
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>geldi: {dtFull(w.created_at)}</span>
            </div>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <a className="btn" style={{ padding: "7px 14px" }} href={`https://wa.me/${w.customer_phone.replace(/\D/g, "").replace(/^0/, "90")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {w.status === "waiting" ? (
                <button className="btn ghost" style={{ padding: "7px 14px" }} onClick={() => act({ action: "wl_notified", id: w.id })}>Arandı işaretle</button>
              ) : (
                <button className="btn ghost" style={{ padding: "7px 14px" }} onClick={() => act({ action: "wl_waiting", id: w.id })}>Geri al</button>
              )}
              <button className="btn red" style={{ padding: "7px 14px", marginLeft: "auto" }} onClick={() => confirm("Kayıt silinsin mi?") && act({ action: "wl_delete", id: w.id })}>Sil</button>
            </div>
          </div>
        ))}
      </div>

      <p className="muted sm" style={{ marginTop: 12, color: "var(--ink-soft)", fontSize: 12.5 }}>
        Bir rezervasyon iptal olunca ilgili tarihe bekleyen varsa <b>ilk onu ara</b> — boşluğu anında doldur. Biriken kayıt sayısı, 2. set kararının en dürüst verisi.
      </p>
      </>
      )}
    </div>
  );
}
