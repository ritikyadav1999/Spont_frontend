import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import type { ApiEnvelope } from "@/types/api.types";

export type SubmitFeedbackPayload = {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
};

type FeedbackResponse = {
  data: null;
  message: string;
  success: boolean;
};

export const feedbackApi = {
  async submit(payload: SubmitFeedbackPayload): Promise<string> {
    const response = await apiClient.post<ApiEnvelope<null> | FeedbackResponse>(API_ROUTES.feedback.submit, payload);
    const responseData = response.data as FeedbackResponse;

    return responseData.message ?? "Feedback submitted";
  },
};
