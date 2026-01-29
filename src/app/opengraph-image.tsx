import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FundSight — Personal Finance Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#2563eb",
            color: "white",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          FS
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          FundSight
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Take control of your financial future
        </div>

        {/* Tech badges */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["Next.js 15", "React 19", "PostgreSQL", "TypeScript"].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  fontSize: 16,
                }}
              >
                {tech}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
