"use client";

import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/features/profile/api/profile.api";

export const profileQueryKeys = {
  all: ["profile"] as const,
  byId: (userId: string) => [...profileQueryKeys.all, userId] as const,
};

export const usePublicProfile = (userId: string) =>
  useQuery({
    queryKey: profileQueryKeys.byId(userId),
    queryFn: () => profileApi.byId(userId),
    enabled: Boolean(userId),
  });
