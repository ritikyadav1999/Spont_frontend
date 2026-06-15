 "use client";

import Link from "next/link";
import {
  ArrowUpRight,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  useApprovedParticipants,
  useMyAttendingEvents,
  useMyHostingEvents,
  useMyPastEvents,
} from "@/features/events/hooks/use-events";
import type { EventItem, PastEventSummary } from "@/features/events/types/event.types";
import { EventPosterCard } from "@/features/my-events/components/event-poster-card";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

function formatDateLabel(value?: string, options?: Intl.DateTimeFormatOptions, fallback = "Date TBD") {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", options).format(parsed);
}

function getEventTitle(event: EventItem) {
  return event.title?.trim() || "Untitled Event";
}

function getEventDescription(event: EventItem) {
  return event.description?.trim() || "";
}

function getLocationLabel(event: EventItem) {
  return event.locationName?.trim() || "Location TBA";
}



function getShortLocation(event: EventItem) {
  return getLocationLabel(event).split(",")[0]?.trim() || "Location TBA";
}

function getEventMonthDay(event: EventItem) {
  return formatDateLabel(
    event.startTime,
    {
      month: "short",
      day: "numeric",
    },
    "TBA",
  ).toUpperCase();
}

function getAttendanceState(event: EventItem) {
  if (event.status === "ONGOING") {
    return "Happening now";
  }

  if (event.joinMode === "APPROVAL_REQUIRED") {
    return "Approval required";
  }

  if (event.visibility === "PRIVATE") {
    return "Private access";
  }

  return "RSVP confirmed";
}

function getPastEventMonthDay(event: PastEventSummary) {
  return formatDateLabel(
    event.startTime,
    {
      month: "short",
      day: "numeric",
    },
    "TBA",
  ).toUpperCase();
}

function QueryNotice({
  tone = "neutral",
  message,
  actionHref,
  actionLabel,
}: {
  tone?: "neutral" | "danger";
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4",
        tone === "danger"
          ? "border-rose-500/10 bg-rose-500/5 text-rose-300"
          : "border-white/6 bg-surface-container-low text-on-surface-variant",
      )}
    >
      <p className="text-xs leading-relaxed">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          href={actionHref}
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function HeaderStat({
  value,
  label,
  valueClassName,
}: {
  value: string | number;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-full bg-surface-container-high/60 border border-white/[0.04] px-4 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-bold", valueClassName)}>{value}</span>
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">{label}</span>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-surface-container-low" />
      <div className="flex gap-3">
        <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-low" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-surface-container-low" />
      </div>
    </div>
  );
}

