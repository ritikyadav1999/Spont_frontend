"use client";

import { BellRing } from "lucide-react";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";
import { cn } from "@/lib/utils/cn";

const permissionLabel: Record<NotificationPermission | "unsupported", string> = {
  granted: "Allowed",
  denied: "Blocked",
  default: "Not requested",
  unsupported: "Unsupported",
};

export function PushNotificationSettingsCard() {
  const {
    isSupported,
    isBootstrapping,
    isWorking,
    preferences,
    enablePush,
    disablePush,
  } = usePushNotifications();

  const isEnabled = preferences.enabled;

  return (
    <section className="rounded-[1.6rem] bg-surface-container p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
            <BellRing className="h-3.5 w-3.5" />
            Push Notifications
          </div>
          <h3 className="mt-4 font-headline text-[1.5rem] font-extrabold tracking-[-0.04em] text-on-surface">
            Turn on core mobile push delivery
          </h3>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">
            This only handles the basics: permission, device subscription, backend registration, and showing the push on the device.
          </p>
        </div>

        <button
          className={cn(
            "inline-flex min-w-[10rem] items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-colors disabled:opacity-60",
            isEnabled
              ? "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              : "bg-primary-container text-on-primary-container hover:bg-primary",
          )}
          disabled={!isSupported || isBootstrapping || isWorking}
          onClick={() => void (isEnabled ? disablePush() : enablePush())}
          type="button"
        >
          {isBootstrapping ? "Checking..." : isWorking ? "Saving..." : isEnabled ? "Disable Push" : "Enable Push"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-high p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Status</p>
          <p className="mt-2 text-sm font-semibold text-on-surface">
            {!isSupported
              ? "This browser does not support web push."
              : isEnabled
                ? "Push is enabled for this device."
                : "Push is not enabled for this device."}
          </p>
        </div>

        <div className="rounded-2xl bg-surface-container-high p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Permission</p>
          <p className="mt-2 text-sm font-semibold text-on-surface">{permissionLabel[preferences.permission]}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface">Backend requirement</p>
        <p className="mt-2 leading-6">
          The frontend sends the browser subscription to
          <span className="mx-1 font-mono text-on-surface">/notifications/push/subscription</span>
          and expects the backend to store it and send the actual Web Push later.
        </p>
      </div>
    </section>
  );
}
