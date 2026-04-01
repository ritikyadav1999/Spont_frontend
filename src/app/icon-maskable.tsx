import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function IconMaskable() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 78% 20%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(135deg, #171717, #090909)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(255,143,112,0.16), rgba(255,120,82,0.08))",
            border: "2px solid rgba(255,255,255,0.06)",
            borderRadius: 132,
            display: "flex",
            height: 320,
            justifyContent: "center",
            width: 320,
          }}
        >
          <div
            style={{
              color: "#ff8f70",
              display: "flex",
              fontSize: 184,
              fontStyle: "normal",
              fontWeight: 900,
              letterSpacing: -14,
              transform: "translateY(-8px)",
            }}
          >
            S
          </div>
        </div>
      </div>
    ),
    size,
  );
}
