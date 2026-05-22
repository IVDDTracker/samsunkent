import { createClient } from "@supabase/supabase-js";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BreakingTicker from "../components/BreakingTicker";
import HeroSlider from "../components/HeroSlider";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CC: Record<string,string> = { gundem:"#e53935",spor:"#1a6fa8",ekonomi:"#f59e0b",kultur:"#9b59b6",saglik:"#27ae60",egitim:"#2980b9",turizm:"#f59e0b",ulasim:"#16a085" };
const CL: Record<string,string> = { gundem:"GÜNDEM",spor:"SPOR",ekonomi:"EKONOMİ",kultur:"KÜLTÜR",saglik:"SAĞLIK",egitim:"EĞİTİM",turizm:"TURİZM",ulasim:"ULAŞIM" };
const SI: Record<string,string[]> = {
  spor:["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=90","https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=90"],
  ekonomi:["https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=90"],
  kultur:["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=90"],
  saglik:["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=90"],
  egitim:["https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=90"],
  turizm:["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=90"],
  gundem:["https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=90","https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=90"],
  ulasim:["https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=90"],
};
function img(cat: string, i: number) { const a=SI[cat]||SI.gundem; return a[i%a.length]; }
function ta(d: string) {
  const diff=Math.floor((Date.now()-new Date(d).getTime())/1000);
  if(diff<3600) return `${Math.floor(diff/60)} dk önce`;
  if(diff<86400) return `${Math.floor(diff/3600)} sa önce`;
  return new Date(d).toLocaleDateString("tr-TR");
}

const LISTINGS = [
  { type:"KİRALIK DAİRE",title:"3+1 Deniz Manzaralı, Eşyalı",price:"14.500 ₺/ay",loc:"Atakum",boost:"vip" },
  { type:"OTOMOBİL",title:"2021 Toyota Corolla, 42.000 km",price:"1.850.000 ₺",loc:"İlkadım",boost:"featured" },
  { type:"PERSONEL ARANIYOR",title:"Deneyimli Muhasebe Uzmanı",price:"Görüşülür",loc:"Canik",boost:null },
  { type:"SATILIK DAİRE",title:"4+1 Sıfır, Kapalı Otopark",price:"5.200.000 ₺",loc:"Tekkeköy",boost:null },
];

export const revalidate = 300;

