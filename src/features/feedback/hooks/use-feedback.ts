"use client";

import { useMutation } from "@tanstack/react-query";
import { feedbackApi, type SubmitFeedbackPayload } from "@/features/feedback/api/feedback.api";

export const useSubmitFeedback = () =>
  useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => feedbackApi.submit(payload),
  });
