import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type { NotificationItem } from "@/features/notifications/types/notification.types";

type RawNotification = {
  id?: string | number;
  notificationId?: string | number;
  title?: string;
  message?: string;
  content?: string;
  body?: string;
  text?: string;
  createdAt?: string;
  createdOn?: string;
  timestamp?: string;
  read?: boolean;
  isRead?: boolean;
  actorName?: string;
  actor?: { name?: string };
  type?: string;
  event_token?: string;
  eventToken?: string;
};

type RawNotificationListPayload =
  | RawNotification[]
  | {
      content?: RawNotification[];
      notifications?: RawNotification[];
      items?: RawNotification[];
      data?: RawNotification[];
    };

const getCategory = (createdAt: string | null): NotificationItem["category"] => {
  if (!createdAt) {
    return "earlier";
  }

  const date = new Date(createdAt);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return "today";
  }

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "yesterday";
  }

  if (diffDays <= 7) {
    return "last-week";
  }

  return "earlier";
};

const normalizeNotification = (item: RawNotification, index: number): NotificationItem => {
  const id = String(item.id ?? item.notificationId ?? `notification-${index}`);
  const message = item.message ?? item.content ?? item.body ?? item.text ?? "You have a new notification.";
  const title = item.title ?? "Update";
  const createdAt = item.createdAt ?? item.createdOn ?? item.timestamp ?? null;
  const actorName = item.actorName ?? item.actor?.name;

  return {
    id,
    title,
    message,
    createdAt,
    read: item.read ?? item.isRead ?? false,
    eventToken: item.event_token ?? item.eventToken,
    actorName,
    actionLabel: "View",
    category: getCategory(createdAt),
  };
};

export const notificationsApi = {
  async list(): Promise<NotificationItem[]> {
    const response = await apiClient.get<ApiEnvelope<RawNotificationListPayload> | RawNotificationListPayload>(
      API_ROUTES.notifications.list,
    );
    const payload = unwrapApiResponse(response.data);

    const items = Array.isArray(payload)
      ? payload
      : payload.content ?? payload.notifications ?? payload.items ?? payload.data ?? [];

    return items.map(normalizeNotification);
  },

  async markRead(id: string) {
    const response = await apiClient.post<ApiEnvelope<unknown> | unknown>(API_ROUTES.notifications.markRead(id));
    return unwrapApiResponse(response.data);
  },
};
