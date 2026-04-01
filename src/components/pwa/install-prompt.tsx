"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "spont.pwa.install.dismissed";

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsVisible(false);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }

    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    setIsInstalling(true);

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        setIsVisible(false);
        setInstallEvent(null);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isVisible || !installEvent) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[110] flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,143,112,0.14),rgba(16,16,16,0.94))] p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.96)] backdrop-blur-xl">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-primary/80">Install Spont</p>
        <h2 className="mt-2 font-headline text-[1.25rem] font-extrabold tracking-[-0.03em] text-on-surface">
          Add the app to your home screen
        </h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Faster re-entry, app-like navigation, and a cleaner full-screen mobile experience for your users.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex items-center justify-center rounded-full bg-primary-container px-5 py-3 text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.01] disabled:opacity-60"
            disabled={isInstalling}
            onClick={() => void handleInstall()}
            type="button"
          >
            {isInstalling ? "Preparing..." : "Install App"}
          </button>
          <button
            className="inline-flex items-center justify-center rounded-full bg-surface-container px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={handleDismiss}
            type="button"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
