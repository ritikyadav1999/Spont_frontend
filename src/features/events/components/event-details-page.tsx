"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, Share2, Users } from "lucide-react";
import { useMemo, useState } from "react";
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

const heroImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDAuZsz1fHPRiWLfqu-qOs1HBfDrjFpi_W4yCHzcG43ztM8D9xvYk0V0X46q9ySBVnCsmDg4HlxvWKzSF5A--ImvFir753D1e54rKGWsR-nRZ7eXwfJdCKEPpQgLO4xt6Uct168UbqFhfPIOur6sxiaKEPsX3RZ6RytvfomZhgHzIg0nX4v2EBeb4U-m78Vqwe-eKkPEoDrKYOdOe3crnGO_QFuiA9v5RhSTonvEyE4Qu34bHEHX5Q25LPiqXyV0G7mBR-bfIvFwr0-",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC7B9SV77BVxojgfSAzAeIKzM28qHQ0T_XLk2KZgiqBDX7E98ZIbQk4q9sHXsd8YTbrGHFKPgmx6WX8yPjCKAcQACYc9ys3IyfFMsnxoj4VQJ5y9BOiIYOek6Nuzoxw3DjxUXyYg6-M9HDiJHyWKRh6B5Haahh_jqtWSPUI4IlRfc2IYerCKCDNP8XMBXxTCI0Ov8hSQu69ANSyz4y-ypZ1ibD7kv2dMS3TACRjnYiypgGY50VDA9llgaqkEpSq5NQ0imNM7vDPy6-N",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA1OsDM4MJjvCthRTQ5ufxb2gA0aalRiymZw8NXyTppBcB4e6oh5TbIJWwqTv3MFtdn_HEX7VrpgqH_TSOYoKMBjlpAt9xN57HfoWrkfFVmyoC-Rhi9v5J3ujQB-mthEzfJz4pnJbzSH6aZpAUk7rJoloQ71OkrexOrEfCeV_2dA-LRAw-Uz8-ZgtMgDg2U4KrtD73vg4JHKE-G2cS41Fth4D32F7973vqmYD1WrlSwhj9-SB7vds5nVfk7hoKQDipRzpuKdSw1IYwT",
];

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

