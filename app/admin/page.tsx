"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const CC: Record<string,string> = { gundem:"#e53935",spor:"#1a6fa8",ekonomi:"#f59e0b",kultur:"#9b59b6",saglik:"#27ae60",egitim:"#2980b9",turizm:"#f59e0b",ulasim:"#16a085" };
const CL: Record<string,string> = { gundem:"GÜNDEM",spor:"SPOR",ekonomi:"EKONOMİ",kultur:"KÜLTÜR",saglik:"SAĞLIK",egitim:"EĞİTİM",turizm:"TURİZM",ulasim:"ULAŞIM" };
const CATS = ["gundem","spor","ekonomi","kultur","saglik","egitim","turizm","ulasim"];

interface Article { id:string; title:string; summary:string; content:string; category:string; is_approved:boolean; created_at:string; }

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending"|"approved">("pending");
  const [sel, setSel] = useState<Article|null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronResult, setCronResult] = useState("");

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    const { data } = await sb.from("news_articles").select("*").eq("is_approved", tab==="approved").order("created_at",{ascending:false}).limit(50);
    setArticles(data||[]); setLoading(false);
  }

  function select(a: Article) { setSel(a); setEditing(false); setTitle(a.title); setSummary(a.summary); setContent(a.content); setCategory(a.category); }

  async function save() {
    if(!sel) return; setSaving(true);
    await sb.from("news_articles").update({ title,summary,content,category }).eq("id",sel.id);
    const u = {...sel,title,summary,content,category};
    setSel(u); setArticles(p=>p.map(a=>a.id===sel.id?u:a)); setEditing(false); setSaving(false);
  }

  async function approve(id: string) {
    if(editing) await save();
    await sb.from("news_articles").update({is_approved:true}).eq("id",id);
    setArticles(p=>p.filter(a=>a.id!==id)); setSel(null); setEditing(false);
  }

  async function reject(id: string) {
    await sb.from("news_articles").delete().eq("id",id);
    setArticles(p=>p.filter(a=>a.id!==id)); setSel(null); setEditing(false);
  }

  async function runCron() {
    setCronLoading(true); setCronResult("");
    try {
      const res = await fetch("/api/cron");
      const d = await res.json();
      setCronResult(`✅ ${d.processed} haber eklendi`);
      if(tab==="pending") load();
    } catch { setCronResult("❌ Hata"); }
    setCronLoading(false);
  }

  return (
    <div style={{ background:"#f7f9fb",minHeight:"100vh",fontFamily:"Nunito,sans-serif" }}>
      <div style={{ background:"#0d4f7c",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"baseline",gap:4 }}>
          <span style={{ fontFamily:"Merriweather,serif",fontSize:20,fontWeight:900,color:"#fff" }}>samsunkent</span>
          <span style={{ fontFamily:"Merriweather,serif",fontSize:20,fontWeight:900,color:"#7dd3fc" }}>.</span>
          <span style={{ fontSize:11,color:"#7dd3fc",fontWeight:800,marginLeft:2 }}>ADMİN</span>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          {cronResult && <span style={{ color:"#7dd3fc",fontSize:13 }}>{cronResult}</span>}
          <button onClick={runCron} disabled={cronLoading} style={{ background:cronLoading?"#555":"#1a6fa8",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700 }}>
            {cronLoading?"⏳ Çekiliyor...":"🤖 Haber Çek"}
          </button>
          <Link href="/" style={{ color:"#7dd3fc",fontSize:13,fontWeight:600 }}>Siteye Git →</Link>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"24px 20px",display:"grid",gridTemplateColumns:"380px 1fr",gap:20 }}>
        <div>
          <div style={{ display:"flex",gap:0,marginBottom:16,background:"#fff",borderRadius:10,border:"1px solid #e8ecf0",overflow:"hidden" }}>
            {(["pending","approved"] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setSel(null);}} style={{ flex:1,padding:"10px",border:"none",background:tab===t?"#1a6fa8":"#fff",color:tab===t?"#fff":"#6b7a8d",fontWeight:700,fontSize:13 }}>
                {t==="pending"?`⏳ Bekleyen (${articles.length})`:"✅ Onaylanan"}
              </button>
            ))}
          </div>
          {loading ? <div style={{ textAlign:"center",padding:40,color:"#6b7a8d" }}>Yükleniyor...</div>
          : articles.length===0 ? <div style={{ textAlign:"center",padding:40,color:"#6b7a8d",background:"#fff",borderRadius:10 }}>{tab==="pending"?'"Haber Çek" butonuna bas.':"Onaylanan haber yok."}</div>
          : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {articles.map(a=>(
                <div key={a.id} onClick={()=>select(a)} style={{ background:"#fff",border:`1.5px solid ${sel?.id===a.id?"#1a6fa8":"#e8ecf0"}`,borderRadius:10,padding:"14px 16px",cursor:"pointer" }}>
                  <div style={{ display:"flex",gap:8,marginBottom:6,alignItems:"center" }}>
                    <span style={{ background:CC[a.category]||"#1a6fa8",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20 }}>{CL[a.category]||a.category.toUpperCase()}</span>
                    <span style={{ color:"#6b7a8d",fontSize:11 }}>{new Date(a.created_at).toLocaleString("tr-TR")}</span>
                  </div>
                  <p style={{ fontFamily:"Merriweather,serif",color:"#0f1923",fontWeight:700,fontSize:13,lineHeight:1.4 }}>{a.title}</p>
                </div>
              ))}
            </div>
          }
        </div>

        <div>
          {sel ? (
            <div style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:10,padding:"24px",position:"sticky",top:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setEditing(!editing)} style={{ background:editing?"#f59e0b":"#e8f4fd",color:editing?"#fff":"#1a6fa8",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700 }}>
                    {editing?"✏️ Düzenleniyor...":"✏️ Düzenle"}
                  </button>
                  {editing && <button onClick={save} disabled={saving} style={{ background:"#27ae60",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700 }}>{saving?"Kaydediliyor...":"💾 Kaydet"}</button>}
                </div>
                {editing && <button onClick={()=>setEditing(false)} style={{ background:"none",border:"none",color:"#6b7a8d",fontSize:12 }}>İptal</button>}
              </div>

              {editing ? (
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:6 }}>KATEGORİ</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:"100%",padding:"8px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13 }}>
                      {CATS.map(c=><option key={c} value={c}>{CL[c]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:6 }}>BAŞLIK</label>
                    <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:14,fontFamily:"Merriweather,serif",fontWeight:700 }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:6 }}>ÖZET</label>
                    <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13,resize:"vertical" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:6 }}>İÇERİK</label>
                    <textarea value={content} onChange={e=>setContent(e.target.value)} rows={12} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13,lineHeight:1.7,resize:"vertical" }}/>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                    <span style={{ background:CC[sel.category]||"#1a6fa8",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20 }}>{CL[sel.category]||sel.category.toUpperCase()}</span>
                  </div>
                  <h2 style={{ fontFamily:"Merriweather,serif",fontSize:20,fontWeight:900,color:"#0f1923",lineHeight:1.4,marginBottom:12 }}>{sel.title}</h2>
                  <p style={{ color:"#4a6580",fontSize:13,lineHeight:1.7,marginBottom:14,fontStyle:"italic",borderLeft:"3px solid #1a6fa8",paddingLeft:12 }}>{sel.summary}</p>
                  <div style={{ color:"#0f1923",fontSize:13,lineHeight:1.8,maxHeight:300,overflowY:"auto" }}>
                    {sel.content?.split("\n\n").map((p,i)=><p key={i} style={{ marginBottom:12 }}>{p}</p>)}
                  </div>
                </div>
              )}

              {!sel.is_approved && (
                <div style={{ display:"flex",gap:10,marginTop:20,paddingTop:20,borderTop:"1px solid #e8ecf0" }}>
                  <button onClick={()=>approve(sel.id)} style={{ flex:1,background:"#27ae60",color:"#fff",border:"none",borderRadius:8,padding:"12px",fontSize:14,fontWeight:800 }}>✅ ONAYLA</button>
                  <button onClick={()=>reject(sel.id)} style={{ flex:1,background:"#e53935",color:"#fff",border:"none",borderRadius:8,padding:"12px",fontSize:14,fontWeight:800 }}>❌ SİL</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:10,padding:40,textAlign:"center",color:"#6b7a8d" }}>
              <p style={{ fontSize:40,marginBottom:12 }}>👈</p>
              <p style={{ fontFamily:"Merriweather,serif",fontSize:16,fontWeight:700 }}>Bir haber seç</p>
              <p style={{ fontSize:13,marginTop:8 }}>Soldan habere tıkla, düzenle ve onayla.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
