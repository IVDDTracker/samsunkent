"use client";
import { useEffect, useRef } from "react";

/** Mantar pano dokusu — canvas ile üretilir. */
export default function CorkBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;

    function draw() {
      const el = ref.current!;
      const w = (el.width = window.innerWidth);
      const h = (el.height = window.innerHeight);
      const css = getComputedStyle(document.documentElement);
      const base = css.getPropertyValue("--cork").trim() || "#C69E6A";
      const b2 = css.getPropertyValue("--cork-2").trim() || "#B88C54";
      const edge = css.getPropertyValue("--cork-edge").trim() || "#7f5c30";
      x!.fillStyle = base;
      x!.fillRect(0, 0, w, h);
      const tones = ["#00000014", "#0000001f", "#ffffff18", "#00000010", b2 + "55"];
      const n = Math.floor((w * h) / 900);
      for (let i = 0; i < n; i++) {
        x!.fillStyle = tones[i % tones.length];
        const px = Math.random() * w;
        const py = Math.random() * h;
        const r = Math.random() * 2.4 + 0.5;
        x!.beginPath();
        x!.ellipse(px, py, r, r * (0.6 + Math.random() * 0.6), Math.random() * 3, 0, 7);
        x!.fill();
      }
      const g = x!.createRadialGradient(w / 2, h * 0.35, h * 0.2, w / 2, h / 2, h * 0.95);
      g.addColorStop(0, "#00000000");
      g.addColorStop(1, edge + "66");
      x!.fillStyle = g;
      x!.fillRect(0, 0, w, h);
    }

    draw();
    window.addEventListener("resize", draw);
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    mq.addEventListener?.("change", draw);
    return () => {
      window.removeEventListener("resize", draw);
      mq.removeEventListener?.("change", draw);
    };
  }, []);

  return <canvas id="cork" ref={ref} aria-hidden="true" />;
}
