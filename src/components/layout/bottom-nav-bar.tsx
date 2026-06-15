"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, Compass, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/my-events", icon: CalendarRange, label: "Events" },
  { href: "/host", icon: Plus, label: "Host" },
  { href: "/profile", icon: UserRound, label: "Me" },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    /* lg:hidden — desktop uses the sidebar */
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Frosted glass bar */}
      <div
        className="border-t border-white/[0.08] bg-[#0e0e0e]/94 backdrop-blur-2xl"
        style={{ WebkitBackdropFilter: "blur(24px)" }}
      >
        <div className="flex h-[3.4rem] items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/discover" && pathname.startsWith(item.href + "/"));

            /* ── Regular nav item ── */
            return (
              <Link
                aria-label={item.label}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-opacity duration-100 active:opacity-60"
                href={item.href}
                key={item.href}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-[1.3rem] w-[1.3rem] transition-colors duration-100",
                      isActive ? "text-primary" : "text-on-surface-variant",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[0.58rem] font-semibold leading-none tracking-wide transition-colors duration-100",
                    isActive ? "text-primary" : "text-on-surface-variant/70",
                  )}
                >
                  {item.label}
                </span>
                {/* Active dot */}
                {isActive && (
                  <span className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