export default async function HomePage() {
  const { data } = await supabase
    .from("news_articles")
    .select("id,slug,title,summary,category,cover_image,is_breaking,published_at,created_at")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const news = (data||[]).map((a,i) => ({
    ...a,
    cover_image: a.cover_image || img(a.category, i),
    published_at: a.published_at || a.created_at,
    is_breaking: a.is_breaking || false,
  }));

  return (
    <>
      <Header />
      <BreakingTicker />
      <main style={{ maxWidth:1100,margin:"0 auto",padding:"24px 20px 0" }}>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:20,marginBottom:28 }}>
          {news.length>0 ? <HeroSlider articles={news}/> : (
            <div style={{ background:"#e8f4fd",borderRadius:12,height:400,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12 }}>
              <p style={{ fontSize:40 }}>📰</p>
              <p style={{ fontFamily:"Merriweather,serif",color:"#1a6fa8",fontSize:18,fontWeight:700 }}>Haberler yükleniyor</p>
              <Link href="/admin" style={{ background:"#1a6fa8",color:"#fff",padding:"8px 18px",borderRadius:20,fontSize:13,fontWeight:700,marginTop:8 }}>Admin Paneli →</Link>
            </div>
          )}
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
              <span style={{ fontFamily:"Merriweather,serif",fontSize:15,fontWeight:900,color:"#0f1923" }}>Son Haberler</span>
              <Link href="/haberler" style={{ color:"#1a6fa8",fontSize:12,fontWeight:700 }}>Tümü →</Link>
            </div>
            {news.slice(0,5).map((n,i) => (
              <Link key={n.id} href={`/haberler/${n.slug}`} style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:10,overflow:"hidden",display:"flex" }}>
                <div style={{ width:80,height:72,flexShrink:0,overflow:"hidden" }}><img src={img(n.category,i)} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/></div>
                <div style={{ padding:"10px 12px",flex:1 }}>
                  <span style={{ background:"#e8f4fd",color:"#1a6fa8",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20 }}>{CL[n.category]||n.category.toUpperCase()}</span>
                  <h3 style={{ fontFamily:"Merriweather,serif",fontSize:12,fontWeight:700,color:"#0f1923",lineHeight:1.4,marginTop:4 }}>{n.title}</h3>
                  <span style={{ color:"#6b7a8d",fontSize:10,fontWeight:600,display:"block",marginTop:3 }}>{ta(n.published_at)}</span>
                </div>
              </Link>
            ))}
            <div style={{ background:"#1a6fa8",borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4 }}>
              <div>
                <p style={{ color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:"0.1em" }}>SAMSUN</p>
                <div style={{ display:"flex",alignItems:"baseline",gap:2,marginTop:2 }}>
                  <span style={{ fontFamily:"Merriweather,serif",fontSize:28,fontWeight:900,color:"#fff" }}>24</span>
                  <span style={{ color:"rgba(255,255,255,0.7)",fontSize:16 }}>°C</span>
                </div>
                <p style={{ color:"rgba(255,255,255,0.55)",fontSize:11,fontWeight:600,marginTop:2 }}>Güneşli · Rüzgar 18 km/sa</p>
              </div>
              <span style={{ fontSize:40 }}>☀️</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:20 }}>
          {["Tümü","Gündem","Spor","Ekonomi","Kültür","Sağlık","Ulaşım","Eğitim"].map((c,i) => (
            <button key={c} style={{ background:i===0?"#1a6fa8":"#fff",color:i===0?"#fff":"#6b7a8d",border:`1.5px solid ${i===0?"#1a6fa8":"#e8ecf0"}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700 }}>{c}</button>
          ))}
        </div>

        {news.length>0 && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:32 }}>
            {news.slice(0,6).map((n,i) => (
              <Link key={n.id+"g"} href={`/haberler/${n.slug}`} style={{ background:"#fff",border:"1px solid #e8ecf0",borderRadius:12,overflow:"hidden",display:"block" }}>
                <div style={{ height:140,overflow:"hidden",position:"relative" }}>
                  <img src={img(n.category,i)} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                  <span style={{ position:"absolute",top:10,left:10,background:CC[n.category]||"#1a6fa8",color:"#fff",fontSize:9,fontWeight:800,padding:"3px 8px",borderRadius:20 }}>{CL[n.category]||n.category.toUpperCase()}</span>
                </div>
                <div style={{ padding:"12px 14px" }}>
                  <h3 style={{ fontFamily:"Merriweather,serif",fontSize:13,fontWeight:700,color:"#0f1923",lineHeight:1.4,marginBottom:7 }}>{n.title}</h3>
                  <span style={{ color:"#6b7a8d",fontSize:11,fontWeight:600 }}>{ta(n.published_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ background:"#e8f4fd",border:"1.5px solid rgba(26,111,168,0.25)",borderRadius:12,padding:"16px 22px",marginBottom:32,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16 }}>
          <div style={{ display:"flex",gap:14,alignItems:"center" }}>
            <div style={{ width:44,height:44,background:"#1a6fa8",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🏗️</div>
            <div>
              <span style={{ fontSize:9,color:"#6b7a8d",fontWeight:700,letterSpacing:"0.12em" }}>REKLAM</span>
              <p style={{ fontFamily:"Merriweather,serif",color:"#0f1923",fontSize:15,fontWeight:700,marginTop:2 }}>Samsunkent&apos;te Reklam Ver</p>
              <p style={{ color:"#6b7a8d",fontSize:12,fontWeight:600,marginTop:2 }}>Samsun&apos;un dijital platformunda markanızı öne çıkarın</p>
            </div>
          </div>
          <button style={{ background:"#1a6fa8",color:"#fff",border:"none",borderRadius:22,padding:"9px 20px",fontSize:12,fontWeight:800,whiteSpace:"nowrap" }}>Bilgi Al →</button>
        </div>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <h2 style={{ fontFamily:"Merriweather,serif",fontSize:20,fontWeight:900,color:"#0f1923" }}>Son İlanlar</h2>
          <Link href="/ilanlar" style={{ color:"#1a6fa8",fontSize:13,fontWeight:800 }}>Tüm ilanlar →</Link>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:32 }}>
          {LISTINGS.map((l,i) => (
            <div key={i} style={{ background:"#fff",border:`1.5px solid ${l.boost==="vip"?"rgba(245,158,11,0.4)":l.boost==="featured"?"rgba(26,111,168,0.35)":"#e8ecf0"}`,borderRadius:12,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer" }}>
              <div>
                <div style={{ display:"flex",gap:8,marginBottom:5,alignItems:"center" }}>
                  <span style={{ background:"#e8f4fd",color:"#1a6fa8",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20 }}>{l.type}</span>
                  {l.boost==="vip" && <span style={{ background:"rgba(245,158,11,0.15)",color:"#f59e0b",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20 }}>★ VIP</span>}
                  {l.boost==="featured" && <span style={{ background:"#e8f4fd",color:"#1a6fa8",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:20 }}>↑ ÖNE ÇIKAN</span>}
                </div>
                <p style={{ color:"#0f1923",fontWeight:700,fontSize:14 }}>{l.title}</p>
                <p style={{ color:"#6b7a8d",fontSize:11,fontWeight:600,marginTop:3 }}>📍 {l.loc}</p>
              </div>
              <p style={{ fontFamily:"Merriweather,serif",color:"#0f1923",fontWeight:900,fontSize:17,whiteSpace:"nowrap" }}>{l.price}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
          {[["1.4M","Nüfus"],["17","İlçe"],["1.200+","Kayıtlı Mekan"],["3.353","Aktif İlan"]].map(([v,l]) => (
            <div key={l} style={{ background:"#1a6fa8",borderRadius:12,padding:"18px 16px",textAlign:"center" }}>
              <p style={{ fontFamily:"Merriweather,serif",fontSize:28,fontWeight:900,color:"#fff" }}>{v}</p>
              <p style={{ color:"rgba(255,255,255,0.65)",fontSize:11,fontWeight:700,marginTop:4,letterSpacing:"0.08em" }}>{l.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
