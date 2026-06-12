import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LeadNest hero preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 20%, rgba(124,58,237,0.30) 0%, transparent 28%), radial-gradient(circle at 82% 18%, rgba(16,185,129,0.26) 0%, transparent 24%), radial-gradient(circle at 50% 85%, rgba(37,99,235,0.24) 0%, transparent 30%), #f8fbff",
          color: "#050816",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -110,
            top: -95,
            height: 420,
            width: 420,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, rgba(124,58,237,0.92) 0%, rgba(124,58,237,0.34) 42%, transparent 75%)",
            filter: "blur(52px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 345,
            top: -70,
            height: 390,
            width: 390,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.92) 0%, rgba(37,99,235,0.30) 40%, transparent 75%)",
            filter: "blur(56px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -65,
            top: 90,
            height: 450,
            width: 450,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, rgba(16,185,129,0.88) 0%, rgba(16,185,129,0.26) 40%, transparent 76%)",
            filter: "blur(58px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: 360,
            height: 520,
            width: 520,
            borderRadius: 999,
            background:
              "radial-gradient(circle at 35% 35%, rgba(124,58,237,0.78) 0%, rgba(124,58,237,0.22) 42%, transparent 78%)",
            filter: "blur(60px)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 90px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              marginBottom: 30,
              fontSize: 27,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            CRM built for focused revenue teams
          </div>
          <div
            style={{
              fontSize: 122,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: 0,
              textShadow: "0 14px 50px rgba(15,23,42,0.20)",
            }}
          >
            LeadNest
          </div>
          <div
            style={{
              marginTop: 38,
              maxWidth: 860,
              fontSize: 38,
              lineHeight: 1.35,
              color: "rgba(5,8,22,0.74)",
            }}
          >
            Capture every lead before the moment passes.
          </div>
          <div
            style={{
              marginTop: 50,
              display: "flex",
              alignItems: "center",
              borderRadius: 16,
              background: "#2563eb",
              color: "white",
              fontSize: 28,
              fontWeight: 700,
              padding: "20px 38px",
              boxShadow: "0 24px 70px rgba(37,99,235,0.30)",
            }}
          >
            Start free
          </div>
        </div>
      </div>
    ),
    size
  );
}
