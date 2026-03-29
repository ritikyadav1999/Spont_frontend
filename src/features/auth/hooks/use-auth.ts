"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { tokenStorage } from "@/lib/api/token-storage";
import { userStorage } from "@/lib/api/user-storage";

export const useAuth = () => {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);

  return {
    status,
    user,
    tokens,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};

export const useLogin = () => {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      tokenStorage.setTokens({
        accessToken: session.accessToken,
      });
      userStorage.setUser(session.user);

      setAuthenticated(session.user, {
        accessToken: session.accessToken,
      });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useLogout = () => {
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      tokenStorage.clearTokens();
      userStorage.clearUser();
      setUnauthenticated();
    },
  });
};
