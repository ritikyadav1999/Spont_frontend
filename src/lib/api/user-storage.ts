import { STORAGE_KEYS } from "@/config/storage-keys";
import type { AuthUser } from "@/features/auth/types/auth.types";

const isBrowser = () => typeof window !== "undefined";

export const userStorage = {
  getUser(): AuthUser | null {
    if (!isBrowser()) {
      return null;
    }

    const rawUser = window.localStorage.getItem(STORAGE_KEYS.authUser);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.authUser);
      return null;
    }
  },

  setUser(user: AuthUser) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
  },

  clearUser() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.authUser);
  },
};

