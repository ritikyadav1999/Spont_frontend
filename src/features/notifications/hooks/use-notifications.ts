"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/features/notifications/api/notifications.api";

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationsQueryKeys.all, "list"] as const,
};

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: notificationsQueryKeys.list(),
    queryFn: notificationsApi.list,
    enabled,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
    },
  });
};
