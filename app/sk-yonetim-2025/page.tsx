"use client";
import { useState, useEffect, useCallback } from "react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  sort: number;
  created_at: string;
}
interface Message {
  id: string;
  phone: string;
  message: string | null;
  source: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [err, setErr] = useState("");
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [tab, setTab] = useState<"duyuru" | "mesaj">("duyuru");

  // yeni duyuru
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // düzenleme
  const [editId, setEditId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eBody, setEBody] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("sk_admin_key");
    if (saved) setKey(saved);
  }, []);

  const load = useCallback(
    async (k: string) => {
      const res = await fetch("/api/admin", { headers: { "x-admin-key": k } });
      if (!res.ok) {
        setErr("Parola yanlış.");
        setAuthed(false);
        return false;
      }
      const d = await res.json();
      setAnns(d.announcements || []);
      setMsgs(d.messages || []);
      setAuthed(true);
      setErr("");
      return true;
    },
    []
  );

  async function login() {
    const ok = await load(key);
    if (ok) localStorage.setItem("sk_admin_key", key);
  }

  async function act(payload: Record<string, unknown>) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify(payload),
    });
    if (res.ok) await load(key);
    else setErr("İşlem başarısız.");
  }

  async function addAnnouncement() {
    if (!title.trim()) return;
    await act({ action: "create", title, body, sort: 0 });
    setTitle("");
    setBody("");
  }

  function startEdit(a: Announcement) {
    setEditId(a.id);
    setETitle(a.title);
    setEBody(a.body);
  }
  async function saveEdit(a: Announcement) {
    await act({ action: "update", id: a.id, title: eTitle, body: eBody, is_active: a.is_active, sort: a.sort });
    setEditId(null);
  }

  if (!authed) {
    return (
      <div className="admin" style={{ maxWidth: 380, marginTop: 80 }}>
        <div className="card">
          <h2>samsunkent — Yönetim</h2>
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
          <button className="btn" onClick={login}>
            Giriş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="top" style={{ marginBottom: 20 }}>
        <div className="brand" style={{ color: "var(--ink)", textShadow: "none" }}>
          samsunkent<span className="dot">.</span>
          <span className="tag" style={{ color: "var(--ink-soft)" }}>
            Yönetim
          </span>
        </div>
        <div className="row">
          <a className="btn" href="/sk-yonetim-2025/panel">
            📊 Patron Paneli
          </a>
          <a className="btn ghost" href="/">
            Siteyi gör →
          </a>
        </div>
      </header>

      <div className="row" style={{ marginBottom: 18 }}>
        <button className={`btn ${tab === "duyuru" ? "" : "ghost"}`} onClick={() => setTab("duyuru")}>
          Duyurular ({anns.length})
        </button>
        <button className={`btn ${tab === "mesaj" ? "" : "ghost"}`} onClick={() => setTab("mesaj")}>
          Gelen Mesajlar ({msgs.length})
        </button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      {tab === "duyuru" ? (
        <>
          <div className="card">
            <h2>Yeni duyuru notu</h2>
            <div className="field">
              <label>Başlık</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: 25 iş ortağı kuaför aranıyor" />
            </div>
            <div className="field">
              <label>Metin</label>
              <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Duyurunun detayı…" />
            </div>
            <button className="btn" onClick={addAnnouncement}>
              Panoya ekle
            </button>
          </div>

          <div className="card">
            <h2>Panodaki notlar</h2>
            {anns.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Henüz duyuru yok.</p>}
            {anns.map((a) => (
              <div key={a.id} className={`a-item ${a.is_active ? "" : "off"}`}>
                {editId === a.id ? (
                  <>
                    <div className="field">
                      <input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                    </div>
                    <div className="field">
                      <textarea rows={3} value={eBody} onChange={(e) => setEBody(e.target.value)} />
                    </div>
                    <div className="row">
                      <button className="btn" onClick={() => saveEdit(a)}>Kaydet</button>
                      <button className="btn ghost" onClick={() => setEditId(null)}>Vazgeç</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 800, marginBottom: 4 }}>{a.title}</p>
                    {a.body && <p style={{ fontSize: 13.5, color: "#3c3020", whiteSpace: "pre-wrap" }}>{a.body}</p>}
                    <div className="row" style={{ marginTop: 10 }}>
                      <button className="btn ghost" onClick={() => startEdit(a)}>Düzenle</button>
                      <button
                        className="btn ghost"
                        onClick={() => act({ action: "update", id: a.id, title: a.title, body: a.body, is_active: !a.is_active, sort: a.sort })}
                      >
                        {a.is_active ? "Panodan kaldır" : "Panoya koy"}
                      </button>
                      <button
                        className="btn red"
                        onClick={() => confirm("Bu duyuru silinsin mi?") && act({ action: "delete", id: a.id })}
                      >
                        Sil
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card">
          <h2>Formdan gelen mesajlar</h2>
          {msgs.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Henüz mesaj yok.</p>}
          {msgs.map((m) => (
            <div key={m.id} className="msg-item">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="tel">
                  <a href={`tel:${m.phone}`}>{m.phone}</a>
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  {new Date(m.created_at).toLocaleString("tr-TR")}
                </span>
              </div>
              {m.message && <p style={{ fontSize: 13.5, marginTop: 5, whiteSpace: "pre-wrap" }}>{m.message}</p>}
              <div className="row" style={{ marginTop: 8, justifyContent: "space-between", alignItems: "center" }}>
                {m.source && <span style={{ fontSize: 11, color: "var(--navy)", fontWeight: 700 }}>↳ {m.source}</span>}
                <button
                  className="btn ghost"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                  onClick={() => confirm("Mesaj silinsin mi?") && act({ action: "delete_message", id: m.id })}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
