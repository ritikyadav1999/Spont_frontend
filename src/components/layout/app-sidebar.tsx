"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, X, ChevronsLeft, ChevronsRight, Compass, ChevronUp, LogOut, Bell, Plus, UserRound, CalendarRange, MessageSquare } from "lucide-react";
import { useAuth, useLogout } from "@/features/auth/hooks/use-auth";
import { useUnreadNotificationsCount } from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/my-events", label: "My Events", icon: CalendarRange },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/host", label: "Host Event", icon: Plus },
  { href: "/contact-feedback", label: "Contact & Feedback", icon: MessageSquare },
];

const guestNavigationItems = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/contact-feedback", label: "Contact & Feedback", icon: MessageSquare },
];

type AppSidebarProps = {
  mobile?: boolean;
  isOpen?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
};

const brandSuffix = "aneous";

function AnimatedBrand() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const atFullWord = displayText === brandSuffix;
    const atEmptyWord = displayText.length === 0;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && !atFullWord) {
          setDisplayText(brandSuffix.slice(0, displayText.length + 1));
          return;
        }

        if (!isDeleting && atFullWord) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !atEmptyWord) {
          setDisplayText(brandSuffix.slice(0, displayText.length - 1));
          return;
        }

        setIsDeleting(false);
      },
      !isDeleting && atFullWord ? 1800 : isDeleting && atEmptyWord ? 1100 : isDeleting ? 110 : 190,
    );

    return () => window.clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <span className="inline-flex h-[3.2rem] min-w-[12.8rem] items-baseline overflow-hidden whitespace-nowrap">
      <span className="font-headline text-[2.3rem] font-black tracking-tighter text-primary">Spont</span>
      <span className="ml-0.5 inline-flex items-baseline font-headline text-[2.3rem] font-black tracking-tighter text-on-surface">
        {displayText}
        <span className="ml-0.5 inline-block h-[0.82em] w-[2px] animate-pulse rounded-full bg-primary align-[-0.08em]" />
      </span>
    </span>
  );
}

export function AppSidebar({
  mobile = false,
  isOpen = false,
  collapsed = false,
  onToggleCollapse,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { unreadCount: unreadNotificationsCount } = useUnreadNotificationsCount(isAuthenticated);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.replace("/login");
      },
    });
    setIsProfileOpen(false);
  };

  const handleProfile = () => {
    setIsProfileOpen(false);
    onClose?.();
    router.push("/profile");
  };

  const handleLogoutAndClose = () => {
    onClose?.();
    handleLogout();
  };

  const visibleNavigationItems = isAuthenticated ? navigationItems : guestNavigationItems;

  const navBody = (
    <>
      <div className={cn("mb-7", mobile ? "mb-5 flex items-center justify-between" : "flex items-start justify-between gap-3")}>
        <div className={cn(collapsed && !mobile && "sr-only")}>
          <AnimatedBrand />
        </div>
        {mobile ? (
          <button
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className={cn("flex", mobile ? "flex-col gap-1.5 pb-2" : "flex-1 flex-col gap-1.5")}>
        {visibleNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const className = cn(
            "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-[0.95rem] font-medium transition-all",
            isActive
              ? "bg-surface-container text-primary"
              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            collapsed && !mobile && "h-12 justify-center px-0",
            mobile && "w-full",
          );

          return (
            <Link
              className={className}
              href={item.href}
              key={item.href}
              onClick={mobile ? onClose : undefined}
            >
              <Icon className={cn(collapsed && !mobile ? "h-5 w-5" : "h-4 w-4", isActive && "fill-primary/15")} />
              {collapsed && !mobile ? null : <span className={cn(isActive && "font-bold")}>{item.label}</span>}
              {isAuthenticated && item.href === "/notifications" && unreadNotificationsCount > 0 ? (
                collapsed && !mobile ? (
                  <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,143,112,0.85)]" />
                ) : (
                  <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[0.62rem] font-bold text-on-primary-container">
                    {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                  </span>
                )
              ) : null}
            </Link>
          );
        })}
      </nav>

      {mobile ? null : <div className="my-5 h-px w-full bg-white/8" />}

      {mobile ? (
        !isAuthenticated ? (
          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              href="/login"
              onClick={onClose}
            >
              Login
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary-container px-4 py-2.5 text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.02]"
              href="/register"
              onClick={onClose}
            >
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-auto space-y-2 pt-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              onClick={handleProfile}
              type="button"
            >
              <UserRound className="h-4 w-4" />
              Profile
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
              onClick={handleLogoutAndClose}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </button>
          </div>
        )
      ) : (
        <div className="mt-auto">
          {isAuthenticated ? (
            <div className="relative">
              {isProfileOpen ? (
                <div
                  className={cn(
                    "absolute bottom-16 rounded-2xl bg-surface-container p-3 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.9)]",
                    collapsed ? "left-0 w-[13rem]" : "left-0 w-full",
                  )}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-headline text-sm font-black text-primary">
                      {(user?.name ?? "S").slice(0, 2).toUpperCase()}
                    </div>
                    <p className="truncate text-sm font-bold text-on-surface">{user?.name ?? "Spont User"}</p>
                  </div>

                  <button
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    onClick={handleProfile}
                    type="button"
                  >
                    <UserRound className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? "Signing out..." : "Logout"}
                  </button>
                </div>
              ) : null}

              <button
                aria-expanded={isProfileOpen}
                className={cn(
                  "flex h-12 items-center rounded-full bg-surface-container text-sm font-black text-on-surface transition-colors hover:bg-surface-container-high",
                  collapsed ? "w-12 justify-center" : "w-full justify-between px-4",
                )}
                onClick={() => setIsProfileOpen((prev) => !prev)}
                type="button"
              >
                {collapsed ? (
                  isProfileOpen ? <ChevronUp className="h-5 w-5 text-on-surface-variant" /> : (user?.name ?? "S").slice(0, 2).toUpperCase()
                ) : (
                  <>
                    <span className="truncate text-sm font-bold text-on-surface">Hi, {firstName}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-black text-on-surface">
                      {(user?.name ?? "S").slice(0, 2).toUpperCase()}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : collapsed ? (
            <div className="grid gap-2">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-surface-container text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                href="/login"
              >
                In
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.02]"
                href="/register"
              >
                Up
              </Link>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-2.5 text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.02]"
                href="/register"
              >
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (mobile) {
    return (
      <div
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-0 z-50 bg-black/55 transition-opacity duration-300 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      >
        <div
          className={cn(
            "flex h-full w-[min(86vw,22rem)] flex-col bg-surface-container-low p-4 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.95)] transition-transform duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          {navBody}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-white/8 bg-surface py-5 lg:fixed lg:left-0 lg:top-0 lg:flex lg:flex-col",
        collapsed ? "w-[6.25rem] px-4" : "w-[15.5rem] px-5",
      )}
    >
      {onToggleCollapse ? (
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container text-on-surface-variant shadow-[0_12px_32px_-18px_rgba(0,0,0,0.9)] transition-colors hover:bg-surface-container-high hover:text-on-surface"
          onClick={onToggleCollapse}
          type="button"
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
      ) : null}
      {navBody}
    </aside>
  );
}
