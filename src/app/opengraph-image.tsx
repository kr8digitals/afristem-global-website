import { ImageResponse } from "next/og";

export const alt = "AFRISTEM — Inspiring the Next Generation of African Innovators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#04122f 0%,#0b2a6f 55%,#1638b3 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: "#ffc42d" }} />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 6, color: "#ffd44d" }}>AFRISTEM</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, maxWidth: 950 }}>Inspiring the Next Generation of African Innovators.</div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)", maxWidth: 900 }}>Making STEM exciting, practical and accessible for children, teenagers, schools, educators and STEM professionals.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["SciSPELL", "Code Africa", "STEM Kids Championship", "Organic Chemistry Tournament"].map((t) => (
            <div key={t} style={{ padding: "10px 20px", borderRadius: 999, background: "rgba(255,196,45,0.15)", border: "1px solid rgba(255,196,45,0.5)", color: "#ffd44d", fontSize: 20, fontWeight: 700 }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
