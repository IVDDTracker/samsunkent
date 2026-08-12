"use client";
import { useState, useEffect, useCallback } from "react";

interface Ref { id: string; name: string; slug: string; }
interface Biz {
  id: string; slug: string; name: string;
  phone: string | null; whatsapp: string | null; website: string | null;
  address: string | null; description: string | null;
  verified: boolean; status: string; tier: string;
  serviceIds: string[]; districtIds: string[]; sponsoredServiceIds: string[];
}

const EMPTY = {
  id: "" as string, name: "", phone: "", whatsapp: "", website: "", address: "", description: "",
  verified: false, status: "draft", tier: "free",
  serviceIds: [] as string[], districtIds: [] as string[], sponsoredServiceIds: [] as string[],
};

export default function FirmaAdmin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [list, setList] = useState<Biz[]>([]);
  const [services, setServices] = useState<Ref[]>([]);
  const [districts, setDistricts] = useState<Ref[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const editing = !!form.id;

  useEffect(() => {
    const saved = localStorage.getItem("sk_admin_key");
    if (saved) setKey(saved);
  }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/firmalar", { headers: { "x-admin-key": k } });
    if (!res.ok) { setErr("Parola yanlış."); setAuthed(false); return false; }
    const d = await res.json();
    setList(d.businesses || []); setServices(d.services || []); setDistricts(d.districts || []);
    setAuthed(true); setErr(""); return true;
  }, []);

  async function login() { const ok = await load(key); if (ok) localStorage.setItem("sk_admin_key", key); }

  async function save() {
    if (!form.name.trim()) { setErr("İsim zorunlu."); return; }
    const res = await fetch("/api/firmalar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action: "save", ...form }),
    });
    if (res.ok) { setForm({ ...EMPTY }); await load(key); }
    else setErr("Kaydedilemedi.");
  }

  async function del(id: string) {
    if (!confirm("Bu firma silinsin mi?")) return;
    const res = await fetch("/api/firmalar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) await load(key);
  }

  function edit(b: Biz) {
    setForm({
      id: b.id, name: b.name, phone: b.phone || "", whatsapp: b.whatsapp || "", website: b.website || "",
      address: b.address || "", description: b.description || "", verified: b.verified, status: b.status, tier: b.tier,
      serviceIds: b.serviceIds, districtIds: b.districtIds, sponsoredServiceIds: b.sponsoredServiceIds,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const nameOf = (ids: string[], ref: Ref[]) => ids.map((i) => ref.find((r) => r.id === i)?.name).filter(Boolean).join(", ");

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>samsunkent — Firma Yönetimi</h2>
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

  const cbox = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700,
    padding: "6px 10px", border: "1.5px solid var(--line)", borderRadius: 8, background: "#fff", cursor: "pointer" } as const;
  const cboxOn = { ...cbox, background: "var(--navy)", color: "#fff", borderColor: "var(--navy)" } as const;

  return (
    <div className="admin">
      <header className="top" style={{ marginBottom: 20 }}>
        <div className="brand" style={{ color: "var(--ink)", textShadow: "none" }}>
          samsunkent<span className="dot">.</span>
          <span className="tag" style={{ color: "var(--ink-soft)" }}>Firma Yönetimi</span>
        </div>
        <div className="row">
          <a className="btn ghost" href="/sk-yonetim-2025">← Yönetim</a>
          <a className="btn ghost" href="/hizmetler">Rehberi gör →</a>
        </div>
      </header>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      {/* FORM */}
      <div className="card">
        <h2>{editing ? "Firmayı düzenle" : "Yeni firma ekle"}</h2>
        <div className="grid2">
          <div className="field"><label>İşletme adı *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Yıldız Nakliyat" /></div>
          <div className="field"><label>Telefon</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xx xxx xx xx" /></div>
          <div className="field"><label>WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="05xx xxx xx xx" /></div>
          <div className="field"><label>Web sitesi</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" /></div>
        </div>
        <div className="field"><label>Adres</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Mahalle, cadde, no — Samsun" /></div>
        <div className="field"><label>Açıklama</label>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kısa, gerçek tanıtım" /></div>

        <div className="field"><label>Hizmetler</label>
          <div className="row" style={{ gap: 8 }}>
            {services.map((s) => (
              <span key={s.id} style={form.serviceIds.includes(s.id) ? cboxOn : cbox}
                onClick={() => setForm({ ...form, serviceIds: toggle(form.serviceIds, s.id) })}>{s.name}</span>
            ))}
            {services.length === 0 && <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>Önce SQL&apos;i çalıştır (hizmet yok).</span>}
          </div>
        </div>

        <div className="field"><label>Hizmet verdiği ilçeler</label>
          <div className="row" style={{ gap: 8 }}>
            {districts.map((d) => (
              <span key={d.id} style={form.districtIds.includes(d.id) ? cboxOn : cbox}
                onClick={() => setForm({ ...form, districtIds: toggle(form.districtIds, d.id) })}>{d.name}</span>
            ))}
          </div>
        </div>

        {form.serviceIds.length > 0 && (
          <div className="field"><label>Sponsorlu (bu hizmetlerde üstte, &quot;Sponsorlu&quot; etiketli)</label>
            <div className="row" style={{ gap: 8 }}>
              {form.serviceIds.map((sid) => {
                const s = services.find((x) => x.id === sid); if (!s) return null;
                const on = form.sponsoredServiceIds.includes(sid);
                return <span key={sid} style={on ? { ...cboxOn, background: "#8a6a24", borderColor: "#8a6a24" } : cbox}
                  onClick={() => setForm({ ...form, sponsoredServiceIds: toggle(form.sponsoredServiceIds, sid) })}>
                  {on ? "★ " : ""}{s.name}</span>;
              })}
            </div>
          </div>
        )}

        <div className="grid2">
          <div className="field"><label>Durum</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ font: "inherit", fontSize: 14, padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)" }}>
              <option value="draft">Taslak (yayında değil)</option>
              <option value="published">Yayında</option>
            </select></div>
          <div className="field"><label>Paket (sıralamayı etkilemez)</label>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}
              style={{ font: "inherit", fontSize: 14, padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)" }}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select></div>
        </div>

        <label className="onay" style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", fontSize: 14 }}>
          <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
          <span><b>Doğrulandı</b> — kimlik/faaliyet teyit edildi (satın alınamaz, pakete bağlı değil)</span>
        </label>

        <div className="row">
          <button className="btn" onClick={save}>{editing ? "Kaydet" : "Firma ekle"}</button>
          {editing && <button className="btn ghost" onClick={() => setForm({ ...EMPTY })}>Vazgeç (yeni)</button>}
        </div>
      </div>

      {/* LİSTE */}
      <div className="card">
        <h2>Firmalar ({list.length})</h2>
        {list.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Henüz firma yok. Yukarıdan ekle.</p>}
        {list.map((b) => (
          <div key={b.id} className={`a-item ${b.status === "published" ? "" : "off"}`}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontWeight: 800 }}>
                {b.name} {b.verified && <span style={{ color: "var(--navy)", fontSize: 12 }}>✓</span>}
                {b.sponsoredServiceIds.length > 0 && <span style={{ color: "#8a6a24", fontSize: 12 }}> ★sponsorlu</span>}
              </p>
              <span style={{ fontSize: 11, color: b.status === "published" ? "#217a49" : "var(--ink-soft)", fontWeight: 700 }}>
                {b.status === "published" ? "Yayında" : "Taslak"} · {b.tier}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>
              {b.phone || "—"} · {nameOf(b.serviceIds, services) || "hizmet yok"} · {nameOf(b.districtIds, districts) || "ilçe yok"}
            </p>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn ghost" onClick={() => edit(b)}>Düzenle</button>
              <a className="btn ghost" href={`/firma/${b.slug}`} target="_blank" rel="noopener noreferrer">Profili gör</a>
              <button className="btn red" onClick={() => del(b.id)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
