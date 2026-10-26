import { ImageResponse } from "next/og";
import { site } from "@/content/site";
export const alt = `${site.name} — Good ideas. Put to work. Independent tools by ${site.operator.name}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f5ee",
        color: "#242b24",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 38, letterSpacing: -2 }}>
        ↗ {site.name}.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 65,
          fontSize: 102,
          letterSpacing: -7,
          lineHeight: 1.05,
        }}
      >
        <span>Good ideas.</span>
        <span style={{ color: "#bc3e2b" }}>Put to work.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: 20,
          color: "#64675f",
        }}
      >
        <span>Independent tools by {site.operator.name}</span>
        <span>{new URL(site.url).hostname}</span>
      </div>
    </div>,
    size,
  );
}
