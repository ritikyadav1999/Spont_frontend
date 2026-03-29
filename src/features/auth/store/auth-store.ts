"use client";

import { create } from "zustand";
import { tokenStorage } from "@/lib/api/token-storage";
import type { AuthTokens, AuthUser } from "@/features/auth/types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  setLoading: () => void;
  setAuthenticated: (user: AuthUser | null, tokens: AuthTokens) => void;
  setUnauthenticated: () => void;
  hydrateFromStorage: () => AuthTokens | null;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  tokens: null,

  setLoading: () =>
    set({
      status: "loading",
    }),

  setAuthenticated: (user, tokens) =>
    set({
      status: "authenticated",
      user,
      tokens,
    }),

  setUnauthenticated: () =>
    set({
      status: "unauthenticated",
      user: null,
      tokens: null,
    }),

  hydrateFromStorage: () => {
    const storedTokens = tokenStorage.getTokens();
    if (!storedTokens) {
      set({
        tokens: null,
      });
      return null;
    }

    set({
      tokens: storedTokens,
    });
    return storedTokens;
  },
}));
