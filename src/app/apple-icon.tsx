import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #1a1a1a, #0b0b0b)",
          borderRadius: 36,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#ff8f70",
            display: "flex",
            fontSize: 92,
            fontStyle: "normal",
            fontWeight: 900,
            letterSpacing: -8,
            transform: "translateY(-4px)",
          }}
        >
          S
        </div>
      </div>
    ),
    size,
  );
}
