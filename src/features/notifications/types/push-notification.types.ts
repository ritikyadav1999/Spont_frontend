export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type PushNotificationPreferences = {
  enabled: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
};

export type PushNotificationMessage = {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
};
