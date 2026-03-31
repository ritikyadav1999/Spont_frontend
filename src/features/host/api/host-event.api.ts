import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type { CreateEventPayload } from "@/features/host/types/host-event.types";

export const hostEventApi = {
  async create(payload: CreateEventPayload) {
    const response = await apiClient.post<ApiEnvelope<unknown> | unknown>(API_ROUTES.events.create, payload);
    return unwrapApiResponse(response.data);
  },

  async update(token: string, payload: CreateEventPayload) {
    const response = await apiClient.put<ApiEnvelope<string> | string>(API_ROUTES.events.edit(token), payload);
    return unwrapApiResponse(response.data);
  },
};
