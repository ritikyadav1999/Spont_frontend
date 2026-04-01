"use client";

import { ToastViewport } from "@/components/ui/toast-viewport";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AuthBootstrap } from "@/providers/auth-bootstrap";
import { QueryProvider } from "@/providers/query-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthBootstrap>
        <ServiceWorkerRegister />
        {children}
        <InstallPrompt />
        <ToastViewport />
      </AuthBootstrap>
    </QueryProvider>
  );
}
