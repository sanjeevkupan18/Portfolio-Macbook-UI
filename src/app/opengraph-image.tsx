import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

export const alt = `${portfolio.profile.name} — ${portfolio.profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, color: "white", background: "linear-gradient(135deg,#312e81 0%,#0e7490 100%)" }}>
        <div style={{ fontSize: 30, opacity: 0.8 }}>Portfolio OS</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 16 }}>{portfolio.profile.name}</div>
        <div style={{ fontSize: 42, marginTop: 12, opacity: 0.9 }}>{portfolio.profile.role}</div>
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.75 }}>React · Node.js · MongoDB · Data Analytics</div>
      </div>
    ),
    size,
  );
}
