"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { pushNotificationsApi } from "@/features/notifications/api/push-notifications.api";
import { getPushApplicationServerKey, toPushSubscriptionPayload } from "@/features/notifications/lib/push-notifications";
import type { PushNotificationPreferences } from "@/features/notifications/types/push-notification.types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "@/lib/toast/toast-store";

const isPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

export const usePushNotifications = () => {
  const { isAuthenticated } = useAuth();
  const isSupported = isPushSupported();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    isSupported ? Notification.permission : "unsupported",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const syncSubscriptionMutation = useMutation({
    mutationFn: pushNotificationsApi.subscribe,
  });

  const removeSubscriptionMutation = useMutation({
    mutationFn: pushNotificationsApi.unsubscribe,
  });

  useEffect(() => {
    if (!isSupported || !isAuthenticated) {
      setIsSubscribed(false);
      setIsBootstrapping(false);
      return;
    }

    let isActive = true;

    const loadSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (isActive) {
          setPermission(Notification.permission);
          setIsSubscribed(Boolean(subscription));
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    void loadSubscription();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isSupported]);

  const enablePush = async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported on this device.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Login is required before enabling push notifications.");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      toast.error("Notification permission was not granted.");
      return;
    }

    const applicationServerKey = getPushApplicationServerKey();

    if (!applicationServerKey) {
      toast.error("Push notifications are not configured yet.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();
    const subscription =
      currentSubscription ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }));

    await syncSubscriptionMutation.mutateAsync(toPushSubscriptionPayload(subscription));
    setIsSubscribed(true);
    toast.success("Push notifications enabled.");
  };

  const disablePush = async () => {
    if (!isSupported) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      setIsSubscribed(false);
      return;
    }

    await removeSubscriptionMutation.mutateAsync(subscription.endpoint);
    await subscription.unsubscribe();
    setIsSubscribed(false);
    toast.success("Push notifications disabled.");
  };

  const preferences: PushNotificationPreferences = {
    enabled: permission === "granted" && isSubscribed,
    permission,
    subscribed: isSubscribed,
  };

  return {
    isSupported,
    isBootstrapping,
    isWorking: syncSubscriptionMutation.isPending || removeSubscriptionMutation.isPending,
    preferences,
    enablePush,
    disablePush,
  };
};
