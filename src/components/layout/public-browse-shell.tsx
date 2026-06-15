"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";

type PublicBrowseShellProps = {
  children: ReactNode;
};

export function PublicBrowseShell({ children }: PublicBrowseShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("spont.sidebar.collapsed") === "true";
  });

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("spont.sidebar.collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Desktop-only sidebar */}
      <AppSidebar collapsed={isCollapsed} onToggleCollapse={handleToggleSidebar} />

      {/* Main content — offset by sidebar on desktop, full-width on mobile */}
      <div className={isCollapsed ? "min-h-screen min-w-0 lg:pl-[6.25rem]" : "min-h-screen min-w-0 lg:pl-[15.5rem]"}>
        <div
          className="flex min-h-screen min-w-0 flex-1 flex-col px-4 pt-0 pb-4 lg:px-8 lg:py-6 xl:px-10"
          style={{ paddingBottom: "calc(3.4rem + env(safe-area-inset-bottom) + 0.5rem)" }}
        >
          {/* Logo + Bell — mobile only */}
          <MobileTopBar />
          <div className="flex-1 pt-3">{children}</div>
        </div>
      </div>

      {/* Mobile-only bottom tab bar */}
      <BottomNavBar />
    </div>
  );
}
