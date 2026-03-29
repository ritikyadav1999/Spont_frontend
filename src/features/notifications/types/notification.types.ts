export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string | null;
  read: boolean;
  eventToken?: string;
  actorName?: string;
  actionLabel?: string;
  actionHref?: string;
  category: "today" | "yesterday" | "last-week" | "earlier";
}
