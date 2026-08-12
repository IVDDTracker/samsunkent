"use client";
import { useState, useEffect, useCallback } from "react";

interface FaqRow { q: string; a: string; }
interface HowRow { title: string; body: string; }
interface Service {
  id: string; slug: string; name: string; group: string | null;
  intro: string; h1: string | null; meta_title: string | null; meta_desc: string | null;
  district_relevant: boolean; faq: FaqRow[]; howto: HowRow[]; sort: number; active: boolean;
}

const EMPTY = {
  id: "", name: "", slug: "", group: "", intro: "", h1: "", meta_title: "", meta_desc: "",
  district_relevant: false, active: true, sort: 0,
  faq: [] as FaqRow[], howto: [] as HowRow[],
};

const inp = { font: "inherit", fontSize: 14, padding: "10px 12px", border: "1.5px solid var(--line)",
  borderRadius: 8, background: "#fff", color: "var(--ink)", width: "100%" } as const;

export default function HizmetAdmin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [list, setList] = useState<Service[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const editing = !!form.id;

  useEffect(() => { const s = localStorage.getItem("sk_admin_key"); if (s) setKey(s); }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch("/api/hizmet-yonetim", { headers: { "x-admin-key": k } });
    if (!res.ok) { setErr("Parola yanlış."); setAuthed(false); return false; }
    const d = await res.json();
    setList(d.services || []); setAuthed(true); setErr(""); return true;
  }, []);

  async function login() { const ok = await load(key); if (ok) localStorage.setItem("sk_admin_key", key); }

  async function save() {
    if (!form.name.trim()) { setErr("İsim zorunlu."); return; }
    const res = await fetch("/api/hizmet-yonetim", {
      method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action: "save", ...form }),
    });
    if (res.ok) { setForm({ ...EMPTY }); await load(key); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error || "Kaydedilemedi."); }
  }

  async function del(id: string) {
    if (!confirm("Bu kategori silinsin mi? (İçindeki firma bağları da kalkar.)")) return;
    const res = await fetch("/api/hizmet-yonetim", {
      method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) await load(key);
  }

  function edit(s: Service) {
    setForm({
      id: s.id, name: s.name, slug: s.slug, group: s.group || "", intro: s.intro || "",
      h1: s.h1 || "", meta_title: s.meta_title || "", meta_desc: s.meta_desc || "",
      district_relevant: s.district_relevant, active: s.active, sort: s.sort,
      faq: Array.isArray(s.faq) ? s.faq : [], howto: Array.isArray(s.howto) ? s.howto : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>samsunkent — Kategoriler</h2>
          <div className="field"><label>Parola</label>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Yönetim parolası" /></div>
          {err && <div className="err">{err}</div>}
          <button className="btn" onClick={login}>Giriş</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="top" style={{ marginBottom: 20 }}>
        <div className="brand" style={{ color: "var(--ink)", textShadow: "none" }}>
          samsunkent<span className="dot">.</span>
          <span className="tag" style={{ color: "var(--ink-soft)" }}>Kategoriler</span>
        </div>
        <div className="row">
          <a className="btn ghost" href="/sk-yonetim-2025">← Yönetim</a>
          <a className="btn ghost" href="/sk-yonetim-2025/firmalar">🏢 Firmalar</a>
        </div>
      </header>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      <div className="card">
        <h2>{editing ? "Kategoriyi düzenle" : "Yeni kategori (hizmet)"}</h2>
        <div className="grid2">
          <div className="field"><label>Ad *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn. Oto Çekici" /></div>
          <div className="field"><label>Slug (boşsa addan üretilir)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="oto-cekici" /></div>
          <div className="field"><label>Grup (nav etiketi)</label>
            <input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="Otomotiv" /></div>
          <div className="field"><label>Sıra</label>
            <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} /></div>
        </div>
        <div className="field"><label>Giriş metni (2-3 cümle, gerçek — &quot;güvenilir&quot; deme)</label>
          <textarea rows={2} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })}
            placeholder="Samsun'daki … firmalarını bir araya getirdik. İlçene göre süz, karşılaştır, ara." /></div>
        <div className="grid2">
          <div className="field"><label>H1 (boşsa ad kullanılır)</label>
            <input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} placeholder="Samsun Oto Çekici — 7/24" /></div>
          <div className="field"><label>Meta başlık</label>
            <input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="Samsun Oto Çekici & Yol Yardım | Yerel Rehber" /></div>
        </div>
        <div className="field"><label>Meta açıklama</label>
          <textarea rows={2} value={form.meta_desc} onChange={(e) => setForm({ ...form, meta_desc: e.target.value })} /></div>

        {/* NASIL SEÇİLİR */}
        <div className="field">
          <label>Nasıl seçilir (adımlar)</label>
          {form.howto.map((h, i) => (
            <div key={i} className="row" style={{ gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
              <input style={{ ...inp, flex: "0 0 34%" }} placeholder="Başlık" value={h.title}
                onChange={(e) => { const a = [...form.howto]; a[i] = { ...a[i], title: e.target.value }; setForm({ ...form, howto: a }); }} />
              <input style={{ ...inp, flex: 1 }} placeholder="Açıklama" value={h.body}
                onChange={(e) => { const a = [...form.howto]; a[i] = { ...a[i], body: e.target.value }; setForm({ ...form, howto: a }); }} />
              <button className="btn red" style={{ padding: "8px 10px" }} onClick={() => setForm({ ...form, howto: form.howto.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button className="btn ghost" onClick={() => setForm({ ...form, howto: [...form.howto, { title: "", body: "" }] })}>+ Adım ekle</button>
        </div>

        {/* SSS */}
        <div className="field">
          <label>Sık sorulanlar (SSS)</label>
          {form.faq.map((f, i) => (
            <div key={i} className="row" style={{ gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
              <input style={{ ...inp, flex: "0 0 34%" }} placeholder="Soru" value={f.q}
                onChange={(e) => { const a = [...form.faq]; a[i] = { ...a[i], q: e.target.value }; setForm({ ...form, faq: a }); }} />
              <input style={{ ...inp, flex: 1 }} placeholder="Cevap" value={f.a}
                onChange={(e) => { const a = [...form.faq]; a[i] = { ...a[i], a: e.target.value }; setForm({ ...form, faq: a }); }} />
              <button className="btn red" style={{ padding: "8px 10px" }} onClick={() => setForm({ ...form, faq: form.faq.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button className="btn ghost" onClick={() => setForm({ ...form, faq: [...form.faq, { q: "", a: "" }] })}>+ Soru ekle</button>
        </div>

        <div className="row" style={{ gap: 18, margin: "6px 0 14px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktif (sitede görünsün)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.district_relevant} onChange={(e) => setForm({ ...form, district_relevant: e.target.checked })} /> İlçe sayfaları anlamlı
          </label>
        </div>

        <div className="row">
          <button className="btn" onClick={save}>{editing ? "Kaydet" : "Kategori ekle"}</button>
          {editing && <button className="btn ghost" onClick={() => setForm({ ...EMPTY })}>Vazgeç (yeni)</button>}
        </div>
      </div>

      <div className="card">
        <h2>Kategoriler ({list.length})</h2>
        {list.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Henüz kategori yok.</p>}
        {list.map((s) => (
          <div key={s.id} className={`a-item ${s.active ? "" : "off"}`}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
              <p style={{ fontWeight: 800 }}>{s.name} <span style={{ color: "var(--ink-soft)", fontSize: 12, fontWeight: 400 }}>/{s.slug}</span></p>
              <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700 }}>
                {s.group || "—"} · SSS {s.faq?.length || 0} · adım {s.howto?.length || 0}
              </span>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn ghost" onClick={() => edit(s)}>Düzenle</button>
              <a className="btn ghost" href={`/hizmetler/${s.slug}`} target="_blank" rel="noopener noreferrer">Sayfayı gör</a>
              <button className="btn red" onClick={() => del(s.id)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
