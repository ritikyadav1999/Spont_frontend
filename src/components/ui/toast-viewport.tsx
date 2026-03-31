"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useToastStore, type ToastItem } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils/cn";

const AUTO_DISMISS_MS = 3200;

const toastToneStyles: Record<ToastItem["tone"], { icon: typeof CheckCircle2; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-400/20 bg-emerald-500/12 text-emerald-100",
  },
  error: {
    icon: XCircle,
    className: "border-rose-400/20 bg-rose-500/12 text-rose-100",
  },
  info: {
    icon: Info,
    className: "border-white/10 bg-surface-container-high text-on-surface",
  },
};

function ToastCard({ id, title, tone }: ToastItem) {
  const dismissToast = useToastStore((state) => state.dismissToast);
  const toneStyle = toastToneStyles[tone];
  const Icon = toneStyle.icon;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
    }, AUTO_DISMISS_MS);

    return () => window.clearTimeout(timeoutId);
  }, [dismissToast, id]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl",
        "animate-in slide-in-from-top-3 fade-in duration-300",
        toneStyle.className,
      )}
      role="status"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <button
        aria-label="Dismiss notification"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10"
        onClick={() => dismissToast(id)}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3">
        {toasts.map((toast) => (
          <ToastCard {...toast} key={toast.id} />
        ))}
      </div>
    </div>
  );
}
