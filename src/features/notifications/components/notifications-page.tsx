"use client";

import { CheckCheck, Clock3, ExternalLink, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useMarkNotificationRead, useNotifications } from "@/features/notifications/hooks/use-notifications";
import type { NotificationItem } from "@/features/notifications/types/notification.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

const sectionLabels: Record<NotificationItem["category"], string> = {
  today: "Today",
  yesterday: "Yesterday",
  "last-week": "Last Week",
  earlier: "Earlier",
};

const iconByTitle = (notification: NotificationItem) => {
  const copy = `${notification.title} ${notification.message}`.toLowerCase();

  if (copy.includes("joined") || copy.includes("participant")) {
    return <UserPlus className="h-4 w-4" />;
  }

  if (copy.includes("comment") || copy.includes("message")) {
    return <MessageCircle className="h-4 w-4" />;
  }

  if (copy.includes("friend")) {
    return <UserPlus className="h-4 w-4" />;
  }

  return <Sparkles className="h-4 w-4" />;
};

const formatTime = (value: string | null) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 60) {
    return `${Math.max(1, minutes)} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

function NotificationRow({
  notification,
  onMarkRead,
  onOpenEvent,
  isPending,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onOpenEvent: (token: string) => void;
  isPending: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-5 rounded-[1.35rem] px-6 py-5 transition-colors",
        notification.read ? "bg-surface-container-low hover:bg-surface-container" : "bg-surface-container hover:bg-surface-container-high",
      )}
    >
      {!notification.read ? (
        <div className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_15px_rgba(255,143,112,0.45)]" />
      ) : null}

      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
          notification.read ? "bg-surface-container-high text-on-surface-variant" : "bg-primary/12 text-primary",
        )}
      >
        {iconByTitle(notification)}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("leading-relaxed", notification.read ? "text-on-surface-variant" : "text-on-surface")}>
          {notification.actorName ? <span className="font-bold text-primary">{notification.actorName}</span> : null}
          {notification.actorName ? " " : null}
          <span className="font-semibold text-on-surface">{notification.title}</span>
          {notification.message ? <span className="text-on-surface-variant"> {notification.message}</span> : null}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
          <Clock3 className="h-3 w-3" />
          <span>{formatTime(notification.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {notification.eventToken ? (
          <button
            className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            onClick={() => onOpenEvent(notification.eventToken as string)}
            type="button"
          >
            Event
          </button>
        ) : null}
        <button
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-primary hover:text-on-primary-container disabled:opacity-60"
          disabled={notification.read || isPending}
          onClick={() => onMarkRead(notification.id)}
          type="button"
        >
          {notification.read ? "Read" : isPending ? "Saving..." : "Mark Read"}
        </button>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const router = useRouter();
  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const groupedNotifications = useMemo(() => {
    return {
      today: notifications.filter((item) => item.category === "today"),
      yesterday: notifications.filter((item) => item.category === "yesterday"),
      "last-week": notifications.filter((item) => item.category === "last-week"),
      earlier: notifications.filter((item) => item.category === "earlier"),
    };
  }, [notifications]);

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };
  const handleOpenEvent = (token: string) => {
    router.push(`/events/${token}`);
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter((item) => !item.read);

    for (const notification of unreadItems) {
      await markReadMutation.mutateAsync(notification.id);
    }
  };

  return (
    <div className="ui-page-shell ui-page-shell--narrow">
      <AppPageHeader
        actions={
          <button
            className="inline-flex items-center gap-2 text-sm font-semibold text-tertiary transition-colors hover:text-primary disabled:opacity-50"
            disabled={!unreadCount || markReadMutation.isPending}
            onClick={handleMarkAllRead}
            type="button"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        }
        description={
          <span className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
              {unreadCount} Unread
            </span>
            <span className="text-sm text-on-surface-variant">Stay synchronized with your circle.</span>
          </span>
        }
        title="Notifications"
      />

      {notificationsQuery.isLoading ? (
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div className="space-y-4" key={sectionIndex}>
              <div className="h-4 w-40 animate-pulse rounded bg-surface-container" />
              <div className="h-28 animate-pulse rounded-[1.35rem] bg-surface-container-low" />
            </div>
          ))}
        </div>
      ) : null}

      {notificationsQuery.isError ? (
        <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
          {getApiErrorMessage(notificationsQuery.error, "Unable to load notifications.")}
        </div>
      ) : null}

      {!notificationsQuery.isLoading && !notificationsQuery.isError ? (
        <>
          <div className="space-y-14">
            {(Object.keys(groupedNotifications) as Array<keyof typeof groupedNotifications>).map((groupKey) => {
              const items = groupedNotifications[groupKey];

              if (!items.length) {
                return null;
              }

              return (
                <section key={groupKey}>
                  <h2 className="mb-7 flex items-center gap-4 text-[0.72rem] font-black uppercase tracking-[0.28em] text-on-surface-variant">
                    {sectionLabels[groupKey]}
                    <div className="h-px flex-1 bg-white/8" />
                  </h2>
                  <div className="grid gap-4">
                    {items.map((notification) => (
                      <NotificationRow
                        isPending={markReadMutation.isPending}
                        key={notification.id}
                        notification={notification}
                        onMarkRead={handleMarkRead}
                        onOpenEvent={handleOpenEvent}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <footer className="mt-16 flex flex-col items-center py-12">
            <p className="mb-6 text-sm text-on-surface-variant">You&apos;re all caught up for now.</p>
            <button
              className="rounded-xl border border-white/10 bg-surface-container-high px-8 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              View notification history
              <ExternalLink className="ml-2 inline h-4 w-4" />
            </button>
          </footer>
        </>
      ) : null}

      {markReadMutation.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {getApiErrorMessage(markReadMutation.error, "Unable to update notifications.")}
        </div>
      ) : null}
    </div>
  );
}
