import { STORAGE_KEYS } from "@/config/storage-keys";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const isBrowser = () => typeof window !== "undefined";

export const sessionCookie = {
  set() {
    if (!isBrowser()) {
      return;
    }

    document.cookie = `${STORAGE_KEYS.sessionCookie}=1; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;
  },

  clear() {
    if (!isBrowser()) {
      return;
    }

    document.cookie = `${STORAGE_KEYS.sessionCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};
