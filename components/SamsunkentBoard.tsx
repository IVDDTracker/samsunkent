"use client";

import { useEffect, useRef } from "react";

/**
 * Sinematik pano — anasayfanın üst (vitrin) deneyimi. Aşağı kaydırdıkça kamera
 * pano üzerinde nottan nota süzülür; odaktaki not netleşir. Video zemin canlı
 * ama karartılı. Etkileşimli içerik (formlar/duyurular) BU component'in ALTINDA,
 * normal akışta durur — burası "izlenen" kısım. Sınıflar `skb-` ile namespace'li,
 * mevcut düz pano stilleriyle (.note/.board/.pin) çakışmaz.
 *
 * Performans: blur filtresi yok (odak opaklıkla), 3D yok, grain sabit,
 * rAF yalnızca kamera hareket ederken döner (durunca durur).
 */
export default function SamsunkentBoard() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.classList.add("skb-rm");
      return;
    }

    const track = root.querySelector<HTMLElement>(".skb-track")!;
    const stage = root.querySelector<HTMLElement>(".skb-stage")!;
    const board = root.querySelector<HTMLElement>(".skb-board")!;
    const hint = root.querySelector<HTMLElement>(".skb-hint")!;
    const pager = root.querySelector<HTMLElement>(".skb-pager")!;
    const threadPath = root.querySelector<SVGPathElement>(".skb-thread path")!;
    const notes = Array.from(root.querySelectorAll<HTMLElement>(".skb-note"));

    let centers: { x: number; y: number }[] = [];
    let baseScale = 1;
    let stageW = 0;
    let stageH = 0;

    function measure() {
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      baseScale = Math.min(1, (stageW * 0.92) / 470);
      centers = notes.map((n) => ({ x: n.offsetLeft + n.offsetWidth / 2, y: n.offsetTop + n.offsetHeight / 2 }));
      const pins = notes.map((n) => ({ x: n.offsetLeft + n.offsetWidth / 2, y: n.offsetTop - 2 }));
      let d = `M ${pins[0].x} ${pins[0].y}`;
      for (let i = 1; i < pins.length; i++) {
        const mx = (pins[i - 1].x + pins[i].x) / 2;
        const my = (pins[i - 1].y + pins[i].y) / 2 + 46;
        d += ` Q ${mx} ${my} ${pins[i].x} ${pins[i].y}`;
      }
      threadPath.setAttribute("d", d);
    }

    // pager dots
    const dots: HTMLButtonElement[] = [];
    notes.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Not ${i + 1}`);
      b.addEventListener("click", () => {
        const max = track.offsetHeight - stageH;
        window.scrollTo({ top: track.offsetTop + (i / (notes.length - 1)) * max, behavior: "smooth" });
      });
      pager.appendChild(b);
      dots.push(b);
    });

    const ei = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let cx = 0, cy = 0, cs = 1, last = -1, init = false, running = false;

    function frame() {
      const rect = track.getBoundingClientRect();
      const max = track.offsetHeight - stageH;
      const p = Math.max(0, Math.min(1, -rect.top / max));
      const seg = p * (centers.length - 1);
      const i = Math.min(Math.floor(seg), centers.length - 2);
      const t = ei(seg - i);
      const tcx = lerp(centers[i].x, centers[i + 1].x, t);
      const tcy = lerp(centers[i].y, centers[i + 1].y, t);
      const ts2 = baseScale * (1 - Math.sin(t * Math.PI) * 0.12);
      if (!init) { cx = tcx; cy = tcy; cs = ts2; init = true; }
      cx += (tcx - cx) * 0.09;
      cy += (tcy - cy) * 0.09;
      cs += (ts2 - cs) * 0.09;
      board.style.transform = `translate3d(${stageW / 2 - cx * cs}px,${stageH / 2 - cy * cs}px,0) scale(${cs})`;
      const cur = Math.round(seg);
      if (cur !== last) {
        notes.forEach((n, k) => n.classList.toggle("skb-focus", k === cur));
        dots.forEach((d, k) => d.classList.toggle("on", k === cur));
        last = cur;
      }
      hint.style.opacity = p > 0.02 ? "0" : "1";
      if (Math.abs(tcx - cx) > 0.3 || Math.abs(tcy - cy) > 0.3 || Math.abs(ts2 - cs) > 0.001) {
        requestAnimationFrame(frame);
      } else {
        running = false;
      }
    }
    const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };

    measure();
    kick();
    const onResize = () => { measure(); kick(); };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) document.fonts.ready.then(() => { measure(); kick(); });

    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      dots.forEach((d) => d.remove());
    };
  }, []);

  const IG = "https://www.instagram.com/channel/Abbvtcz5xxeoD7Cd/";

  return (
    <div className="skb" ref={rootRef}>
      <div className="skb-track">
        <div className="skb-stage">
          <div className="skb-bg" aria-hidden="true">
            <video className="skb-vid skb-desktop" autoPlay muted loop playsInline preload="auto" poster="/hero/hero-poster.jpg">
              <source src="/hero/hero-desktop.mp4" type="video/mp4" />
            </video>
            <video className="skb-vid skb-mobile" autoPlay muted loop playsInline preload="auto">
              <source src="/hero/hero-mobile.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="skb-grain" aria-hidden="true" />
          <div className="skb-vig" aria-hidden="true" />

          <div className="skb-board">
            <svg className="skb-thread" viewBox="0 0 2800 2000" preserveAspectRatio="none" aria-hidden="true">
              <path d="" />
            </svg>

            <article className="skb-note" style={{ left: 150, top: 230, ["--r" as string]: "-2.5deg" }}>
              <span className="skb-pin" />
              <span className="skb-chip">Manifesto</span>
              <h1 className="skb-hl">Herkes <span className="red">buraya</span> bakıyor.</h1>
              <p>Samsun konuşuyorsa, buradan konuşuyor. Mekânı, sokağı, gündemi — nabız burada atar. Süssüz, filtresiz, torpilsiz.</p>
              <a className="skb-cta" href={IG} target="_blank" rel="noopener noreferrer">İçeri gir, aramıza katıl →</a>
              <div className="skb-sign">— samsunkent</div>
            </article>

            <article className="skb-note" style={{ left: 1140, top: 930, ["--r" as string]: "2deg" }}>
              <span className="skb-pin navy" />
              <span className="skb-chip">💻 Web &amp; Yazılım</span>
              <h1 className="skb-hl sm">Web sitesi mi lazım?</h1>
              <p>Kurumsal site, e-ticaret, mobil uygulama — markaya özel, Google&apos;da çıkan işler. Hazır tema değil.</p>
              <div className="skb-links">
                <a href="https://dailydermo.com" target="_blank" rel="noopener noreferrer">dailydermo.com →</a>
                <a href="https://www.anivo.app" target="_blank" rel="noopener noreferrer">anivo.app →</a>
                <a href="https://samsunpettransfer.com" target="_blank" rel="noopener noreferrer">pet transfer →</a>
              </div>
              <a className="skb-cta ghost" href="/samsun-web-sitesi-yaptirma">Hizmetler &amp; fiyatlar →</a>
            </article>

            <article className="skb-note" style={{ left: 2060, top: 300, ["--r" as string]: "-1.5deg" }}>
              <span className="skb-pin green" />
              <span className="skb-chip">🎮 Kiralık</span>
              <h1 className="skb-hl sm">Evine büyük ekran keyfi.</h1>
              <p>PS5 (oyunlar dahil), projeksiyon ve perde — maç günü, film gecesi. Atakum, Canik, İlkadım&apos;a ücretsiz teslim + kurulum.</p>
              <a className="skb-cta" href="/kirala">Fiyat al &amp; rezervasyon →</a>
            </article>

            <article className="skb-note" style={{ left: 1800, top: 1250, ["--r" as string]: "2.5deg" }}>
              <span className="skb-pin" />
              <span className="skb-chip">Hizmet Rehberi</span>
              <h1 className="skb-hl sm">Samsun&apos;da usta mı lazım?</h1>
              <p>Nakliyat, klima-kombi, temizlik, tesisatçı… Samsun&apos;un yerel firmaları bir arada. İlçene göre bul, ara.</p>
              <a className="skb-cta ghost" href="/hizmetler">Hizmet rehberine gir →</a>
            </article>

            <article className="skb-note" style={{ left: 640, top: 1370, ["--r" as string]: "-2deg" }}>
              <span className="skb-pin green" />
              <span className="skb-chip">Sen de var mısın?</span>
              <h1 className="skb-hl">Geç kalan <span className="red">sonra öğrenir.</span></h1>
              <p>Samsun&apos;un olan bitenini herkesten önce görmek istiyorsan yerin burası. Süssüz, filtresiz — tam da senin gibi.</p>
              <a className="skb-cta" href={IG} target="_blank" rel="noopener noreferrer">Aramıza katıl →</a>
              <div className="skb-sign">— samsunkent</div>
            </article>
          </div>

          <div className="skb-pager" aria-hidden="true" />
          <a href="#pano" className="skb-hint" aria-label="Aşağı kaydır"><span>Kaydır</span><span className="a" aria-hidden="true">↓</span></a>
        </div>
      </div>
    </div>
  );
}
