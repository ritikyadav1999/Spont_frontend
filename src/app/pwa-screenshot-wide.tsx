import { ImageResponse } from "next/og";

export const size = {
  width: 1600,
  height: 900,
};

export const contentType = "image/png";

export default function PwaScreenshotWide() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at top left, rgba(255,143,112,0.22), transparent 26%), linear-gradient(135deg, #141414, #090909)",
          color: "#ffffff",
          display: "flex",
          height: "100%",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: 42,
          }}
        >
          <div
            style={{
              color: "#ff8f70",
              display: "flex",
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            Spont
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 620,
            }}
          >
            <div
              style={{
                color: "#ffb59f",
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Real-time social discovery
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 900,
                letterSpacing: -5,
                lineHeight: 1,
              }}
            >
              Discover, join, and host events in an app-like mobile experience.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 22,
            width: 640,
          }}
        >
          {[0, 1].map((index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(180deg, rgba(27,27,27,0.98), rgba(18,18,18,0.98))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 34,
                display: "flex",
                flex: 1,
                flexDirection: "column",
                padding: 20,
              }}
            >
              <div
                style={{
                  background: index === 0 ? "#2c1f1a" : "#182331",
                  borderRadius: 24,
                  display: "flex",
                  height: 250,
                  width: "100%",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: -1,
                  marginTop: 18,
                }}
              >
                {index === 0 ? "Curated local experiences" : "Fast mobile navigation"}
              </div>
              <div
                style={{
                  color: "#b0b0b0",
                  display: "flex",
                  fontSize: 18,
                  marginTop: 10,
                }}
              >
                {index === 0 ? "Designed for on-the-go discovery." : "Installable PWA with offline fallback."}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
