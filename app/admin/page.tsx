"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const CC: Record<string,string> = { gundem:"#e53935",spor:"#1a6fa8",ekonomi:"#f59e0b",kultur:"#9b59b6",saglik:"#27ae60",egitim:"#2980b9",turizm:"#f59e0b",ulasim:"#16a085" };
const CL: Record<string,string> = { gundem:"GÜNDEM",spor:"SPOR",ekonomi:"EKONOMİ",kultur:"KÜLTÜR",saglik:"SAĞLIK",egitim:"EĞİTİM",turizm:"TURİZM",ulasim:"ULAŞIM" };
const CATS = ["gundem","spor","ekonomi","kultur","saglik","egitim","turizm","ulasim"];

interface Article {
  id:string; title:string; summary:string; content:string;
  category:string; is_approved:boolean; cover_image:string|null; created_at:string;
}

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
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronResult, setCronResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    const { data } = await sb.from("news_articles").select("*").eq("is_approved", tab==="approved").order("created_at",{ascending:false}).limit(50);
    setArticles(data||[]); setLoading(false);
  }

  function select(a: Article) {
    setSel(a); setEditing(false);
    setTitle(a.title); setSummary(a.summary); setContent(a.content);
    setCategory(a.category); setCoverImage(a.cover_image||"");
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `news/${Date.now()}.${ext}`;
    const { data, error } = await sb.storage.from("images").upload(fileName, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = sb.storage.from("images").getPublicUrl(fileName);
      setCoverImage(urlData.publicUrl);
    } else {
      alert("Fotoğraf yüklenemedi. Supabase Storage'da 'images' bucket oluşturulmalı.");
    }
    setUploading(false);
  }

  async function save() {
    if(!sel) return; setSaving(true);
    await sb.from("news_articles").update({ title, summary, content, category, cover_image: coverImage||null }).eq("id",sel.id);
    const u = {...sel,title,summary,content,category,cover_image:coverImage||null};
    setSel(u); setArticles(p=>p.map(a=>a.id===sel.id?u:a)); setEditing(false); setSaving(false);
  }

  async function approve(id: string) {
    if(editing) await save();
    await sb.from("news_articles").update({is_approved:true}).eq("id",id);
    setArticles(p=>p.filter(a=>a.id!==id)); setSel(null); setEditing(false);
  }

  async function reject(id: string) {
    if(!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;
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
    } catch { setCronResult("❌ Hata oluştu"); }
    setCronLoading(false);
  }

  return (
    <div style={{ background:"#f7f9fb",minHeight:"100vh",fontFamily:"Nunito,sans-serif" }}>

      {/* Header */}
      <div style={{ background:"#0d4f7c",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
        <div style={{ display:"flex",alignItems:"baseline",gap:4 }}>
          <span style={{ fontFamily:"Merriweather,serif",fontSize:18,fontWeight:900,color:"#fff" }}>samsunkent</span>
          <span style={{ fontFamily:"Merriweather,serif",fontSize:18,fontWeight:900,color:"#7dd3fc" }}>.</span>
          <span style={{ fontSize:11,color:"#7dd3fc",fontWeight:800,marginLeft:2 }}>ADMİN</span>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          {cronResult && <span style={{ color:"#7dd3fc",fontSize:13 }}>{cronResult}</span>}
          <button onClick={runCron} disabled={cronLoading} style={{ background:cronLoading?"#555":"#1a6fa8",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:cronLoading?"not-allowed":"pointer" }}>
            {cronLoading?"⏳ Çekiliyor...":"🤖 Haber Çek"}
          </button>
          <Link href="/" style={{ color:"#7dd3fc",fontSize:13,fontWeight:600 }}>Siteye Git →</Link>
        </div>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"20px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>

        {/* Sol - Liste */}
        <div>
          <div style={{ display:"flex",marginBottom:14,background:"#fff",borderRadius:10,border:"1px solid #e8ecf0",overflow:"hidden" }}>
            {(["pending","approved"] as const).map(t=>(
              <button key={t} onClick={()=>{setTab(t);setSel(null);}} style={{ flex:1,padding:"11px",border:"none",background:tab===t?"#1a6fa8":"#fff",color:tab===t?"#fff":"#6b7a8d",fontWeight:700,fontSize:13,cursor:"pointer" }}>
                {t==="pending"?`⏳ Bekleyen (${articles.length})`:"✅ Onaylanan"}
              </button>
            ))}
          </div>

          {loading ? <div style={{ textAlign:"center",padding:40,color:"#6b7a8d" }}>Yükleniyor...</div>
          : articles.length===0 ? <div style={{ textAlign:"center",padding:40,color:"#6b7a8d",background:"#fff",borderRadius:10,fontSize:14 }}>
              {tab==="pending"?'"Haber Çek" butonuna bas.':'Onaylanan haber yok.'}
            </div>
          : <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {articles.map(a=>(
                <div key={a.id} onClick={()=>select(a)} style={{ background:"#fff",border:`1.5px solid ${sel?.id===a.id?"#1a6fa8":"#e8ecf0"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"border 0.2s" }}>
                  <div style={{ display:"flex",gap:6,marginBottom:5,alignItems:"center",flexWrap:"wrap" }}>
                    <span style={{ background:CC[a.category]||"#1a6fa8",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20 }}>{CL[a.category]||a.category.toUpperCase()}</span>
                    {a.cover_image && <span style={{ fontSize:10,color:"#27ae60" }}>📷</span>}
                    <span style={{ color:"#6b7a8d",fontSize:10 }}>{new Date(a.created_at).toLocaleString("tr-TR")}</span>
                  </div>
                  <p style={{ fontFamily:"Merriweather,serif",color:"#0f1923",fontWeight:700,fontSize:13,lineHeight:1.4 }}>{a.title}</p>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Sağ - Detay */}
        <div>
          {sel ? (
            <div style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:10,padding:"20px",position:"sticky",top:20,maxHeight:"90vh",overflowY:"auto" }}>

              {/* Üst butonlar */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setEditing(!editing)} style={{ background:editing?"#f59e0b":"#e8f4fd",color:editing?"#fff":"#1a6fa8",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                    {editing?"✏️ Düzenleniyor":"✏️ Düzenle"}
                  </button>
                  {editing && (
                    <button onClick={save} disabled={saving} style={{ background:"#27ae60",color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                      {saving?"💾 Kaydediliyor...":"💾 Kaydet"}
                    </button>
                  )}
                </div>
                {editing && <button onClick={()=>setEditing(false)} style={{ background:"none",border:"none",color:"#6b7a8d",fontSize:12,cursor:"pointer" }}>İptal</button>}
              </div>

              {editing ? (
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

                  {/* Kategori */}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:5 }}>KATEGORİ</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13,background:"#fff" }}>
                      {CATS.map(c=><option key={c} value={c}>{CL[c]}</option>)}
                    </select>
                  </div>

                  {/* Fotoğraf */}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:5 }}>KAPAK FOTOĞRAFI</label>
                    {coverImage && (
                      <div style={{ marginBottom:8,borderRadius:8,overflow:"hidden",position:"relative" }}>
                        <img src={coverImage} alt="" style={{ width:"100%",height:140,objectFit:"cover",display:"block" }}/>
                        <button onClick={()=>setCoverImage("")} style={{ position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer" }}>✕ Kaldır</button>
                      </div>
                    )}
                    <div style={{ display:"flex",gap:8" }}>
                      <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{ flex:1,background:"#e8f4fd",color:"#1a6fa8",border:"1.5px dashed #1a6fa8",borderRadius:8,padding:"10px",fontSize:12,fontWeight:700,cursor:"pointer" }}>
                        {uploading?"⏳ Yükleniyor...":"📷 Fotoğraf Yükle"}
                      </button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ if(e.target.files?.[0]) uploadPhoto(e.target.files[0]); }}/>
                    <input value={coverImage} onChange={e=>setCoverImage(e.target.value)} placeholder="ya da fotoğraf URL'si yapıştır..." style={{ width:"100%",padding:"8px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:12,marginTop:6,boxSizing:"border-box" as any }}/>
                  </div>

                  {/* Başlık */}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:5 }}>BAŞLIK</label>
                    <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:14,fontFamily:"Merriweather,serif",fontWeight:700,boxSizing:"border-box" as any }}/>
                  </div>

                  {/* Özet */}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:5 }}>ÖZET</label>
                    <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13,resize:"vertical",boxSizing:"border-box" as any }}/>
                  </div>

                  {/* İçerik */}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#6b7a8d",display:"block",marginBottom:5 }}>İÇERİK</label>
                    <textarea value={content} onChange={e=>setContent(e.target.value)} rows={14} style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e8ecf0",borderRadius:8,fontSize:13,lineHeight:1.7,resize:"vertical",boxSizing:"border-box" as any }}/>
                  </div>
                </div>
              ) : (
                <div>
                  {sel.cover_image && (
                    <div style={{ borderRadius:8,overflow:"hidden",marginBottom:14 }}>
                      <img src={sel.cover_image} alt="" style={{ width:"100%",height:160,objectFit:"cover",display:"block" }}/>
                    </div>
                  )}
                  <div style={{ display:"flex",gap:8,marginBottom:12 }}>
                    <span style={{ background:CC[sel.category]||"#1a6fa8",color:"#fff",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:20 }}>{CL[sel.category]||sel.category.toUpperCase()}</span>
                  </div>
                  <h2 style={{ fontFamily:"Merriweather,serif",fontSize:18,fontWeight:900,color:"#0f1923",lineHeight:1.4,marginBottom:10 }}>{sel.title}</h2>
                  <p style={{ color:"#4a6580",fontSize:13,lineHeight:1.7,marginBottom:12,fontStyle:"italic",borderLeft:"3px solid #1a6fa8",paddingLeft:10 }}>{sel.summary}</p>
                  <div style={{ color:"#0f1923",fontSize:13,lineHeight:1.8,maxHeight:250,overflowY:"auto" }}>
                    {sel.content?.split("\n\n").map((p,i)=><p key={i} style={{ marginBottom:10 }}>{p}</p>)}
                  </div>
                </div>
              )}

              {/* Alt butonlar */}
              {!sel.is_approved && (
                <div style={{ display:"flex",gap:10,marginTop:18,paddingTop:16,borderTop:"1px solid #e8ecf0" }}>
                  <button onClick={()=>approve(sel.id)} style={{ flex:1,background:"#27ae60",color:"#fff",border:"none",borderRadius:8,padding:"13px",fontSize:14,fontWeight:800,cursor:"pointer" }}>✅ ONAYLA</button>
                  <button onClick={()=>reject(sel.id)} style={{ flex:1,background:"#e53935",color:"#fff",border:"none",borderRadius:8,padding:"13px",fontSize:14,fontWeight:800,cursor:"pointer" }}>❌ SİL</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:10,padding:40,textAlign:"center",color:"#6b7a8d" }}>
              <p style={{ fontSize:40,marginBottom:12 }}>👈</p>
              <p style={{ fontFamily:"Merriweather,serif",fontSize:16,fontWeight:700 }}>Bir haber seç</p>
              <p style={{ fontSize:13,marginTop:8 }}>Düzenle, fotoğraf ekle ve onayla.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
