import { ImageResponse } from "next/og";

export const alt = "samsunkent — Mekan, Sokak, Gundem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#173A5A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div style={{ fontSize: 118, fontWeight: 800, color: "#FAF6EC", letterSpacing: -3 }}>
            samsunkent
          </div>
          <div style={{ fontSize: 118, fontWeight: 800, color: "#CB3A2B" }}>.</div>
        </div>
        <div style={{ width: 360, height: 8, background: "#CB3A2B", marginTop: 10, borderRadius: 4 }} />
        <div style={{ marginTop: 30, fontSize: 40, fontWeight: 700, color: "#cdd7e0", letterSpacing: 8 }}>
          MEKAN · SOKAK · GUNDEM
        </div>
        <div style={{ marginTop: 46, fontSize: 27, color: "#8fa6bb" }}>
          @samsunkentcom · 1M+ / ay
        </div>
      </div>
    ),
    { ...size }
  );
}
