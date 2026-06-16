 "use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  MapPin,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppPageHeader } from "@/components/layout/app-page-header";
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

/* ─── Formatters ─────────────────────────────────────────────────────────── */

function formatDateLabel(value?: string, options?: Intl.DateTimeFormatOptions, fallback = "Date TBD") {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
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
  return formatDateLabel(event.startTime, { month: "short", day: "numeric" }, "TBA").toUpperCase();
}

function getEventDayNum(event: EventItem) {
  return formatDateLabel(event.startTime, { day: "numeric" }, "--");
}

function getEventMonth(event: EventItem) {
  return formatDateLabel(event.startTime, { month: "short" }, "---").toUpperCase();
}

function getEventTime(event: EventItem) {
  return formatDateLabel(event.startTime, { hour: "numeric", minute: "2-digit" }, "");
}

function getPastDayNum(event: PastEventSummary) {
  return formatDateLabel(event.startTime, { day: "numeric" }, "--");
}

function getPastMonth(event: PastEventSummary) {
  return formatDateLabel(event.startTime, { month: "short" }, "---").toUpperCase();
}

function getPastTime(event: PastEventSummary) {
  return formatDateLabel(event.startTime, { hour: "numeric", minute: "2-digit" }, "");
}

function getPastEventMonthDay(event: PastEventSummary) {
  return formatDateLabel(event.startTime, { month: "short", day: "numeric" }, "TBA").toUpperCase();
}

