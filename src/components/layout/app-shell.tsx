"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileSidebarOpen]);

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
      <AppSidebar isOpen={isMobileSidebarOpen} mobile onClose={() => setIsMobileSidebarOpen(false)} />
      <div className={isCollapsed ? "min-h-screen min-w-0 lg:pl-[6.25rem]" : "min-h-screen min-w-0 lg:pl-[15.5rem]"}>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 lg:px-8 lg:py-6 xl:px-10">
          <div className="sticky top-0 z-40 -mx-4 mb-4 border-b border-white/8 bg-background/92 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link
                className="inline-flex items-baseline whitespace-nowrap"
                href="/discover"
              >
                <span className="font-headline text-[1.85rem] font-black tracking-tighter text-primary">Spont</span>
                <span className="ml-0.5 font-headline text-[1.85rem] font-black tracking-tighter text-on-surface">aneous</span>
              </Link>
              <button
                aria-expanded={isMobileSidebarOpen}
                aria-label="Open menu"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
                onClick={() => setIsMobileSidebarOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
