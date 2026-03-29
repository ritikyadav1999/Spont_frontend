"use client";

import { AuthBootstrap } from "@/providers/auth-bootstrap";
import { QueryProvider } from "@/providers/query-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthBootstrap>{children}</AuthBootstrap>
    </QueryProvider>
  );
}

