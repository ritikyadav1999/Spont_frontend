"use client";

import { useMutation } from "@tanstack/react-query";
import { hostEventApi } from "@/features/host/api/host-event.api";

export const useCreateEvent = () =>
  useMutation({
    mutationFn: hostEventApi.create,
  });

export const useUpdateEvent = (token: string) =>
  useMutation({
    mutationFn: (payload: Parameters<typeof hostEventApi.update>[1]) => hostEventApi.update(token, payload),
  });
