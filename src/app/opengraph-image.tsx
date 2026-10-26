import { ImageResponse } from "next/og";
import { site } from "@/content/site";
export const alt = `${site.name} — Make good things happen. Independent applications, built with assistance from AI.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#faf6ee",
        color: "#18181b",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "42px 64px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        <span
          style={{
            display: "flex",
            width: 14,
            height: 14,
            background: "#ff4400",
            border: "2px solid #18181b",
          }}
        />
        {site.name}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 32,
          padding: "36px 40px",
          background: "#ff4400",
          color: "white",
          border: "2px solid #18181b",
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: -4,
          lineHeight: 1.05,
        }}
      >
        <span>Make good things</span>
        <span>happen.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: 18,
          color: "#59565d",
        }}
      >
        <span>Curiosity, care, and assistance from AI.</span>
        <span>{new URL(site.url).hostname}</span>
      </div>
    </div>,
    size,
  );
}
