"use client";

import { useMutation } from "@tanstack/react-query";
import { hostEventApi } from "@/features/host/api/host-event.api";

export const useCreateEvent = () =>
  useMutation({
    mutationFn: hostEventApi.create,
  });