function CoHostProfilesModal({
  token,
  title,
  onClose,
}: {
  token: string;
  title: string;
  onClose: () => void;
}) {
  const coHostsQuery = useApprovedParticipants(token, Boolean(token));
  const coHosts =
    coHostsQuery.data?.filter((participant) => participant.role === "CO_HOST" || participant.role === "COHOST") ?? [];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-surface-container border border-white/[0.04] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Co-Hosts</h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">{title}</p>
          </div>
          <button
            aria-label="Close co-host profiles"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {coHostsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="h-14 animate-pulse rounded-2xl bg-surface-container-high" key={index} />
            ))}
          </div>
        ) : null}

        {coHostsQuery.isError ? (
          <QueryNotice message={getApiErrorMessage(coHostsQuery.error, "Unable to load co-host profiles.")} tone="danger" />
        ) : null}

        {!coHostsQuery.isLoading && !coHostsQuery.isError && !coHosts.length ? (
          <div className="rounded-2xl bg-surface-container-high/40 p-4 text-xs text-on-surface-variant text-center">No co-host assigned.</div>
        ) : null}

        {!coHostsQuery.isLoading && !coHostsQuery.isError && coHosts.length ? (
          <div className="space-y-2">
            {coHosts.map((coHost) => (
              <div className="flex items-center justify-between rounded-2xl bg-surface-container-high/60 border border-white/[0.03] p-3" key={`${coHost.userId ?? coHost.name}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[0.68rem] font-black text-primary">
                    {coHost.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <p className="truncate text-xs font-semibold text-on-surface">{coHost.name}</p>
                </div>
                {coHost.userId ? (
                  <Link
                    className="inline-flex items-center gap-1 rounded-xl bg-surface-container-high px-3 py-1.5 text-[0.68rem] font-bold text-primary transition-colors hover:bg-surface-container-highest"
                    href={`/profile/${coHost.userId}`}
                  >
                    Profile
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MyEventsPage() {
  const [coHostModal, setCoHostModal] = useState<{ token: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"attending" | "hosting" | "history">("attending");
  const hostingEventsQuery = useMyHostingEvents();
  const attendingEventsQuery = useMyAttendingEvents();
  const pastEventsQuery = useMyPastEvents();

  const hostingEvents = hostingEventsQuery.data?.content ?? [];
  const attendingEvents = attendingEventsQuery.data?.content ?? [];
  const pastEvents = pastEventsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const upcomingCount = hostingEvents.length + attendingEvents.length;

  const showHeroSkeleton =
    hostingEventsQuery.isLoading &&
    attendingEventsQuery.isLoading &&
    pastEventsQuery.isLoading &&
    !hostingEvents.length &&
    !attendingEvents.length &&
    !pastEvents.length;

  return (
    <div className="ui-page-shell ui-page-shell--medium pb-20 max-w-4xl mx-auto px-4">
      {showHeroSkeleton ? (
        <HeroSkeleton />
      ) : (
        <header className="mb-8 border-b border-white/[0.06] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface sm:text-5xl">
              My <span className="text-primary italic">Pulse</span>
            </h1>
          </div>
          <div className="flex gap-3 text-xs">
            <HeaderStat label="Upcoming" value={upcomingCount} valueClassName="text-primary" />
            <HeaderStat label="Archive" value={pastEvents.length} valueClassName="text-tertiary" />
          </div>
        </header>
      )}

      {/* Segmented Tab Controller */}
      <div className="flex rounded-2xl bg-surface-container-high/40 border border-white/[0.04] p-1.5 mb-8 max-w-md mx-auto">
        <button
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-bold transition-all text-center cursor-pointer",
            activeTab === "attending"
              ? "bg-primary text-[#480d00] shadow-sm font-black"
              : "text-on-surface-variant hover:text-on-surface",
          )}
          onClick={() => setActiveTab("attending")}
          type="button"
        >
          Attending ({attendingEvents.length})
        </button>
        <button
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-bold transition-all text-center cursor-pointer",
            activeTab === "hosting"
              ? "bg-primary text-[#480d00] shadow-sm font-black"
              : "text-on-surface-variant hover:text-on-surface",
          )}
          onClick={() => setActiveTab("hosting")}
          type="button"
        >
          Hosting ({hostingEvents.length})
        </button>
        <button
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-bold transition-all text-center cursor-pointer",
            activeTab === "history"
              ? "bg-primary text-[#480d00] shadow-sm font-black"
              : "text-on-surface-variant hover:text-on-surface",
          )}
          onClick={() => setActiveTab("history")}
          type="button"
        >
          History ({pastEvents.length})
        </button>
      </div>

      {/* Tab Contents: Attending */}
      {activeTab === "attending" && (
        <div className="space-y-6">
          {attendingEventsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-80 w-full animate-pulse rounded-3xl bg-surface-container-low" key={index} />
              ))}
            </div>
          ) : attendingEventsQuery.isError ? (
            <QueryNotice message={getApiErrorMessage(attendingEventsQuery.error, "Unable to load attending events.")} tone="danger" />
          ) : !attendingEvents.length ? (
            <div className="text-center py-12 rounded-3xl bg-surface-container/30 border border-white/[0.03] px-6">
              <p className="text-3xl">🎉</p>
              <p className="mt-3 font-semibold text-sm text-on-surface">No events joined yet</p>
              <p className="mt-1 text-xs text-on-surface-variant mb-6">Discover spontaneous events happening around you.</p>
              <Link
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-[#480d00] transition-colors hover:brightness-110"
                href="/discover"
              >
                Discover Events
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {attendingEvents.map((event) => (
                <EventPosterCard
                  badgeLabel={getEventMonthDay(event)}
                  description={getEventDescription(event)}
                  eventId={event.eventId}
                  footerLabel={getAttendanceState(event)}
                  href={`/events/${event.inviteToken}`}
                  key={event.eventId}
                  location={getShortLocation(event)}
                  title={getEventTitle(event)}
                  overlayAction={
                    <button
                      aria-label="View co-host profiles"
                      className="inline-flex items-center gap-1 rounded-full bg-primary/90 hover:bg-primary px-2.5 py-1 text-[0.58rem] font-bold text-on-primary-container shadow-sm transition-transform active:scale-95 cursor-pointer"
                      onClick={(eventClick) => {
                        eventClick.preventDefault();
                        eventClick.stopPropagation();
                        setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) });
                      }}
                      title="View co-host profiles"
                      type="button"
                    >
                      <UserRound className="h-3 w-3" />
                      Co-hosts
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Hosting */}
      {activeTab === "hosting" && (
        <div className="space-y-6">
          {hostingEventsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-80 w-full animate-pulse rounded-3xl bg-surface-container-low" key={index} />
              ))}
            </div>
          ) : hostingEventsQuery.isError ? (
            <QueryNotice message={getApiErrorMessage(hostingEventsQuery.error, "Unable to load hosting events.")} tone="danger" />
          ) : !hostingEvents.length ? (
            <div className="text-center py-12 rounded-3xl bg-surface-container/30 border border-white/[0.03] px-6">
              <p className="text-3xl">✨</p>
              <p className="mt-3 font-semibold text-sm text-on-surface">Not hosting anything yet</p>
              <p className="mt-1 text-xs text-on-surface-variant mb-6">Create and broadcast your own spontaneous experience.</p>
              <Link
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-[#480d00] transition-colors hover:brightness-110"
                href="/host"
              >
                Host an Event
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hostingEvents.map((event) => (
                <EventPosterCard
                  badgeLabel={getEventMonthDay(event)}
                  description={getEventDescription(event)}
                  eventId={event.eventId}
                  footerLabel={getAttendanceState(event)}
                  href={`/events/${event.inviteToken}`}
                  key={event.eventId}
                  location={getShortLocation(event)}
                  title={getEventTitle(event)}
                  overlayAction={
                    <button
                      aria-label="View co-host profiles"
                      className="inline-flex items-center gap-1 rounded-full bg-primary/90 hover:bg-primary px-2.5 py-1 text-[0.58rem] font-bold text-on-primary-container shadow-sm transition-transform active:scale-95 cursor-pointer"
                      onClick={(eventClick) => {
                        eventClick.preventDefault();
                        eventClick.stopPropagation();
                        setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) });
                      }}
                      title="View co-host profiles"
                      type="button"
                    >
                      <UserRound className="h-3 w-3" />
                      Co-hosts
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: History */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {pastEventsQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="h-80 w-full animate-pulse rounded-3xl bg-surface-container-low" key={index} />
              ))}
            </div>
          ) : pastEventsQuery.isError ? (
            <QueryNotice message={getApiErrorMessage(pastEventsQuery.error, "Unable to load past events.")} tone="danger" />
          ) : !pastEvents.length ? (
            <div className="text-center py-12 rounded-3xl bg-surface-container/30 border border-white/[0.03] p-6 text-xs text-on-surface-variant">
              No past events recorded in your history.
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventPosterCard
                    badgeLabel={getPastEventMonthDay(event)}
                    footerLabel="Completed"
                    href={`/events/${event.inviteToken}`}
                    key={event.inviteToken}
                    location={event.location ? event.location.split(",")[0] ?? "Location" : "Location"}
                    title={event.title?.trim() || "Untitled Event"}
                    isMuted={true}
                  />
                ))}
              </div>

              {pastEventsQuery.hasNextPage ? (
                <div className="mt-8 flex justify-center">
                  <button
                    className="rounded-full bg-surface-container-high border border-white/[0.04] px-6 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60 cursor-pointer"
                    disabled={pastEventsQuery.isFetchingNextPage}
                    onClick={() => void pastEventsQuery.fetchNextPage()}
                    type="button"
                  >
                    {pastEventsQuery.isFetchingNextPage ? "Loading..." : "Load More History"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}

      {coHostModal ? (
        <CoHostProfilesModal onClose={() => setCoHostModal(null)} title={coHostModal.title} token={coHostModal.token} />
      ) : null}
    </div>
  );
}
