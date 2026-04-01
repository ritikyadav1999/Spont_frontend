"use client";

import { useEffect } from "react";
import { toast } from "@/lib/toast/toast-store";

const SERVICE_WORKER_URL = "/sw.js";

const isLocalhost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (window.location.protocol !== "https:" && !isLocalhost(window.location.hostname)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);

        registration.addEventListener("updatefound", () => {
          const worker = registration?.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              toast.info("A fresh version of Spont is ready. Close and reopen the app to update.");
            }
          });
        });
      } catch {
        // Ignore registration failures to avoid blocking app startup.
      }
    };

    void registerServiceWorker();

    return () => {
      registration?.update().catch(() => undefined);
    };
  }, []);

  return null;
}
