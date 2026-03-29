"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("spont.sidebar.collapsed") === "true";
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("spont.sidebar.collapsed", String(next));
      return next;
    });
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AppSidebar collapsed={isCollapsed} onToggleCollapse={handleToggleSidebar} />
      <div className={isCollapsed ? "min-h-screen min-w-0 lg:pl-[6.25rem]" : "min-h-screen min-w-0 lg:pl-[15.5rem]"}>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 lg:px-8 lg:py-6 xl:px-10">
          <AppSidebar mobile />
          <div className="mt-4 flex-1 lg:mt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