function getStatusPill(event: EventItem): { label: string; className: string } {
  if (event.status === "ONGOING") return { label: "Live now", className: "bg-emerald-500/15 text-emerald-400" };
  if (event.joinMode === "APPROVAL_REQUIRED") return { label: "Invite only", className: "bg-primary/10 text-primary" };
  if (event.visibility === "PRIVATE") return { label: "Private", className: "bg-white/8 text-on-surface-variant" };
  return { label: "Open", className: "bg-tertiary/10 text-tertiary" };
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function QueryNotice({ tone = "neutral", message, actionHref, actionLabel }: {
  tone?: "neutral" | "danger";
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl border px-5 py-4",
      tone === "danger"
        ? "border-rose-500/10 bg-rose-500/5 text-rose-300"
        : "border-white/6 bg-surface-container-low text-on-surface-variant",
    )}>
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

function EmptyState({ emoji, title, subtitle, actionHref, actionLabel }: {
  emoji: string;
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 rounded-3xl bg-surface-container/20 border border-white/[0.03]">
      <p className="text-4xl mb-4">{emoji}</p>
      <p className="font-semibold text-sm text-on-surface">{title}</p>
      <p className="mt-1.5 text-xs text-on-surface-variant mb-6 max-w-[18rem]">{subtitle}</p>
      <Link
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-[#480d00] transition-colors hover:brightness-110"
        href={actionHref}
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* Native mobile list row for upcoming events */
function EventListRow({ event, onCoHostPress }: {
  event: EventItem;
  onCoHostPress: () => void;
}) {
  const pill = getStatusPill(event);
  return (
    <Link
      href={`/events/${event.inviteToken}`}
      className="flex items-center gap-3.5 py-3.5 active:bg-white/[0.02] transition-colors"
    >
      {/* Date Badge */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-container-high/60 border border-white/[0.05] py-2">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-primary leading-none">{getEventMonth(event)}</span>
        <span className="font-headline text-xl font-black text-on-surface leading-tight">{getEventDayNum(event)}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-on-surface leading-snug truncate">{getEventTitle(event)}</p>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant/50" />
          <span className="text-xs text-on-surface-variant truncate">{getShortLocation(event)}</span>
          {getEventTime(event) && (
            <>
              <span className="text-on-surface-variant/30 text-xs">·</span>
              <span className="text-xs text-on-surface-variant/70 shrink-0">{getEventTime(event)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider", pill.className)}>
            {pill.label}
          </span>
          <button
            type="button"
            aria-label="View co-hosts"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCoHostPress(); }}
            className="inline-flex items-center gap-1 rounded-full bg-surface-container-high/80 px-2 py-0.5 text-[0.58rem] font-bold text-on-surface-variant transition-colors active:bg-surface-container-highest"
          >
            <UserRound className="h-2.5 w-2.5" />
            Co-hosts
          </button>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/30" />
    </Link>
  );
}

/* Native mobile list row for past events */
function PastEventListRow({ event }: { event: PastEventSummary }) {
  return (
    <Link
      href={`/events/${event.inviteToken}`}
      className="flex items-center gap-3.5 py-3.5 active:bg-white/[0.02] transition-colors"
    >
      {/* Date Badge */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-container-high/40 border border-white/[0.04] py-2 opacity-60">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-on-surface-variant leading-none">{getPastMonth(event)}</span>
        <span className="font-headline text-xl font-black text-on-surface leading-tight">{getPastDayNum(event)}</span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-on-surface/70 leading-snug truncate">{event.title?.trim() || "Untitled Event"}</p>
        {event.location && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3 shrink-0 text-on-surface-variant/40" />
            <span className="text-xs text-on-surface-variant/60 truncate">{event.location.split(",")[0]}</span>
            {getPastTime(event) && (
              <>
                <span className="text-on-surface-variant/30 text-xs">·</span>
                <span className="text-xs text-on-surface-variant/50 shrink-0">{getPastTime(event)}</span>
              </>
            )}
          </div>
        )}
        <span className="mt-1.5 inline-block rounded-full bg-white/[0.05] border border-white/[0.05] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-on-surface-variant/50">
          Completed
        </span>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant/20" />
    </Link>
  );
}

/* List skeleton row */
function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <div className="h-12 w-11 animate-pulse rounded-xl bg-surface-container-high" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/5 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-3 w-2/5 animate-pulse rounded-full bg-surface-container-high/60" />
      </div>
    </div>
  );
}

/* Co-host modal — unchanged */
function CoHostProfilesModal({ token, title, onClose }: {
  token: string;
  title: string;
  onClose: () => void;
}) {
  const coHostsQuery = useApprovedParticipants(token, Boolean(token));
  const coHosts =
    coHostsQuery.data?.filter((p) => p.role === "CO_HOST" || p.role === "COHOST") ?? [];

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/70 px-4 pb-6 sm:pb-0 backdrop-blur-sm">
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
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="h-14 animate-pulse rounded-2xl bg-surface-container-high" key={i} />
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
          <div className="divide-y divide-white/[0.04]">
            {coHosts.map((coHost) => (
              <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={coHost.userId ?? coHost.name}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.68rem] font-black text-primary">
                  {coHost.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{coHost.name}</p>
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

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export function MyEventsPage() {
  const [coHostModal, setCoHostModal] = useState<{ token: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"attending" | "hosting" | "history">("attending");

  const hostingEventsQuery = useMyHostingEvents();
  const attendingEventsQuery = useMyAttendingEvents();
  const pastEventsQuery = useMyPastEvents();

  const hostingEvents = hostingEventsQuery.data?.content ?? [];
  const attendingEvents = attendingEventsQuery.data?.content ?? [];
  const pastEvents = pastEventsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const tabs = [
    { id: "attending" as const, label: "Going", count: attendingEvents.length },
    { id: "hosting" as const, label: "Hosting", count: hostingEvents.length },
    { id: "history" as const, label: "History", count: pastEvents.length },
  ];

  return (
    <div className="ui-page-shell pb-24 max-w-5xl mx-auto">

      {/* ── Desktop header (AppPageHeader — consistent with other pages) */}
      <AppPageHeader
        className="hidden md:block"
        title="My Events"
        description="Your full schedule — events you're attending, hosting, and your past archive."
        actions={
          <div className="flex items-center gap-1.5 rounded-2xl bg-surface-container-high/50 border border-white/[0.04] px-4 py-2.5">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-on-surface">
              {hostingEvents.length + attendingEvents.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">upcoming</span>
          </div>
        }
      />

      {/* ── Mobile compact header (hidden on md+) */}
      <div className="flex items-center justify-between mb-5 md:hidden">
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface leading-tight">
            My Events
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Your schedule at a glance</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-surface-container-high/50 border border-white/[0.04] px-3 py-2">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-bold text-on-surface">
            {hostingEvents.length + attendingEvents.length}
          </span>
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-on-surface-variant/60">upcoming</span>
        </div>
      </div>

      {/* ── Segmented Tab Bar */}
      <div className="flex rounded-2xl bg-surface-container-high/30 border border-white/[0.04] p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all duration-150",
              activeTab === tab.id
                ? "bg-surface-container-highest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-black",
                activeTab === tab.id
                  ? "bg-primary text-[#480d00]"
                  : "bg-white/[0.08] text-on-surface-variant",
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Going / Attending */}
      {activeTab === "attending" && (
        <div>
          {/* Mobile list view */}
          <div className="block md:hidden">
            {attendingEventsQuery.isLoading ? (
              <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                {Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}
              </div>
            ) : attendingEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(attendingEventsQuery.error, "Unable to load attending events.")} tone="danger" />
            ) : !attendingEvents.length ? (
              <EmptyState
                emoji="🎉"
                title="Nothing in your calendar"
                subtitle="Discover spontaneous events happening near you and grab a spot."
                actionHref="/discover"
                actionLabel="Discover Events"
              />
            ) : (
              <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                {attendingEvents.map((event) => (
                  <EventListRow
                    key={event.eventId}
                    event={event}
                    onCoHostPress={() => setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop grid view */}
          <div className="hidden md:block">
            {attendingEventsQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="h-80 animate-pulse rounded-3xl bg-surface-container-low" key={i} />
                ))}
              </div>
            ) : attendingEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(attendingEventsQuery.error, "Unable to load attending events.")} tone="danger" />
            ) : !attendingEvents.length ? (
              <EmptyState
                emoji="🎉"
                title="Nothing in your calendar"
                subtitle="Discover spontaneous events happening near you and grab a spot."
                actionHref="/discover"
                actionLabel="Discover Events"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {attendingEvents.map((event) => (
                  <EventPosterCard
                    badgeLabel={getEventMonthDay(event)}
                    description={getEventDescription(event)}
                    eventId={event.eventId}
                    footerLabel={getStatusPill(event).label}
                    href={`/events/${event.inviteToken}`}
                    key={event.eventId}
                    location={getShortLocation(event)}
                    title={getEventTitle(event)}
                    overlayAction={
                      <button
                        aria-label="View co-host profiles"
                        className="inline-flex items-center gap-1 rounded-full bg-primary/90 hover:bg-primary px-2.5 py-1 text-[0.58rem] font-bold text-on-primary-container shadow-sm transition-transform active:scale-95 cursor-pointer"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) }); }}
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
        </div>
      )}

      {/* ── Tab: Hosting */}
      {activeTab === "hosting" && (
        <div>
          {/* Mobile list view */}
          <div className="block md:hidden">
            {hostingEventsQuery.isLoading ? (
              <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                {Array.from({ length: 3 }).map((_, i) => <ListRowSkeleton key={i} />)}
              </div>
            ) : hostingEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(hostingEventsQuery.error, "Unable to load hosting events.")} tone="danger" />
            ) : !hostingEvents.length ? (
              <EmptyState
                emoji="✨"
                title="Not hosting anything yet"
                subtitle="Create and broadcast your own spontaneous experience."
                actionHref="/host"
                actionLabel="Host an Event"
              />
            ) : (
              <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                {hostingEvents.map((event) => (
                  <EventListRow
                    key={event.eventId}
                    event={event}
                    onCoHostPress={() => setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop grid view */}
          <div className="hidden md:block">
            {hostingEventsQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="h-80 animate-pulse rounded-3xl bg-surface-container-low" key={i} />
                ))}
              </div>
            ) : hostingEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(hostingEventsQuery.error, "Unable to load hosting events.")} tone="danger" />
            ) : !hostingEvents.length ? (
              <EmptyState
                emoji="✨"
                title="Not hosting anything yet"
                subtitle="Create and broadcast your own spontaneous experience."
                actionHref="/host"
                actionLabel="Host an Event"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hostingEvents.map((event) => (
                  <EventPosterCard
                    badgeLabel={getEventMonthDay(event)}
                    description={getEventDescription(event)}
                    eventId={event.eventId}
                    footerLabel={getStatusPill(event).label}
                    href={`/events/${event.inviteToken}`}
                    key={event.eventId}
                    location={getShortLocation(event)}
                    title={getEventTitle(event)}
                    overlayAction={
                      <button
                        aria-label="View co-host profiles"
                        className="inline-flex items-center gap-1 rounded-full bg-primary/90 hover:bg-primary px-2.5 py-1 text-[0.58rem] font-bold text-on-primary-container shadow-sm transition-transform active:scale-95 cursor-pointer"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) }); }}
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
        </div>
      )}

      {/* ── Tab: History */}
      {activeTab === "history" && (
        <div>
          {/* Mobile list view */}
          <div className="block md:hidden">
            {pastEventsQuery.isLoading ? (
              <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                {Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}
              </div>
            ) : pastEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(pastEventsQuery.error, "Unable to load past events.")} tone="danger" />
            ) : !pastEvents.length ? (
              <div className="text-center py-14 px-6 rounded-3xl bg-surface-container/20 border border-white/[0.03]">
                <p className="text-3xl mb-3">📖</p>
                <p className="text-sm font-semibold text-on-surface">Your archive is empty</p>
                <p className="mt-1 text-xs text-on-surface-variant">Events you attend will appear here once they end.</p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl bg-surface-container/30 border border-white/[0.03] px-4 divide-y divide-white/[0.04]">
                  {pastEvents.map((event) => (
                    <PastEventListRow key={event.inviteToken} event={event} />
                  ))}
                </div>
                {pastEventsQuery.hasNextPage ? (
                  <div className="mt-5 flex justify-center">
                    <button
                      className="rounded-full bg-surface-container-high border border-white/[0.04] px-6 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                      disabled={pastEventsQuery.isFetchingNextPage}
                      onClick={() => void pastEventsQuery.fetchNextPage()}
                      type="button"
                    >
                      {pastEventsQuery.isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Desktop grid view */}
          <div className="hidden md:block">
            {pastEventsQuery.isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="h-80 animate-pulse rounded-3xl bg-surface-container-low" key={i} />
                ))}
              </div>
            ) : pastEventsQuery.isError ? (
              <QueryNotice message={getApiErrorMessage(pastEventsQuery.error, "Unable to load past events.")} tone="danger" />
            ) : !pastEvents.length ? (
              <div className="rounded-[1.5rem] bg-surface-container p-6 text-sm text-on-surface-variant">
                No past events recorded in your history.
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="rounded-full bg-surface-container-high border border-white/[0.04] px-6 py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
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
        </div>
      )}

      {/* Co-host modal */}
      {coHostModal ? (
        <CoHostProfilesModal
          onClose={() => setCoHostModal(null)}
          title={coHostModal.title}
          token={coHostModal.token}
        />
      ) : null}
    </div>
  );
}
