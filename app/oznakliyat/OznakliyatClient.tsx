"use client";

import { useEffect } from "react";

const CSS = `
.oz{
  --paper:#F5F1E9;--paper2:#EDE7DB;--ink:#12181F;--muted:#5B6672;
  --navy:#0E1C2B;--navy2:#13293D;--brand:#E4572E;--brand-dk:#C4451F;
  --line:#DAD2C4;--ok:#1F9D57;
  --shadow:0 18px 50px rgba(14,28,43,.18);--shadow-sm:0 6px 20px rgba(14,28,43,.10);
  --r:16px;--maxw:1120px;
  color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  line-height:1.5;-webkit-font-smoothing:antialiased;
}
body:has(.oz){margin:0;background:#F5F1E9;overflow-x:hidden}
.oz *{box-sizing:border-box}
.oz img{max-width:100%;display:block}
.oz a{color:inherit;text-decoration:none}
.oz .wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px}
.oz .eyebrow{font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--brand)}

.oz .bar{position:sticky;top:0;z-index:50;background:rgba(14,28,43,.92);backdrop-filter:blur(8px);color:#fff;border-bottom:1px solid rgba(255,255,255,.08)}
.oz .bar .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.oz .brandmark{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.02em}
.oz .brandmark .dot{width:34px;height:34px;border-radius:9px;background:var(--brand);display:grid;place-items:center;box-shadow:0 6px 16px rgba(228,87,46,.45)}
.oz .brandmark .dot svg{width:20px;height:20px}
.oz .bar .tel{display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px}
.oz .bar .tel .lbl{font-size:11px;font-weight:700;color:#9fb0c0;letter-spacing:.08em;text-transform:uppercase;display:block;line-height:1}
.oz .bar-cta{background:var(--brand);color:#fff;padding:9px 16px;border-radius:10px;font-weight:800;font-size:14px}
@media(max-width:640px){.oz .bar .tel .lbl{display:none}}

.oz .hero{position:relative;background:var(--navy);color:#fff;overflow:hidden}
.oz .hero-photo{position:absolute;inset:0;z-index:0}
.oz .hero-photo img{width:100%;height:100%;object-fit:cover;opacity:.34}
.oz .hero-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,28,43,.55),rgba(14,28,43,.82) 60%,rgba(14,28,43,.96)),radial-gradient(1200px 500px at 80% -10%,rgba(228,87,46,.25),transparent 60%)}
.oz .hero .wrap{position:relative;z-index:1;padding:64px 20px 76px}
.oz .hero h1{font-size:clamp(34px,6vw,60px);line-height:1.03;margin:14px 0 0;font-weight:900;letter-spacing:-.02em}
.oz .hero h1 .hl{color:var(--brand)}
.oz .hero p.lead{font-size:clamp(16px,2.4vw,20px);color:#cdd8e4;max-width:620px;margin:18px 0 0}
.oz .hero .cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.oz .btn{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:16px;padding:15px 24px;border-radius:12px;cursor:pointer;border:0;transition:transform .12s ease, box-shadow .12s ease}
.oz .btn:active{transform:translateY(1px)}
.oz .btn-wa{background:#25D366;color:#062b16;box-shadow:0 12px 30px rgba(37,211,102,.35)}
.oz .btn-brand{background:var(--brand);color:#fff;box-shadow:0 12px 30px rgba(228,87,46,.4)}
.oz .btn-ghost{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.22)}
.oz .btn svg{width:20px;height:20px}
.oz .hero .trust{display:flex;gap:22px;flex-wrap:wrap;margin-top:34px;padding-top:26px;border-top:1px solid rgba(255,255,255,.12)}
.oz .hero .trust .t{display:flex;align-items:center;gap:10px}
.oz .hero .trust .t svg{width:22px;height:22px;color:var(--brand);flex:0 0 auto}
.oz .hero .trust .t b{display:block;font-size:15px}
.oz .hero .trust .t span{font-size:12.5px;color:#9fb0c0}

.oz .strip{background:var(--paper2);border-bottom:1px solid var(--line)}
.oz .strip .wrap{display:flex;gap:26px;flex-wrap:wrap;justify-content:center;padding:16px 20px;font-weight:700;color:var(--navy2);font-size:14px}
.oz .strip .s{display:flex;align-items:center;gap:8px}
.oz .strip .s svg{width:17px;height:17px;color:var(--brand)}

.oz section{padding:60px 0}
.oz .sec-head{max-width:620px;margin:0 auto 40px;text-align:center}
.oz .sec-head h2{font-size:clamp(26px,4vw,38px);font-weight:900;letter-spacing:-.02em;margin:10px 0 0}
.oz .sec-head p{color:var(--muted);font-size:17px;margin:12px 0 0}

.oz #teklif{background:var(--navy);color:#fff}
.oz .calc{display:grid;grid-template-columns:1.15fr .85fr;gap:0;background:var(--navy2);border-radius:22px;overflow:hidden;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.08)}
.oz .calc-form{padding:34px}
.oz .calc-form h3{margin:0 0 4px;font-size:22px;font-weight:900}
.oz .calc-form .sub{color:#9fb0c0;font-size:14px;margin:0 0 24px}
.oz .field{margin-bottom:20px}
.oz .field > label{display:block;font-weight:800;font-size:13px;letter-spacing:.02em;margin-bottom:10px;color:#dfe8f1}
.oz .chips{display:flex;gap:8px;flex-wrap:wrap}
.oz .chip{flex:1 1 auto;min-width:56px;text-align:center;padding:12px 10px;border-radius:11px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);color:#fff;font-weight:800;cursor:pointer;font-size:15px;transition:all .12s ease;user-select:none}
.oz .chip:hover{border-color:rgba(228,87,46,.5)}
.oz .chip.on{background:var(--brand);border-color:var(--brand);box-shadow:0 8px 20px rgba(228,87,46,.4)}
.oz .chip small{display:block;font-size:11px;font-weight:600;opacity:.8;margin-top:2px}
.oz .result{background:linear-gradient(160deg,#16324a,#0c1a28);padding:34px;display:flex;flex-direction:column;justify-content:center;position:relative}
.oz .result .rlabel{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--brand)}
.oz .result .price{font-size:clamp(32px,5vw,46px);font-weight:900;letter-spacing:-.02em;margin:8px 0 2px;line-height:1}
.oz .result .price small{font-size:16px;color:#9fb0c0;font-weight:700}
.oz .result .note{font-size:13px;color:#9fb0c0;margin:10px 0 22px;line-height:1.45}
.oz .result .btn-wa{width:100%;justify-content:center;font-size:17px;padding:16px}
.oz .result .guarantee{margin-top:16px;font-size:12.5px;color:#8fa2b3;display:flex;align-items:center;gap:8px;justify-content:center}
.oz .result .guarantee svg{width:15px;height:15px;color:var(--ok)}
@media(max-width:820px){.oz .calc{grid-template-columns:1fr}}

.oz .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.oz .step{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:24px;box-shadow:var(--shadow-sm);position:relative}
.oz .step .n{position:absolute;top:-14px;left:24px;width:34px;height:34px;border-radius:10px;background:var(--navy);color:#fff;display:grid;place-items:center;font-weight:900;font-size:15px}
.oz .step .ic{width:44px;height:44px;border-radius:12px;background:var(--paper2);display:grid;place-items:center;margin:10px 0 14px}
.oz .step .ic svg{width:24px;height:24px;color:var(--brand)}
.oz .step h4{margin:0 0 6px;font-size:17px;font-weight:800}
.oz .step p{margin:0;color:var(--muted);font-size:14px}
@media(max-width:820px){.oz .steps{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.oz .steps{grid-template-columns:1fr}}

.oz #galeri{background:var(--paper2)}
.oz .gal{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:14px}
.oz .gal .cell{position:relative;border-radius:14px;overflow:hidden;background:var(--navy2);box-shadow:var(--shadow-sm)}
.oz .gal .cell img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;position:relative;z-index:2}
.oz .gal .cell:hover img{transform:scale(1.06)}
.oz .gal .cell.big{grid-column:span 2;grid-row:span 2}
.oz .gal .cap{position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(transparent,rgba(14,28,43,.85));color:#fff;font-weight:700;font-size:14px;z-index:3}
.oz .gal .ph{position:absolute;inset:0;display:grid;place-items:center;color:#5f7488;text-align:center;font-size:13px;font-weight:700;padding:16px;z-index:1}
.oz .gal .ph svg{width:34px;height:34px;margin-bottom:8px;opacity:.6}
@media(max-width:820px){.oz .gal{grid-template-columns:1fr 1fr;grid-auto-rows:160px}.oz .gal .cell.big{grid-column:span 2;grid-row:span 1}}

.oz .care{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.oz .care .c{background:#fff;border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:14px;padding:24px;box-shadow:var(--shadow-sm)}
.oz .care .c h4{margin:0 0 8px;font-size:17px;font-weight:800;display:flex;align-items:center;gap:9px}
.oz .care .c h4 svg{width:20px;height:20px;color:var(--brand);flex:0 0 auto}
.oz .care .c p{margin:0;color:var(--muted);font-size:14.5px}
@media(max-width:820px){.oz .care{grid-template-columns:1fr}}

.oz .faq{max-width:760px;margin:0 auto}
.oz details{background:#fff;border:1px solid var(--line);border-radius:12px;margin-bottom:12px;overflow:hidden;box-shadow:var(--shadow-sm)}
.oz summary{padding:18px 22px;font-weight:800;font-size:16px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
.oz summary::-webkit-details-marker{display:none}
.oz summary .plus{width:24px;height:24px;flex:0 0 auto;border-radius:7px;background:var(--paper2);display:grid;place-items:center;font-weight:900;color:var(--brand);transition:transform .2s}
.oz details[open] summary .plus{transform:rotate(45deg)}
.oz details .body{padding:0 22px 20px;color:var(--muted);font-size:15px}

.oz .final{background:var(--navy);color:#fff;text-align:center}
.oz .final h2{font-size:clamp(28px,4.5vw,42px);font-weight:900;letter-spacing:-.02em;margin:0}
.oz .final p{color:#cdd8e4;font-size:18px;margin:14px auto 0;max-width:520px}
.oz .final .cta-row{justify-content:center;margin-top:30px;display:flex;gap:12px;flex-wrap:wrap}

.oz footer{background:#0a141d;color:#9fb0c0;padding:40px 0;font-size:14px}
.oz footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:center}
.oz footer .brandmark{color:#fff}
.oz footer a:hover{color:#fff}
.oz footer .socials{display:flex;gap:14px;align-items:center}
.oz footer .socials a{display:flex;align-items:center;gap:6px}
.oz footer .socials svg{width:18px;height:18px}

.oz .mobar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;background:#fff;border-top:1px solid var(--line);padding:10px 14px;gap:10px;box-shadow:0 -8px 24px rgba(14,28,43,.12)}
.oz .mobar a{flex:1;justify-content:center;font-size:15px;padding:13px}
@media(max-width:720px){.oz .mobar{display:flex}body:has(.oz){padding-bottom:74px}}

.oz .wafloat{position:fixed;right:18px;bottom:88px;z-index:55;width:56px;height:56px;border-radius:50%;background:#25D366;display:grid;place-items:center;box-shadow:0 10px 26px rgba(37,211,102,.5);animation:ozpulse 2.4s infinite}
.oz .wafloat svg{width:30px;height:30px;color:#fff}
@keyframes ozpulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.5)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
@media(max-width:720px){.oz .wafloat{bottom:82px;right:14px;width:52px;height:52px}}
`;

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.8.7-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.8c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.9.9-.9 2.1-.6 3.2.6 2 2 3.6 4 4.6 1.2.6 2.3.9 3.4.6.7-.2 1.4-.7 1.6-1.4.1-.4.1-.8 0-.9l-.5-.3Z" />
  </svg>
);
const truckIcon = (stroke: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h13v13H1z" />
    <path d="M14 8h4l3 3v5h-7" />
    <circle cx="5.5" cy="18.5" r="1.6" />
    <circle cx="17.5" cy="18.5" r="1.6" />
  </svg>
);
const check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const hidePhoto = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = "none";
};

