const DEVELOPMENT_API_BASE_URL = "http://localhost:8080/api";

export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "development"
      ? DEVELOPMENT_API_BASE_URL
      : ""),
  webPushPublicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ?? "",
} as const;