export function EventDetailsPage({ token }: { token: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
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

  const normalizedUserName = user?.name?.trim().toLowerCase();
  const normalizedCreatorName = event?.creator.name?.trim().toLowerCase();
  const isHostView = Boolean(
    (user?.id && event?.creator.userId && user.id === event.creator.userId) ||
      (!user?.id && normalizedUserName && normalizedCreatorName && normalizedUserName === normalizedCreatorName),
  );
  const isCoHostView = Boolean(
    approvedParticipants.some((participant) => {
      const isCoHostRole = participant.role === "CO_HOST" || participant.role === "COHOST";
      if (!isCoHostRole) {
        return false;
      }

      const participantName = participant.name?.trim().toLowerCase();
      return (user?.id && participant.userId && user.id === participant.userId) || (!user?.id && normalizedUserName === participantName);
    }),
  );
  const canModeratePending = (isHostView || isCoHostView) && event?.status === "SCHEDULED" && !isPastEvent;
  const canModerateApproved = canModeratePending;
  const canJoin = Boolean(user?.name && user?.gender && user?.phone);
  const confirmedCount = confirmedMembers.length + 1;
  const maxParticipants = event?.maxParticipants ?? 1;
  const capacityPercent = Math.min(100, Math.round((confirmedCount / maxParticipants) * 100));

  const heroImage = useMemo(() => {
    if (!event?.eventId) {
      return heroImages[0];
    }

    const hash = event.eventId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return heroImages[hash % heroImages.length];
  }, [event?.eventId]);

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
      : joinState === "joined"
      ? "Joined"
      : joinState === "requested"
        ? "Request Sent"
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
    <div className="ui-page-shell pb-12">
      <header className="mb-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="max-w-4xl font-headline text-5xl font-black leading-[0.94] tracking-[-0.04em] text-on-surface xl:text-[4.3rem]">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDateLabel(event.startTime)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Invite Friends
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isPastEvent ? (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary-container transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={(isAuthenticated && !canJoin) || requestJoinMutation.isPending || joinState !== "idle"}
                onClick={handleJoin}
                type="button"
              >
                {requestJoinMutation.isPending ? "Submitting..." : joinButtonLabel}
              </button>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              onClick={handleShare}
              type="button"
            >
              <Share2 className="h-4 w-4" />
              {shareState === "copied" ? "Copied Link" : "Share Link"}
            </button>
          </div>
        </div>
      </header>

      {!isAuthenticated && !isPastEvent ? (
        <div className="mb-6 rounded-2xl border border-white/8 bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          Sign in or create an account to request your spot at this event and see the latest attendee updates.
        </div>
      ) : null}

      {isAuthenticated && !canJoin && !isPastEvent ? (
        <div className="mb-6 rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
          Complete your profile with <span className="text-on-surface">name, gender, and phone</span> before joining an event.
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section className="relative h-[23rem] overflow-hidden rounded-[2rem] bg-surface-container">
            <img alt={event.title} className="h-full w-full object-cover" src={heroImage} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2">
              <span className="rounded-full bg-primary/22 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                {event.joinMode === "APPROVAL_REQUIRED" ? "Approval Required" : "Open Entry"}
              </span>
              <span className="rounded-full bg-tertiary/18 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-tertiary">
                {event.visibility}
              </span>
            </div>
          </section>

          <section className="rounded-[2rem] bg-surface-container p-6 sm:p-8">
            <h2 className="mb-4 font-headline text-[1.75rem] font-bold tracking-tight text-on-surface">Event Info</h2>
            <div className="text-sm leading-7 text-on-surface-variant">
              <p>{event.description}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-high p-4">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-primary">Start Time</p>
                <p className="mt-2 text-xl font-black text-on-surface">{formatTimeLabel(event.startTime)}</p>
                <p className="text-xs text-on-surface-variant">{formatDateLabel(event.startTime)}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-high p-4">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-tertiary">End Time</p>
                <p className="mt-2 text-xl font-black text-on-surface">{formatTimeLabel(event.endTime)}</p>
                <p className="text-xs text-on-surface-variant">{formatDateLabel(event.endTime)}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-high p-4">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Location</p>
                <p className="mt-2 text-sm font-semibold text-on-surface">{event.locationName}</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-high p-4">
                <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Capacity</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-xl font-black text-on-surface">
                    {confirmedCount}/{event.maxParticipants}
                  </p>
                  <p className="text-xs font-semibold text-primary">{capacityPercent}% filled</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${capacityPercent}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-3 font-headline text-[1.95rem] font-bold tracking-tight text-on-surface">
              <span className="h-8 w-2 rounded-full bg-tertiary" />
              <span>
                Approved Participants <span className="text-on-surface-variant">{confirmedMembers.length}</span>
              </span>
            </h2>

            {approvedQuery.isLoading ? (
              <div className="h-44 animate-pulse rounded-2xl bg-surface-container" />
            ) : confirmedMembers.length ? (
              <div className="overflow-hidden rounded-[1.7rem] bg-surface-container">
                <div className="grid grid-cols-[minmax(0,1fr)_8rem_6rem] bg-surface-container-high px-5 py-3 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  <span>Participant</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-white/5">
                  {confirmedMembers.map((participant) => {
                    const participantId = participant.participantId ?? participant.userId;
                    const isSavingThisParticipant =
                      participantDecisionMutation.isPending && participantDecisionMutation.variables?.participantId === participantId;

                    return (
                      <div className="grid grid-cols-[minmax(0,1fr)_8rem_6rem] items-center px-5 py-4" key={`${participant.name}-${participant.role}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                            {getInitials(participant.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-on-surface">{participant.name}</p>
                            <p className="text-xs text-on-surface-variant">{timeAgo(participant.joinedAt, currentTime)}</p>
                          </div>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-tertiary/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-tertiary">
                          Attendee
                        </span>
                        <div className="flex justify-end gap-2">
                          {canModerateApproved && participantId ? (
                            <>
                              <button
                                className="rounded-lg bg-surface-container-high px-2 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                                disabled={participantDecisionMutation.isPending}
                                onClick={() => handleParticipantDecision(participant, "co_host")}
                                type="button"
                              >
                                {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "co_host" ? "..." : "Co"}
                              </button>
                              <button
                                className="rounded-lg bg-surface-container-high px-2 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                                disabled={participantDecisionMutation.isPending}
                                onClick={() => handleParticipantDecision(participant, "REJECTED")}
                                type="button"
                              >
                                {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "REJECTED" ? "..." : "X"}
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-on-surface-variant">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-container p-4 text-sm text-on-surface-variant">No approved members yet.</div>
            )}
          </section>

          {!isPastEvent ? (
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 font-headline text-[1.95rem] font-bold tracking-tight text-on-surface">
                  <span className="h-8 w-2 rounded-full bg-primary" />
                  <span>
                    Waiting List <span className="text-primary">{pendingParticipants.length}</span>
                  </span>
                </h2>
                {canModeratePending && pendingParticipants.length ? (
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Approve All</span>
                ) : null}
              </div>

              {pendingQuery.isLoading ? (
                <div className="h-44 animate-pulse rounded-2xl bg-surface-container" />
              ) : pendingParticipants.length ? (
                <div className="space-y-3">
                  {pendingParticipants.map((participant) => {
                    const participantId = participant.participantId ?? participant.userId;
                    const isSavingThisParticipant =
                      participantDecisionMutation.isPending && participantDecisionMutation.variables?.participantId === participantId;

                    return (
                      <article
                        className="flex flex-col gap-4 rounded-2xl bg-surface-container p-4 sm:flex-row sm:items-center sm:justify-between"
                        key={`${participant.name}-${participant.role}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-sm font-black text-primary">
                            {getInitials(participant.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-bold text-on-surface">{participant.name}</h3>
                            <p className="line-clamp-2 text-xs text-on-surface-variant">Pending approval to join this event.</p>
                          </div>
                        </div>
                        {canModeratePending && participantId ? (
                          <div className="grid grid-cols-3 gap-2 sm:w-[24rem]">
                            <button
                              className="rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-on-primary-container transition-colors hover:brightness-110 disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "approved")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "approved" ? "Saving..." : "Accept"}
                            </button>
                            <button
                              className="rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "co_host")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "co_host" ? "Saving..." : "Co-Host"}
                            </button>
                            <button
                              className="rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                              disabled={participantDecisionMutation.isPending}
                              onClick={() => handleParticipantDecision(participant, "REJECTED")}
                              type="button"
                            >
                              {isSavingThisParticipant && participantDecisionMutation.variables?.decision === "REJECTED" ? "Saving..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-surface-container-high px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-tertiary">
                            Pending
                          </span>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-surface-container p-4 text-sm text-on-surface-variant">No pending requests right now.</div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-[1.9rem] bg-surface-container p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-lg font-black text-primary">
                {getInitials(host)}
              </div>
              <div>
                <p className="text-xl font-black text-on-surface">{host}</p>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-primary">Main Host</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">Curating social experiences and keeping this gathering intentional.</p>
            <Link
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
              href={`/profile/${event.creator.userId}`}
            >
              View Host Profile
            </Link>
          </section>

          <section className="rounded-[1.7rem] bg-surface-container-low p-5">
            <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Appointed Co-Hosts</p>
            {coHosts.length ? (
              <div className="space-y-3">
                {coHosts.map((coHost) => (
                  <div className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-2.5" key={coHost.name}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-xs font-black text-tertiary">
                      {getInitials(coHost.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-on-surface">{coHost.name}</p>
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
              <div className="rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">No co-host assigned.</div>
            )}
          </section>

          <section className="rounded-[1.7rem] bg-surface-container p-5" title={formatDateRange(event.startTime, event.endTime)}>
            <p className="mb-3 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">The Spot</p>
            <div className="overflow-hidden rounded-xl bg-surface-container-high">
              <div className="h-56">
                <iframe className="h-full w-full border-0 grayscale" loading="lazy" src={mapUrl} title="Event location map preview" />
              </div>
            </div>
            <Link
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-3 py-2.5 text-[0.72rem] font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
              href={googleMapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open in Google Maps
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>

      {(approvedQuery.isError || (!isPastEvent && pendingQuery.isError)) && !eventQuery.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {approvedQuery.isError
            ? getApiErrorMessage(approvedQuery.error, "Unable to load approved participants.")
            : getApiErrorMessage(pendingQuery.error, "Unable to load waiting list.")}
        </div>
      ) : null}

      {requestJoinMutation.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {getApiErrorMessage(requestJoinMutation.error, "Unable to submit join request.")}
        </div>
      ) : null}

      {participantDecisionMutation.isError ? (
        <div className="mt-6 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {getApiErrorMessage(participantDecisionMutation.error, "Unable to update participant status.")}
        </div>
      ) : null}
    </div>
  );
}
