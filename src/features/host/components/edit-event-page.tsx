"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useEventByToken } from "@/features/events/hooks/use-events";
import { HostEventPage } from "@/features/host/components/host-event-page";
import { getApiErrorMessage } from "@/lib/utils/api-response";

const decodeJwtSubject = (accessToken?: string | null) => {
  if (!accessToken) {
    return null;
  }

  const [, payload] = accessToken.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(window.atob(paddedPayload)) as { sub?: string };
    return decodedPayload.sub ?? null;
  } catch {
    return null;
  }
};

export function EditEventPage({ token }: { token: string }) {
  const eventQuery = useEventByToken(token);
  const { user, tokens } = useAuth();
  const currentUserId = useMemo(() => user?.id ?? decodeJwtSubject(tokens?.accessToken), [tokens?.accessToken, user?.id]);

  if (eventQuery.isLoading) {
    return <div className="h-[36rem] animate-pulse rounded-[1.75rem] bg-surface-container-low" />;
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
        {eventQuery.isError
          ? getApiErrorMessage(eventQuery.error, "Unable to load event details for editing.")
          : "Event not found for editing."}
      </div>
    );
  }

  if (!currentUserId || currentUserId !== eventQuery.data.creator.userId) {
    return (
      <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
        Only the host can edit this event right now.
      </div>
    );
  }

  return <HostEventPage initialEvent={eventQuery.data} mode="edit" token={token} />;
}
