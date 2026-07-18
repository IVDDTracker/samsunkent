import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#173A5A",
          borderRadius: 7,
        }}
      >
        <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#CB3A2B" }} />
      </div>
    ),
    { ...size }
  );
}
