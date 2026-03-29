"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { sessionCookie } from "@/lib/auth/session-cookie";
import { userStorage } from "@/lib/api/user-storage";

type AuthBootstrapProps = {
  children: React.ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const setLoading = useAuthStore((state) => state.setLoading);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  useEffect(() => {
    let isActive = true;

    const initializeAuth = async () => {
      setLoading();
      const storedTokens = hydrateFromStorage();

      if (!storedTokens?.accessToken) {
        if (isActive) {
          sessionCookie.clear();
          setUnauthenticated();
        }
        return;
      }

      const currentUser = userStorage.getUser();
      if (isActive) {
        sessionCookie.set();
        setAuthenticated(currentUser, storedTokens);
      }
    };

    void initializeAuth();

    return () => {
      isActive = false;
    };
  }, [hydrateFromStorage, setAuthenticated, setLoading, setUnauthenticated]);

  return <>{children}</>;
}
