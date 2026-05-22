"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export interface SliderArticle {
  id: string; slug: string; title: string; summary: string;
  category: string; cover_image: string | null;
  is_breaking: boolean; published_at: string;
}

const CC: Record<string,string> = { gundem:"#e53935",spor:"#1a6fa8",ekonomi:"#f59e0b",kultur:"#9b59b6",saglik:"#27ae60",egitim:"#2980b9",turizm:"#f59e0b",ulasim:"#16a085" };
const CL: Record<string,string> = { gundem:"GÜNDEM",spor:"SPOR",ekonomi:"EKONOMİ",kultur:"KÜLTÜR",saglik:"SAĞLIK",egitim:"EĞİTİM",turizm:"TURİZM",ulasim:"ULAŞIM" };

function ta(d: string) {
  const diff = Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(diff<3600) return `${Math.floor(diff/60)} dk önce`;
  if(diff<86400) return `${Math.floor(diff/3600)} sa önce`;
  return new Date(d).toLocaleDateString("tr-TR");
}

export default function HeroSlider({ articles }: { articles: SliderArticle[] }) {
  const [idx, setIdx] = useState(0);
  const ts = useRef<number|null>(null);
  const ms = useRef<number|null>(null);
  const go = (i: number) => setIdx(Math.max(0,Math.min(articles.length-1,i)));
  const n = articles[idx];
  return (
    <div>
      <div style={{ position:"relative",borderRadius:12,overflow:"hidden",cursor:"grab",userSelect:"none",boxShadow:"0 4px 24px rgba(26,111,168,0.12)" }}
        onTouchStart={e=>{ts.current=e.touches[0].clientX}}
        onTouchEnd={e=>{ if(!ts.current)return; const d=ts.current-e.changedTouches[0].clientX; if(Math.abs(d)>50) d>0?go(idx+1):go(idx-1); ts.current=null; }}
        onMouseDown={e=>{ms.current=e.clientX}}
        onMouseUp={e=>{ if(!ms.current)return; const d=ms.current-e.clientX; if(Math.abs(d)>50) d>0?go(idx+1):go(idx-1); ms.current=null; }}
      >
        <div style={{ height:400,position:"relative" }}>
          {n.cover_image ? <img src={n.cover_image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none" }}/> : <div style={{ width:"100%",height:"100%",background:"#e8f4fd" }}/>}
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,20,35,0.95) 0%,rgba(10,20,35,0.3) 50%,transparent 80%)" }}/>
          <div style={{ position:"absolute",top:16,left:16,display:"flex",gap:8 }}>
            {n.is_breaking && <span style={{ background:"#e53935",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20 }}>🔴 SON DAKİKA</span>}
            <span style={{ background:CC[n.category]||"#1a6fa8",color:"#fff",fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20 }}>{CL[n.category]||n.category.toUpperCase()}</span>
          </div>
          <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"20px 24px 16px" }}>
            <Link href={`/haberler/${n.slug}`}><h2 style={{ fontFamily:"Merriweather,serif",fontSize:24,fontWeight:900,color:"#fff",lineHeight:1.35,marginBottom:8 }}>{n.title}</h2></Link>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:13,lineHeight:1.6,marginBottom:12 }}>{n.summary}</p>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:"rgba(255,255,255,0.45)",fontSize:12 }}>{ta(n.published_at)}</span>
              <div style={{ display:"flex",gap:5 }}>
                {articles.map((_,i)=><button key={i} onClick={()=>go(i)} style={{ width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,0.35)",border:"none",padding:0,transition:"all 0.3s" }}/>)}
              </div>
            </div>
          </div>
          <button onClick={()=>go(idx-1)} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"none",width:36,height:36,borderRadius:"50%",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx===0?0.3:1 }}>‹</button>
          <button onClick={()=>go(idx+1)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"none",width:36,height:36,borderRadius:"50%",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",opacity:idx===articles.length-1?0.3:1 }}>›</button>
        </div>
      </div>
      <div style={{ display:"flex",gap:6,marginTop:8,overflowX:"auto",paddingBottom:4 }}>
        {articles.map((a,i)=>(
          <button key={a.id} onClick={()=>go(i)} style={{ flexShrink:0,width:60,height:40,borderRadius:6,overflow:"hidden",border:`2px solid ${i===idx?"#1a6fa8":"transparent"}`,padding:0,transition:"border 0.2s" }}>
            {a.cover_image?<img src={a.cover_image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:i===idx?1:0.5 }}/>:<div style={{ width:"100%",height:"100%",background:"#e8f4fd" }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
