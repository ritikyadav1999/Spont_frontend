import { ImageResponse } from "next/og";

export const size = {
  width: 1170,
  height: 2532,
};

export const contentType = "image/png";

export default function PwaScreenshot() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,143,112,0.22), transparent 24%), radial-gradient(circle at bottom right, rgba(190,190,255,0.12), transparent 26%), linear-gradient(180deg, #121212, #090909)",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "120px 72px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#ff8f70",
            display: "flex",
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: -4,
          }}
        >
          Spont
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginTop: 72,
          }}
        >
          <div
            style={{
              color: "#ffb59f",
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Discover The Pulse
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              letterSpacing: -8,
              lineHeight: 1,
              maxWidth: 820,
            }}
          >
            Find social events built for mobile discovery.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            marginTop: 96,
          }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                background: "linear-gradient(180deg, rgba(26,26,26,0.96), rgba(18,18,18,0.96))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 42,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                padding: 32,
              }}
            >
              <div
                style={{
                  background: index === 0 ? "#2d1d18" : index === 1 ? "#18202d" : "#1a2217",
                  borderRadius: 30,
                  display: "flex",
                  height: 260,
                  width: "100%",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 44,
                  fontWeight: 800,
                  letterSpacing: -2,
                }}
              >
                {index === 0 ? "Sunset rooftop session" : index === 1 ? "Midnight city social" : "Wellness pop-up meetup"}
              </div>
              <div
                style={{
                  color: "#b3b3b3",
                  display: "flex",
                  fontSize: 28,
                }}
              >
                {index === 0 ? "Starts in 3h" : index === 1 ? "24 going" : "Almost full"}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
