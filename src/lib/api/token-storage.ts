import { STORAGE_KEYS } from "@/config/storage-keys";
import type { AuthTokens } from "@/features/auth/types/auth.types";
import { sessionCookie } from "@/lib/auth/session-cookie";

const isBrowser = () => typeof window !== "undefined";

export const tokenStorage = {
  getTokens(): AuthTokens | null {
    if (!isBrowser()) {
      return null;
    }

    const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken);

    if (!accessToken) {
      return null;
    }

    return { accessToken };
  },

  setTokens(tokens: AuthTokens) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);

    sessionCookie.set();
  },

  clearTokens() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    sessionCookie.clear();
  },
};
