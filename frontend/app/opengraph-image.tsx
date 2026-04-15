/**
 * opengraph-image.tsx — Dynamic OG image for Lingona.
 *
 * Next.js 14 App Router file convention: a default export returning an
 * `ImageResponse` is automatically served at `/opengraph-image` and wired
 * into the `<meta property="og:image">` tag for the `/` route. A twin
 * `twitter-image.tsx` file handles Twitter cards.
 *
 * Size: 1200×630 (Facebook / Twitter / LinkedIn recommended).
 * Design: navy brand background, teal accent, Playfair serif wordmark,
 *         DM-Sans-ish tagline, octopus mascot emoji.
 *
 * No external font loading — ImageResponse's default sans-serif handles
 * the tagline; the wordmark uses an inline system-serif fallback so the
 * edge runtime doesn't need to fetch a .ttf on every cold start.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lingona — Luyện IELTS Speaking & Writing cùng AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 96px",
          background:
            "radial-gradient(ellipse at top left, #0F2544 0%, #0B0F1E 55%, #070A14 100%)",
          color: "#FFFFFF",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Teal accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "14px",
            background: "linear-gradient(180deg, #00C4B0 0%, #00A896 100%)",
          }}
        />

        {/* Soft teal glow */}
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,168,150,0.28) 0%, rgba(0,168,150,0) 65%)",
            display: "flex",
          }}
        />

        {/* Brand row: mascot + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(0,168,150,0.15)",
              border: "1px solid rgba(0,168,150,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}
          >
            🐙
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            Lingona
          </div>
        </div>

        {/* Tagline — split into flex rows so Satori doesn't complain
            about multiple children on a non-flex div */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
            color: "#FFFFFF",
            fontFamily: "Georgia, serif",
          }}
        >
          <div style={{ display: "flex" }}>Luyện IELTS Speaking &amp; Writing</div>
          <div style={{ display: "flex", color: "#00C4B0" }}>cùng AI</div>
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
            marginTop: 28,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Chấm điểm chuẩn IELTS · Phản hồi real-time · Mục tiêu band 6.5+
        </div>

        {/* Footer URL pill */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 24px",
            borderRadius: 999,
            background: "rgba(0,168,150,0.14)",
            border: "1px solid rgba(0,168,150,0.32)",
            color: "#00C4B0",
            fontSize: 26,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          lingona.app
        </div>
      </div>
    ),
    { ...size }
  );
}
