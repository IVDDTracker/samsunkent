"use client";

import { useEffect, useRef } from "react";

/**
 * Sinematik video hero — anasayfanın en üstünde tam ekran.
 * Masaüstünde 16:9, mobilde 9:16 mantar-pano videosu; üstünde manifesto.
 * Video sessiz + otomatik + döngü; muted/play ref ile garanti altına alınır
 * (bazı tarayıcılar React'in `muted` attribute'una güvenmiyor).
 */
export default function VideoHero() {
  const dRef = useRef<HTMLVideoElement>(null);
  const mRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    [dRef.current, mRef.current].forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  return (
    <section className="vhero" aria-label="samsunkent">
      <video
        ref={dRef}
        className="vhero-vid vhero-desktop"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/hero-poster.jpg"
      >
        <source src="/hero/hero-desktop.mp4" type="video/mp4" />
      </video>
      <video
        ref={mRef}
        className="vhero-vid vhero-mobile"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/hero/hero-mobile.mp4" type="video/mp4" />
      </video>

      <div className="vhero-scrim" aria-hidden="true" />

      <div className="vhero-inner">
        <span className="vhero-chip">Manifesto</span>
        <h1 className="vhero-h1">
          Herkes <span className="red">buraya</span> bakıyor.
        </h1>
        <p className="vhero-lede">
          Samsun konuşuyorsa, buradan konuşuyor. Mekânı, sokağı, gündemi — nabız
          burada atar. Süssüz, filtresiz, torpilsiz.
        </p>
        <a
          className="vhero-cta"
          href="https://www.instagram.com/channel/Abbvtcz5xxeoD7Cd/"
          target="_blank"
          rel="noopener noreferrer"
        >
          İçeri gir, aramıza katıl →
        </a>
      </div>

      <a href="#pano" className="vhero-cue" aria-label="Aşağı kaydır">
        <span>Kaydır</span>
        <span className="a" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
