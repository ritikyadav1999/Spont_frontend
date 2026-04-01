import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Spont",
    short_name: "Spont",
    description: "Real-time social discovery app for discovering, joining, and hosting events on mobile.",
    start_url: "/discover",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    lang: "en",
    categories: ["social", "events", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/pwa-screenshot",
        sizes: "1170x2532",
        type: "image/png",
        label: "Spont mobile event discovery screen",
      },
      {
        src: "/pwa-screenshot-wide",
        sizes: "1600x900",
        type: "image/png",
        form_factor: "wide",
        label: "Spont event discovery experience",
      },
    ],
  };
}
