import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type { PushSubscriptionPayload } from "@/features/notifications/types/push-notification.types";

export const pushNotificationsApi = {
  async subscribe(payload: PushSubscriptionPayload) {
    const response = await apiClient.post<ApiEnvelope<unknown> | unknown>(
      API_ROUTES.notifications.pushSubscription,
      payload,
    );

    return unwrapApiResponse(response.data);
  },

  async unsubscribe(endpoint: string) {
    const response = await apiClient.delete<ApiEnvelope<unknown> | unknown>(
      API_ROUTES.notifications.pushSubscription,
      {
        data: { endpoint },
      },
    );

    return unwrapApiResponse(response.data);
  },
};
