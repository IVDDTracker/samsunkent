"use client";

import { useEffect, useRef } from "react";

/**
 * Sabit video arka plan — tüm sayfanın arkasında sinematik mantar-pano videosu,
 * karartılı (üstteki kağıt notlar okunsun). Cork yerine bunu kullanıyoruz.
 * Masaüstü 16:9, mobil 9:16 otomatik. muted/play ref ile autoplay garanti.
 */
export default function VideoBackground() {
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
    <div className="videobg" aria-hidden="true">
      <video ref={dRef} className="videobg-vid videobg-desktop" autoPlay muted loop playsInline preload="auto" poster="/hero/hero-poster.jpg">
        <source src="/hero/hero-desktop.mp4" type="video/mp4" />
      </video>
      <video ref={mRef} className="videobg-vid videobg-mobile" autoPlay muted loop playsInline preload="auto">
        <source src="/hero/hero-mobile.mp4" type="video/mp4" />
      </video>
      <div className="videobg-scrim" />
    </div>
  );
}
