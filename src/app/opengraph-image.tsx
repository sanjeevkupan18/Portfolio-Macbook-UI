import { ImageResponse } from "next/og";
import { portfolio, siteConfig } from "@/data/portfolio";

export const alt = `${portfolio.profile.name} (sanjucoding) — MacBook UI & iOS Portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          color: "white",
          background: "linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 18px",
              borderRadius: 9999,
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: 22,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            MacBook UI &amp; iOS Portfolio OS
          </div>
          <div style={{ display: "flex", fontSize: 22, opacity: 0.8, letterSpacing: "0.02em" }}>
            @{siteConfig.handle} · @{siteConfig.username}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            {portfolio.profile.name}
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: "#cbd5e1" }}>
            {portfolio.profile.role} · Full Stack Web &amp; AI Integration
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex" }}>React · Node.js · Next.js · TypeScript · MongoDB · AI</div>
          <div style={{ display: "flex", color: "#38bdf8", fontWeight: 600 }}>sanjucodingportfolio.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
