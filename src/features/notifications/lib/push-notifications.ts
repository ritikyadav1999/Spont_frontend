import { env } from "@/config/env";
import type { PushSubscriptionPayload } from "@/features/notifications/types/push-notification.types";

export const PUSH_SUBSCRIPTION_MESSAGE_TYPE = "spont:push-notification";

const base64UrlToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const normalized = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);

  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const extractKey = (subscription: PushSubscription, key: Parameters<PushSubscription["getKey"]>[0]) => {
  const value = subscription.getKey(key);

  if (!value) {
    return "";
  }

  return window.btoa(String.fromCharCode(...new Uint8Array(value)));
};

export const getPushApplicationServerKey = () => {
  const key = env.webPushPublicKey;

  if (!key) {
    return null;
  }

  return base64UrlToUint8Array(key);
};

export const toPushSubscriptionPayload = (subscription: PushSubscription): PushSubscriptionPayload => ({
  endpoint: subscription.endpoint,
  expirationTime: subscription.expirationTime,
  keys: {
    p256dh: extractKey(subscription, "p256dh"),
    auth: extractKey(subscription, "auth"),
  },
});
