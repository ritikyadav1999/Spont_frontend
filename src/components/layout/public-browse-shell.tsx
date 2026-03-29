"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

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
      <AppSidebar collapsed={isCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div className={isCollapsed ? "min-h-screen min-w-0 lg:pl-[6.25rem]" : "min-h-screen min-w-0 lg:pl-[15.5rem]"}>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 lg:px-8 lg:py-6 xl:px-10">
          <AppSidebar mobile />
          <div className="mt-4 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
