"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin, PencilLine, Share2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  useApprovedParticipants,
  useEventByToken,
  useParticipantDecision,
  usePendingParticipants,
  useRequestJoinEvent,
} from "@/features/events/hooks/use-events";
import type { EventParticipant, EventParticipantDecision } from "@/features/events/types/event.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";

const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatTimeLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(startDate);
  const startTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(startDate);
  const endTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(endDate);

  return `${date} • ${startTime} - ${endTime}`;
};

const timeAgo = (value: string | null, currentTime: number) => {
  if (!value) {
    return "Approved recently";
  }

  const joinedAt = new Date(value).getTime();
  const diff = Math.max(0, currentTime - joinedAt);
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    return "Joined recently";
  }

  if (hours < 24) {
    return `Joined ${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `Joined ${days}d ago`;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

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

export function EventDetailsPage({ token }: { token: string }) {
  const router = useRouter();
  const { user, isAuthenticated, tokens } = useAuth();
  const [currentTime] = useState(() => Date.now());
  const eventQuery = useEventByToken(token);
  const event = eventQuery.data;
  const isPastEvent = Boolean(event && (event.status === "COMPLETED" || new Date(event.endTime).getTime() < currentTime));
  const approvedQuery = useApprovedParticipants(token);
  const pendingQuery = usePendingParticipants(token, !isPastEvent);
  const requestJoinMutation = useRequestJoinEvent(token);
  const participantDecisionMutation = useParticipantDecision(token);
  const [joinState, setJoinState] = useState<"idle" | "joined" | "requested">("idle");
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const approvedParticipants = useMemo(() => approvedQuery.data ?? [], [approvedQuery.data]);
  const pendingParticipants = useMemo(() => pendingQuery.data ?? [], [pendingQuery.data]);

  const host = approvedParticipants.find((participant) => participant.role === "HOST")?.name ?? event?.creator.name ?? "Unknown Host";

  const coHosts = useMemo(
    () => approvedParticipants.filter((participant) => participant.role === "CO_HOST" || participant.role === "COHOST"),
    [approvedParticipants],
  );

  const confirmedMembers = useMemo(
    () =>
      approvedParticipants.filter(
        (participant) => participant.role !== "HOST" && participant.role !== "CO_HOST" && participant.role !== "COHOST",
      ),
    [approvedParticipants],
  );

  const currentUserId = user?.id ?? decodeJwtSubject(tokens?.accessToken);
  const isApprovedParticipant = Boolean(
    currentUserId && approvedParticipants.some((participant) => participant.userId === currentUserId),
  );
  const isPendingParticipant = Boolean(
    currentUserId && pendingParticipants.some((participant) => participant.userId === currentUserId),
  );
  const isHostView = Boolean(
    currentUserId &&
      ((event?.creator.userId && currentUserId === event.creator.userId) ||
        approvedParticipants.some((participant) => participant.userId === currentUserId && participant.role === "HOST")),
  );
  const isCoHostView = Boolean(
    currentUserId &&
      approvedParticipants.some(
        (participant) =>
          participant.userId === currentUserId && (participant.role === "CO_HOST" || participant.role === "COHOST"),
      ),
  );
  const canModeratePending = (isHostView || isCoHostView) && event?.status === "SCHEDULED" && !isPastEvent;
  const canModerateApproved = canModeratePending;
  const canJoin = Boolean(user?.name && user?.gender && user?.phone);
  const shouldShowEditButton = !isPastEvent && isHostView;
  const shouldShowJoinButton =
    !isPastEvent &&
    !shouldShowEditButton &&
    !isApprovedParticipant &&
    !isPendingParticipant &&
    joinState === "idle";
  const confirmedCount = confirmedMembers.length + 1;
  const maxParticipants = event?.maxParticipants ?? 1;
  const capacityPercent = Math.min(100, Math.round((confirmedCount / maxParticipants) * 100));

  const mapUrl = useMemo(() => {
    if (!event) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.93%2C77.65%2C13.03&layer=mapnik";
    }

    return `https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude - 0.02}%2C${event.latitude - 0.02}%2C${event.longitude + 0.02}%2C${event.latitude + 0.02}&layer=mapnik&marker=${event.latitude}%2C${event.longitude}`;
  }, [event]);

  const googleMapsUrl = useMemo(() => {
    if (!event) {
      return "https://maps.google.com";
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.latitude},${event.longitude}`)}`;
  }, [event]);

  const handleJoin = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!event || !user?.name || !user.gender || !user.phone) {
      return;
    }

    requestJoinMutation.mutate(
      {
        name: user.name,
        gender: user.gender,
        phone: user.phone,
      },
      {
        onSuccess: () => {
          setJoinState(event.joinMode === "OPEN" ? "joined" : "requested");
        },
      },
    );
  };

  const handleParticipantDecision = (participant: EventParticipant, decision: EventParticipantDecision) => {
    const participantId = participant.participantId ?? participant.userId;
    if (!participantId) {
      return;
    }

    participantDecisionMutation.mutate({
      participantId,
      decision,
    });
  };

  const joinButtonLabel =
    !isAuthenticated
      ? "Sign In to Join"
      : event?.joinMode === "APPROVAL_REQUIRED"
        ? "Join Request"
        : "Join Event";

  const handleShare = async () => {
    if (!event) {
      return;
    }

    const shareUrl = `${window.location.origin}/events/${token}`;
    const shareText = `Join ${event.title} on Spont with invite token ${token}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 1800);
      } catch {
        // Ignore clipboard/share failures silently.
      }
    }
  };

  if (eventQuery.isLoading) {
    return <div className="h-[36rem] animate-pulse rounded-[1.75rem] bg-surface-container-low" />;
  }

  if (eventQuery.isError || !event) {
    return (
      <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
        {eventQuery.isError
          ? getApiErrorMessage(eventQuery.error, "Unable to load event details.")
          : "Event not found for the provided token."}
      </div>
    );
  }

  return (
    <div className="ui-page-shell pb-24 lg:pb-12 max-w-5xl mx-auto">
      {/* Sticky Bottom Bar for Mobile Actions */}
      <div className="fixed bottom-[calc(3.4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4 py-3 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-white/[0.04] lg:hidden">
        <div className="flex gap-2">
          {shouldShowJoinButton && (
            <button
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-xs font-bold text-[#480d00] transition-transform active:scale-[0.98] disabled:opacity-50"
              disabled={(isAuthenticated && !canJoin) || requestJoinMutation.isPending}
              onClick={handleJoin}
              type="button"
            >
              {requestJoinMutation.isPending ? "Submitting..." : joinButtonLabel}
            </button>
          )}
          {shouldShowEditButton && (
            <Link
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high py-3.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              href={`/events/${token}/edit`}
            >
              <PencilLine className="h-4 w-4" />
              Edit Event
            </Link>
          )}
          <button
            className={cn(
              "inline-flex items-center justify-center rounded-2xl bg-surface-container-high px-4 py-3.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-highest",
              (shouldShowJoinButton || shouldShowEditButton) ? "w-12 shrink-0" : "flex-1"
            )}
            onClick={handleShare}
            type="button"
            aria-label="Share Link"
          >
            <Share2 className="h-4 w-4" />
            {!(shouldShowJoinButton || shouldShowEditButton) && (
              <span className="ml-2">
                {shareState === "copied" ? "Copied" : "Share"}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hero Cover Card */}
          <section className="relative h-[15rem] sm:h-[18rem] md:h-[22rem] overflow-hidden rounded-3xl bg-surface-container-low border border-white/[0.04]">
            {/* Visual background using premium styling */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,143,112,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(123,134,255,0.15),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(120,214,191,0.12),transparent_40%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
            
            {/* Overlaid badges */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#0e0e0e]/60 backdrop-blur-md border border-white/[0.08] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-primary">
                {event.joinMode === "APPROVAL_REQUIRED" ? "Approval Required" : "Open Entry"}
              </span>
              <span className="rounded-full bg-[#0e0e0e]/60 backdrop-blur-md border border-white/[0.08] px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-tertiary">
                {event.visibility}
              </span>
              {isPastEvent && (
                <span className="rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/30 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-rose-400">
                  Ended
                </span>
              )}
            </div>
          </section>

          {/* Title & Info Header */}
          <div className="space-y-2.5">
            <h1 className="font-headline text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-4xl md:text-5xl">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span>Hosted by <span className="font-semibold text-on-surface">{host}</span></span>
              <span>•</span>
              <span>{formatDateLabel(event.startTime)}</span>
            </div>
          </div>

          {/* Dynamic alerts */}
          <div className="space-y-3">
            {!isAuthenticated && !isPastEvent && (
              <div className="rounded-2xl border border-white/[0.05] bg-primary/5 px-4 py-3.5 text-xs text-primary/90 flex gap-3 items-center">
                <span className="text-base">✨</span>
                <span>Sign in or create an account to request your spot and see updates.</span>
              </div>
            )}
            {isAuthenticated && isPendingParticipant && !isPastEvent && (
              <div className="rounded-2xl border border-white/[0.05] bg-tertiary/5 px-4 py-3.5 text-xs text-tertiary/90 flex gap-3 items-center">
                <span className="text-base">⏳</span>
                <span>Your join request is pending approval from the host.</span>
              </div>
            )}
            {isAuthenticated && isApprovedParticipant && !isHostView && !isCoHostView && !isPastEvent && (
              <div className="rounded-2xl border border-white/[0.05] bg-emerald-500/5 px-4 py-3.5 text-xs text-emerald-400 flex gap-3 items-center">
                <span className="text-base">✅</span>
                <span>You are on the guest list for this event!</span>
              </div>
            )}
            {isAuthenticated && shouldShowJoinButton && !canJoin && !isPastEvent && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 text-xs text-amber-300 flex gap-3 items-center">
                <span className="text-base">⚠️</span>
                <span>
                  Please complete your profile with <span className="underline font-semibold">name, gender, and phone</span> to join.
                </span>
              </div>
            )}
          </div>

          {/* Details Card */}
          <section className="rounded-3xl bg-surface-container/60 border border-white/[0.04] p-5 space-y-4" title={formatDateRange(event.startTime, event.endTime)}>
            {/* Date and Time Row */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {formatDateLabel(event.startTime)}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {formatTimeLabel(event.startTime)} - {formatTimeLabel(event.endTime)}
                </p>
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  {event.locationName.split(",")[0]}
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-1">
                  {event.locationName}
                </p>
              </div>
            </div>

            {/* Capacity / Guest Count Row */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-on-surface-variant">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-on-surface">
                    Guests
                  </p>
                  <p className="text-xs font-bold text-primary">
                    {confirmedCount} / {event.maxParticipants} ({capacityPercent}% filled)
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-500" 
                    style={{ width: `${capacityPercent}%` }} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="space-y-2 bg-surface-container/30 border border-white/[0.03] rounded-3xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">
              About the Event
            </h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {event.description}
            </p>
          </section>

          {/* Approved Guests Section */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2.5 font-headline text-xl font-bold tracking-tight text-on-surface">
              <span className="h-5 w-1 rounded-full bg-tertiary" />
              <span>
                Approved Participants <span className="text-on-surface-variant font-normal">({confirmedMembers.length})</span>
              </span>
            </h2>

            {approvedQuery.isLoading ? (
              <div className="h-32 animate-pulse rounded-2xl bg-surface-container" />
            ) : confirmedMembers.length ? (
              <div className="space-y-2">
                {confirmedMembers.map((participant) => {
                  const participantId = participant.participantId ?? participant.userId;
                  const isSavingThisParticipant =
                    participantDecisionMutation.isPending && participantDecisionMutation.variables?.participantId === participantId;

                  return (
                    <div 
                      key={`${participant.name}-${participant.role}`}
                      className="flex items-center justify-between rounded-2xl bg-surface-container/30 border border-white/[0.03] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                          {getInitials(participant.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-on-surface">{participant.name}</p>
                          <p className="text-[0.6rem] text-on-surface-variant">{timeAgo(participant.joinedAt, currentTime)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {canModerateApproved && participantId ? (
                          <div className="flex gap-1.5">
                            <button
                              className="rounded-xl bg-surface-container-high px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "co_host")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "co_host" ? "..." : "Co-Host"}
                            </button>
                            <button
                              className="rounded-xl bg-rose-500/10 px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-wider text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "REJECTED")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "REJECTED" ? "..." : "Remove"}
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full bg-tertiary/10 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-wider text-tertiary">
                            Guest
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container/30 border border-white/[0.03] p-4 text-xs text-on-surface-variant text-center">No approved members yet.</div>
            )}
          </section>

          {/* Waiting List Section */}
          {!isPastEvent && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2.5 font-headline text-xl font-bold tracking-tight text-on-surface">
                  <span className="h-5 w-1 rounded-full bg-primary" />
                  <span>
                    Waiting List <span className="text-primary font-normal">({pendingParticipants.length})</span>
                  </span>
                </h2>
                {canModeratePending && pendingParticipants.length ? (
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary cursor-pointer hover:underline">Approve All</span>
                ) : null}
              </div>

              {pendingQuery.isLoading ? (
                <div className="h-32 animate-pulse rounded-2xl bg-surface-container" />
              ) : pendingParticipants.length ? (
                <div className="space-y-2">
                  {pendingParticipants.map((participant) => {
                    const participantId = participant.participantId ?? participant.userId;
                    const isSavingThisParticipant =
                      participantDecisionMutation.isPending && participantDecisionMutation.variables?.participantId === participantId;

                    return (
                      <article
                        className="flex items-center justify-between rounded-2xl bg-surface-container/50 border border-white/[0.04] p-3.5"
                        key={`${participant.name}-${participant.role}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {getInitials(participant.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-on-surface">{participant.name}</p>
                            <p className="text-[0.6rem] text-on-surface-variant">Wants to join</p>
                          </div>
                        </div>
                        {canModeratePending && participantId ? (
                          <div className="flex gap-1.5">
                            <button
                              className="rounded-xl bg-primary px-3 py-1.5 text-[0.68rem] font-bold text-[#480d00] transition-colors hover:brightness-115 disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "approved")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "approved" ? "..." : "Accept"}
                            </button>
                            <button
                              className="rounded-xl bg-surface-container-high px-3 py-1.5 text-[0.68rem] font-semibold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "co_host")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "co_host" ? "..." : "Co"}
                            </button>
                            <button
                              className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-[0.68rem] font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "REJECTED")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "REJECTED" ? "..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-wider text-tertiary">
                            Pending
                          </span>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-surface-container/30 border border-white/[0.03] p-4 text-xs text-on-surface-variant text-center">No pending requests right now.</div>
              )}
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Action Card for Desktop */}
          <div className="hidden lg:block rounded-3xl bg-surface-container/60 border border-white/[0.04] p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Actions</p>
            {shouldShowJoinButton && (
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-[#480d00] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={(isAuthenticated && !canJoin) || requestJoinMutation.isPending}
                onClick={handleJoin}
                type="button"
              >
                {requestJoinMutation.isPending ? "Submitting..." : joinButtonLabel}
              </button>
            )}
            {shouldShowEditButton && (
              <Link
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
                href={`/events/${token}/edit`}
              >
                <PencilLine className="h-4 w-4" />
                Edit Event
              </Link>
            )}
            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              onClick={handleShare}
              type="button"
            >
              <Share2 className="h-4 w-4" />
              {shareState === "copied" ? "Copied Link" : "Share Link"}
            </button>
          </div>

          {/* Host Card */}
          <section className="overflow-hidden rounded-3xl bg-surface-container/40 border border-white/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
                {getInitials(host)}
              </div>
              <div>
                <p className="text-lg font-black text-on-surface leading-tight">{host}</p>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary mt-1">Main Host</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">Curating social experiences and keeping this gathering intentional.</p>
            <Link
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-surface-container-high px-4 py-3 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
              href={`/profile/${event.creator.userId}`}
            >
              View Host Profile
            </Link>
          </section>

          {/* Co-Hosts Card */}
          <section className="rounded-3xl bg-surface-container/40 border border-white/[0.04] p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">Appointed Co-Hosts</p>
            {coHosts.length ? (
              <div className="space-y-2">
                {coHosts.map((coHost) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-surface-container-high/40 p-2.5" key={coHost.name}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container-high text-xs font-black text-tertiary">
                      {getInitials(coHost.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-on-surface">{coHost.name}</p>
                    </div>
                    {coHost.userId ? (
                      <Link
                        aria-label={`View ${coHost.name} profile`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                        href={`/profile/${coHost.userId}`}
                        title="View profile"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container-high/20 p-4 text-xs text-on-surface-variant text-center">No co-host assigned.</div>
            )}
          </section>

          {/* Spot Card (Map) */}
          <section className="rounded-3xl bg-surface-container/40 border border-white/[0.04] p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">The Spot</p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface-container-high">
              <div className="h-48 relative grayscale contrast-125 brightness-90">
                <iframe className="h-full w-full border-0" loading="lazy" src={mapUrl} title="Event location map preview" />
              </div>
            </div>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-3 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
              href={googleMapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open in Google Maps
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </div>

      {/* API Errors */}
      {(approvedQuery.isError || (!isPastEvent && pendingQuery.isError)) && !eventQuery.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3.5 text-xs text-rose-300">
          {approvedQuery.isError
            ? getApiErrorMessage(approvedQuery.error, "Unable to load approved participants.")
            : getApiErrorMessage(pendingQuery.error, "Unable to load waiting list.")}
        </div>
      ) : null}

      {requestJoinMutation.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3.5 text-xs text-rose-300">
          {getApiErrorMessage(requestJoinMutation.error, "Unable to submit join request.")}
        </div>
      ) : null}

      {participantDecisionMutation.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3.5 text-xs text-rose-300">
          {getApiErrorMessage(participantDecisionMutation.error, "Unable to update participant status.")}
        </div>
      ) : null}
    </div>
  );
}
