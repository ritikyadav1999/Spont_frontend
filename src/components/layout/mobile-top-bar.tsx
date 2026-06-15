"use client";

import Link from "next/link";
import { Bell, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/use-notifications";

/**
 * Sticky mobile top bar — visible only on mobile (lg:hidden).
 * Desktop navigation is handled by AppSidebar.
 *
 * Layout:
 *   [Location]          [Spont logo]          [🔔 Bell + badge]
 */
export function MobileTopBar() {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useUnreadNotificationsCount(isAuthenticated);

  return (
    <div
      className="sticky top-0 z-40 -mx-4 grid grid-cols-3 items-center bg-[#0e0e0e]/96 px-5 backdrop-blur-2xl lg:hidden"
      style={{
        paddingTop: "calc(0.6rem + env(safe-area-inset-top))",
        paddingBottom: "0.6rem",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.045)",
      }}
    >
      {/* Left: Location */}
      <div className="flex justify-start">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[0.77rem] font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate max-w-[85px] sm:max-w-none">Bangalore, IN</span>
        </button>
      </div>

      {/* Center: Wordmark */}
      <div className="flex justify-center">
        <Link
          href="/discover"
          aria-label="Spont — home"
          className="inline-flex items-baseline"
        >
          <span
            className="font-headline font-black tracking-[-0.065em] text-primary"
            style={{ fontSize: "1.72rem", lineHeight: 1 }}
          >
            Spont
          </span>
        </Link>
      </div>

      {/* Right: Notification bell */}
      <div className="flex justify-end">
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications — ${unreadCount} unread`
              : "Notifications"
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface active:opacity-60"
        >
          <Bell
            className="h-[1.3rem] w-[1.3rem]"
            strokeWidth={2}
          />

          {/* Unread badge — only when authenticated and there are unread notifications */}
          {isAuthenticated && unreadCount > 0 && (
            <span
              className="absolute right-[0.45rem] top-[0.45rem] flex min-w-[1rem] items-center justify-center rounded-full bg-primary px-[0.2rem] text-[0.48rem] font-black leading-none text-[#480d00]"
              style={{
                height: "1rem",
                boxShadow: "0 0 8px rgba(255,143,112,0.75)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