export default function OznakliyatClient() {
  useEffect(() => {
    const PHONE = "905462592055";
    const groups: any = {
      home: { val: "2", price: 6500 },
      dist: { val: "ici", mult: 1 },
      lift: { val: "asansor", add: 0 },
    };
    const extras: any = {
      paket: { on: true, add: 0, label: "Paketleme" },
      mont: { on: false, add: 1200, label: "Montaj/demontaj" },
      depo: { on: false, add: 800, label: "Depolama" },
    };
    const labels: any = {
      home: { "1": "1+1", "2": "2+1", "3": "3+1", "4": "4+1", "5": "5+1 / Villa" },
      dist: { ici: "Samsun içi", il: "İl içi uzak", sehir: "Şehirler arası" },
      lift: { asansor: "Asansör var", dusuk: "1–2. kat", yuksek: "Yüksek kat (asansörsüz)" },
    };
    const fmt = (n: number) => "₺" + Math.round(n).toLocaleString("tr-TR");
    const calc = () => {
      const base = groups.home.price;
      const mult = groups.dist.mult;
      const add = groups.lift.add;
      let ex = 0;
      Object.keys(extras).forEach((k) => { if (extras[k].on) ex += extras[k].add; });
      const low = base * mult + add + ex;
      return { low, high: low * 1.25 };
    };
    const waLink = (msg: string) => "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg);
    const detailMsg = () => {
      const r = calc();
      const on = Object.keys(extras).filter((k) => extras[k].on).map((k) => extras[k].label);
      return (
        "Merhaba Özin Nakliyat, siteden fiyat hesapladım:\n" +
        "• Ev: " + labels.home[groups.home.val] + "\n" +
        "• Taşıma: " + labels.dist[groups.dist.val] + "\n" +
        "• Kat/asansör: " + labels.lift[groups.lift.val] + "\n" +
        (on.length ? "• Ek hizmet: " + on.join(", ") + "\n" : "") +
        "• Tahmini: " + fmt(r.low) + " – " + fmt(r.high) + "\n\n" +
        "Bu bilgilerle kesin teklif ve keşif rica ediyorum. Uygun zaman nedir?"
      );
    };
    const simpleMsg = "Merhaba Özin Nakliyat, evden eve taşınma için fiyat ve ücretsiz keşif rica ediyorum.";
    const render = () => {
      const r = calc();
      const out = document.getElementById("ozPriceOut");
      if (out) out.innerHTML = fmt(r.low) + ' <small>– ' + fmt(r.high) + "</small>";
      const wc = document.getElementById("oz-wa-calc") as HTMLAnchorElement | null;
      if (wc) wc.href = waLink(detailMsg());
      ["oz-wa-hero", "oz-wa-final", "oz-wa-float", "oz-wa-mo"].forEach((id) => {
        const el = document.getElementById(id) as HTMLAnchorElement | null;
        if (el) el.href = waLink(simpleMsg);
      });
    };
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>(".oz .chips[data-group]").forEach((box) => {
      const key = box.getAttribute("data-key")!;
      box.querySelectorAll<HTMLElement>(".chip").forEach((chip) => {
        const handler = () => {
          box.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
          chip.classList.add("on");
          if (key === "home") { groups.home.val = chip.dataset.val; groups.home.price = +chip.dataset.price!; }
          if (key === "dist") { groups.dist.val = chip.dataset.val; groups.dist.mult = +chip.dataset.mult!; }
          if (key === "lift") { groups.lift.val = chip.dataset.val; groups.lift.add = +chip.dataset.add!; }
          render();
        };
        chip.addEventListener("click", handler);
        cleanups.push(() => chip.removeEventListener("click", handler));
      });
    });
    document.querySelectorAll<HTMLElement>(".oz .chip.toggle").forEach((chip) => {
      const handler = () => {
        const k = chip.dataset.key!;
        chip.classList.toggle("on");
        extras[k].on = chip.classList.contains("on");
        render();
      };
      chip.addEventListener("click", handler);
      cleanups.push(() => chip.removeEventListener("click", handler));
    });
    render();
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div className="oz">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* TOP BAR */}
      <div className="bar">
        <div className="wrap">
          <a className="brandmark" href="#">
            <span className="dot">{truckIcon("#fff")}</span>
            Özin Nakliyat
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <a className="tel" href="tel:+905462592055">
              <span><span className="lbl">7/24 Ara</span>0546 259 20 55</span>
            </a>
            <a className="bar-cta" href="#teklif">Fiyat Al</a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="hero-photo">
          <img src="/oznakliyat/ozin-1.jpg" alt="Özin Nakliyat" onError={hidePhoto} />
        </div>
        <div className="wrap">
          <span className="eyebrow">Samsun &amp; Tüm Türkiye</span>
          <h1>Evinizi <span className="hl">tek eşya kırılmadan</span> yeni adrese taşıyoruz.</h1>
          <p className="lead">Her parça tek tek balonlu naylonla sarılır, asansörle indirilir, sigortalı taşınır. Ücretsiz keşif yapar, <b>net fiyatı önceden</b> söyleriz — sürpriz yok.</p>
          <div className="cta-row">
            <a className="btn btn-wa" id="oz-wa-hero" href="#teklif" target="_blank" rel="noopener">{WA_ICON} WhatsApp'tan Fiyat Al</a>
            <a className="btn btn-ghost" href="tel:+905462592055">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
              Hemen Ara
            </a>
          </div>
          <div className="trust">
            <div className="t">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>
              <div><b>Sigortalı Taşıma</b><span>Eşyanız güvence altında</span></div>
            </div>
            <div className="t">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-3V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /></svg>
              <div><b>Ücretsiz Keşif</b><span>Gelir, bakar, fiyat veririz</span></div>
            </div>
            <div className="t">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <div><b>7/24 Ulaşın</b><span>Hafta sonu dahil</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* STRIP */}
      <div className="strip">
        <div className="wrap">
          <div className="s">{check} Evden Eve Nakliyat</div>
          <div className="s">{check} Ofis Taşıma</div>
          <div className="s">{check} Şehirler Arası</div>
          <div className="s">{check} Asansörlü Taşıma</div>
          <div className="s">{check} Paketleme &amp; Montaj</div>
        </div>
      </div>

      {/* QUOTE CALCULATOR */}
      <section id="teklif">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Saniyeler içinde</span>
            <h2 style={{ color: "#fff" }}>Taşınma fiyatınızı hesaplayın</h2>
            <p style={{ color: "#9fb0c0" }}>Birkaç soruya cevap verin, tahmini fiyatı görün. Beğenirseniz tek tıkla WhatsApp'tan kesin teklif isteyin.</p>
          </div>
          <div className="calc">
            <div className="calc-form">
              <h3>Taşınma Detayları</h3>
              <p className="sub">Netleştirmek için ücretsiz keşife geliriz.</p>
              <div className="field">
                <label>Evinizin büyüklüğü</label>
                <div className="chips" data-group="home" data-key="home">
                  <div className="chip" data-val="1" data-price="4500">1+1</div>
                  <div className="chip on" data-val="2" data-price="6500">2+1</div>
                  <div className="chip" data-val="3" data-price="8500">3+1</div>
                  <div className="chip" data-val="4" data-price="11000">4+1</div>
                  <div className="chip" data-val="5" data-price="14000">5+1 / Villa</div>
                </div>
              </div>
              <div className="field">
                <label>Nereye taşınıyorsunuz?</label>
                <div className="chips" data-group="dist" data-key="dist">
                  <div className="chip on" data-val="ici" data-mult="1">Samsun içi<small>Aynı ilçe/çevre</small></div>
                  <div className="chip" data-val="il" data-mult="1.35">İl içi uzak<small>İlçeler arası</small></div>
                  <div className="chip" data-val="sehir" data-mult="2.2">Şehirler arası<small>Başka il</small></div>
                </div>
              </div>
              <div className="field">
                <label>Çıkış katı — asansör var mı?</label>
                <div className="chips" data-group="lift" data-key="lift">
                  <div className="chip on" data-val="asansor" data-add="0">Asansör var</div>
                  <div className="chip" data-val="dusuk" data-add="500">1–2. kat</div>
                  <div className="chip" data-val="yuksek" data-add="1500">Yüksek kat<small>Asansörsüz</small></div>
                </div>
              </div>
              <div className="field">
                <label>Ek hizmet</label>
                <div className="chips">
                  <div className="chip on toggle" data-add="0" data-key="paket">Paketleme dahil</div>
                  <div className="chip toggle" data-add="1200" data-key="mont">Montaj / demontaj</div>
                  <div className="chip toggle" data-add="800" data-key="depo">Depolama</div>
                </div>
              </div>
            </div>
            <div className="result">
              <span className="rlabel">Tahmini Fiyat</span>
              <div className="price" id="ozPriceOut">₺6.500 <small>– ₺8.100</small></div>
              <p className="note">Bu tahmini bir aralıktır. Kesin fiyat, ücretsiz keşiften sonra netleşir — <b>sürpriz ek ücret çıkmaz.</b></p>
              <a className="btn btn-wa" id="oz-wa-calc" href="#" target="_blank" rel="noopener">{WA_ICON} Bu Bilgilerle Teklif İste</a>
              <div className="guarantee">{check} Fiyatı yazınca aynı gün dönüş yaparız</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Süreç</span>
            <h2>Taşınma günü nasıl geçiyor?</h2>
            <p>İlk telefondan yeni evinizde eşyaların yerleşmesine kadar tek elden takip.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg></div>
              <h4>Ücretsiz Keşif</h4>
              <p>Arayın, gelip eşyalarınıza bakalım. Net fiyatı yazılı verelim.</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-8l-2-3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /></svg></div>
              <h4>Paketleme</h4>
              <p>Her parça balonlu naylon ve battaniyeyle tek tek sarılır.</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <div className="ic">{truckIcon("currentColor")}</div>
              <h4>Güvenli Taşıma</h4>
              <p>Asansörlü sistem ve tam donanımlı araçla sigortalı nakil.</p>
            </div>
            <div className="step">
              <div className="n">4</div>
              <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-6h4v6" /></svg></div>
              <h4>Kurulum</h4>
              <p>Mobilyalar sökülüp yeni evde tekrar kurulur, yerine yerleştirilir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="galeri">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">İşimizden kareler</span>
            <h2>Eşyalarınıza böyle davranıyoruz</h2>
            <p>Fotoğraflar gerçek taşımalarımızdan. Sarma, koruma ve özenin farkını görün.</p>
          </div>
          <div className="gal">
            {[
              { n: 1, big: true, cap: "Her parça tek tek sarılır" },
              { n: 2, big: false, cap: "Uzman ekip" },
              { n: 3, big: false, cap: "Titiz yerleştirme" },
              { n: 4, big: false, cap: "Güler yüzlü hizmet" },
            ].map((c) => (
              <div className={"cell" + (c.big ? " big" : "")} key={c.n}>
                <img src={`/oznakliyat/ozin-${c.n}.jpg`} alt={c.cap} onError={hidePhoto} />
                <div className="ph">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                  ozin-{c.n}.jpg
                </div>
                <div className="cap">{c.cap}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARE */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Neden Özin Nakliyat?</span>
            <h2>Ucuza değil, doğru taşınmaya odaklanırız</h2>
            <p>En çok korktuğunuz üç şey — biz onları iş çıkmadan çözüyoruz.</p>
          </div>
          <div className="care">
            <div className="c">
              <h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>"Ya eşyam çizilirse?"</h4>
              <p>Beyaz eşya, mobilya ve cam yüzeyler battaniye + balonlu naylonla çift kat sarılır. Taşıma sigortalıdır.</p>
            </div>
            <div className="c">
              <h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>"Ya fiyat sonradan artarsa?"</h4>
              <p>Keşifte söylediğimiz fiyat nettir. İş bitiminde ekstra "hamaliye, çıkış parası" gibi sürpriz kalem çıkmaz.</p>
            </div>
            <div className="c">
              <h4><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>"Ya günü kaçırırsa?"</h4>
              <p>Randevu saatinde ekip kapıda. İşi aynı gün bitirir, akşam yeni evinizde otururuz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--paper2)" }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Sık sorulanlar</span>
            <h2>Aklınızdaki sorular</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>Keşif ücretli mi? <span className="plus">+</span></summary>
              <div className="body">Hayır. Ekibimiz gelir, eşyalarınıza bakar ve net fiyatı yerinde söyler. Keşif tamamen ücretsizdir, hiçbir zorunluluğunuz yoktur.</div>
            </details>
            <details>
              <summary>Eşyalar sigortalı mı taşınıyor? <span className="plus">+</span></summary>
              <div className="body">Evet. Taşıma sigortalıdır; olası bir hasarda güvence altındasınız. Ayrıca hassas parçaları özel olarak paketleriz.</div>
            </details>
            <details>
              <summary>Şehir dışına da taşıyor musunuz? <span className="plus">+</span></summary>
              <div className="body">Evet, Samsun'dan Türkiye'nin her iline evden eve ve ofis taşıma yapıyoruz. Şehirler arası fiyatı mesafeye göre keşifte netleştiririz.</div>
            </details>
            <details>
              <summary>Mobilyaları söküp kuruyor musunuz? <span className="plus">+</span></summary>
              <div className="body">Evet. Dolap, yatak, mutfak gibi mobilyalar ustalarımızca sökülür, taşınır ve yeni evinizde tekrar kurulur.</div>
            </details>
            <details>
              <summary>Ne kadar önceden aramalıyım? <span className="plus">+</span></summary>
              <div className="body">Mümkünse birkaç gün önce, ama acil taşınmalarda aynı gün de destek veriyoruz. 0546 259 20 55'i arayın, planlayalım.</div>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="wrap">
          <h2>Taşınmayı kafanıza takmayın.</h2>
          <p>Bir telefon kadar uzaktayız. Ücretsiz keşif için hemen yazın, fiyatı bugün öğrenin.</p>
          <div className="cta-row">
            <a className="btn btn-wa" id="oz-wa-final" href="#" target="_blank" rel="noopener">{WA_ICON} WhatsApp'tan Yaz</a>
            <a className="btn btn-brand" href="tel:+905462592055">Hemen Ara: 0546 259 20 55</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div>
            <a className="brandmark" href="#" style={{ marginBottom: 10 }}>
              <span className="dot">{truckIcon("#fff")}</span>
              Özin Nakliyat
            </a>
            <div style={{ marginTop: 8 }}>Samsun Evden Eve Nakliyat · Ofis Taşıma · Şehirler Arası</div>
          </div>
          <div className="socials">
            <a href="tel:+905462592055"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg> 0546 259 20 55</a>
            <a href="https://instagram.com/ozin.nakliyat" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg> @ozin.nakliyat</a>
          </div>
        </div>
      </footer>

      {/* FLOATING + STICKY */}
      <a className="wafloat" id="oz-wa-float" href="#" target="_blank" rel="noopener" aria-label="WhatsApp">{WA_ICON}</a>
      <div className="mobar">
        <a className="btn btn-wa" id="oz-wa-mo" href="#" target="_blank" rel="noopener">{WA_ICON} WhatsApp</a>
        <a className="btn btn-brand" href="tel:+905462592055">Ara</a>
      </div>
    </div>
  );
}
