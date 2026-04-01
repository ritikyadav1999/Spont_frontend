import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 80% 18%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(135deg, #161616, #090909)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#ff8f70",
            display: "flex",
            fontSize: 240,
            fontStyle: "normal",
            fontWeight: 900,
            letterSpacing: -18,
            transform: "translateY(-12px)",
          }}
        >
          S
        </div>
      </div>
    ),
    size,
  );
}
