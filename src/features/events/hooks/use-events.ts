"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api/events.api";

export const eventsQueryKeys = {
  all: ["events"] as const,
  list: () => [...eventsQueryKeys.all, "list"] as const,
  byToken: (token: string) => [...eventsQueryKeys.all, "detail", token] as const,
  myEvents: (hostingPage: number, attendingPage: number) => [...eventsQueryKeys.all, "my-events", hostingPage, attendingPage] as const,
  myPastEvents: () => [...eventsQueryKeys.all, "my-past-events"] as const,
  approvedParticipants: (token: string) => [...eventsQueryKeys.all, "participants", "approved", token] as const,
  pendingParticipants: (token: string) => [...eventsQueryKeys.all, "participants", "pending", token] as const,
};

export const useEvents = () =>
  useQuery({
    queryKey: eventsQueryKeys.list(),
    queryFn: eventsApi.list,
  });

export const useEventByToken = (token: string) =>
  useQuery({
    queryKey: eventsQueryKeys.byToken(token),
    queryFn: () => eventsApi.byToken(token),
    enabled: Boolean(token),
  });

export const useMyEvents = (hostingPage = 0, attendingPage = 0) =>
  useQuery({
    queryKey: eventsQueryKeys.myEvents(hostingPage, attendingPage),
    queryFn: () => eventsApi.myEvents(hostingPage, attendingPage),
  });

export const useMyPastEvents = (enabled = true) =>
  useInfiniteQuery({
    queryKey: eventsQueryKeys.myPastEvents(),
    initialPageParam: 0,
    enabled,
    queryFn: ({ pageParam }) => eventsApi.myPastEvents(pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });

export const useApprovedParticipants = (token: string, enabled = true) =>
  useQuery({
    queryKey: eventsQueryKeys.approvedParticipants(token),
    queryFn: () => eventsApi.approvedParticipants(token),
    enabled: Boolean(token) && enabled,
  });

export const usePendingParticipants = (token: string, enabled = true) =>
  useQuery({
    queryKey: eventsQueryKeys.pendingParticipants(token),
    queryFn: () => eventsApi.pendingParticipants(token),
    enabled: Boolean(token) && enabled,
  });

export const useRequestJoinEvent = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof eventsApi.requestJoin>[1]) => eventsApi.requestJoin(token, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsQueryKeys.approvedParticipants(token) }),
        queryClient.invalidateQueries({ queryKey: eventsQueryKeys.pendingParticipants(token) }),
      ]);
    },
  });
};

export const useParticipantDecision = (token: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participantId,
      decision,
    }: {
      participantId: string;
      decision: Parameters<typeof eventsApi.participantDecision>[2];
    }) => eventsApi.participantDecision(token, participantId, decision),
    onSuccess: async (_, variables) => {
      const removeParticipant = (items: Array<{ participantId?: string; userId?: string }>) =>
        items.filter((participant) => {
          const id = participant.participantId ?? participant.userId;
          return id !== variables.participantId;
        });

      // Keep UI in sync immediately after reject/remove.
      queryClient.setQueryData(eventsQueryKeys.approvedParticipants(token), (current: unknown) =>
        Array.isArray(current) ? removeParticipant(current as Array<{ participantId?: string; userId?: string }>) : current,
      );
      queryClient.setQueryData(eventsQueryKeys.pendingParticipants(token), (current: unknown) =>
        Array.isArray(current) ? removeParticipant(current as Array<{ participantId?: string; userId?: string }>) : current,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsQueryKeys.approvedParticipants(token) }),
        queryClient.invalidateQueries({ queryKey: eventsQueryKeys.pendingParticipants(token) }),
      ]);
    },
  });
};
