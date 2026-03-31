 "use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  UserRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
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

function getPastEventLocation(event: PastEventSummary) {
  return event.location?.trim() || "Location TBA";
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

function SectionHeading({
  title,
  accentClassName,
  action,
}: {
  title: string;
  accentClassName: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-3 font-headline text-[1.75rem] font-bold text-on-surface">
          <span className={cn("h-8 w-2 rounded-full", accentClassName)} />
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function SectionScrollerControls({
  onPrevious,
  onNext,
  disabled,
  previousLabel,
  nextLabel,
}: {
  onPrevious: () => void;
  onNext: () => void;
  disabled: boolean;
  previousLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex gap-2.5">
      <button
        aria-label={previousLabel}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-on-surface-variant transition-colors hover:bg-white/[0.03] hover:text-on-surface disabled:opacity-40"
        disabled={disabled}
        onClick={onPrevious}
        type="button"
      >
        <ChevronLeft className="h-[1.05rem] w-[1.05rem]" />
      </button>
      <button
        aria-label={nextLabel}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-on-surface-variant transition-colors hover:bg-white/[0.03] hover:text-on-surface disabled:opacity-40"
        disabled={disabled}
        onClick={onNext}
        type="button"
      >
        <ChevronRight className="h-[1.05rem] w-[1.05rem]" />
      </button>
    </div>
  );
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
        "rounded-[1.75rem] border px-6 py-5",
        tone === "danger"
          ? "border-rose-400/15 bg-rose-500/10 text-rose-100"
          : "border-white/6 bg-surface-container-low text-on-surface-variant",
      )}
    >
      <p className="text-sm leading-6">{message}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/18"
          href={actionHref}
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" />
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
    <div className="rounded-full bg-surface-container-high px-6 py-3">
      <div className="flex items-center gap-2">
        <span className={cn("text-base font-bold", valueClassName)}>{value}</span>
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-on-surface-variant">{label}</span>
      </div>
    </div>
  );
}

function PageHero({
  upcomingCount,
  archiveCount,
}: {
  upcomingCount: number;
  archiveCount: number;
}) {
  return (
    <header className="mb-12 flex flex-col justify-between gap-8 border-b border-white/8 pb-8 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <h1 className="font-headline text-5xl font-extrabold tracking-[-0.06em] text-on-surface sm:text-6xl">
          My <span className="italic text-primary">Pulse</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <HeaderStat label="Upcoming" value={upcomingCount} valueClassName="text-primary" />
        <HeaderStat label="Archive" value={archiveCount} valueClassName="text-tertiary" />
      </div>
    </header>
  );
}

function HeroSkeleton() {
  return (
    <div className="mb-12 flex flex-col gap-8 border-b border-white/8 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-4">
        <div className="h-14 w-72 animate-pulse rounded-2xl bg-surface-container-low sm:w-96" />
      </div>
      <div className="flex gap-4">
        <div className="h-12 w-36 animate-pulse rounded-full bg-surface-container-low" />
        <div className="h-12 w-36 animate-pulse rounded-full bg-surface-container-low" />
      </div>
    </div>
  );
}

function HostingEmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-white/6 bg-surface-container-low px-6 py-5">
      <Link
        className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/18"
        href="/host"
      >
        Host Event
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function HostingSection({
  events,
  loading,
  error,
  onShowCoHosts,
}: {
  events: EventItem[];
  loading: boolean;
  error: unknown;
  onShowCoHosts: (event: EventItem) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCardWidth = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -344 : 344,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="mb-20">
        <SectionHeading
          accentClassName="bg-primary"
          title="Hosting"
          action={
            <SectionScrollerControls
              disabled
              nextLabel="Scroll hosting events right"
              onNext={() => {}}
              onPrevious={() => {}}
              previousLabel="Scroll hosting events left"
            />
          }
        />
        <div className="space-y-6">
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-[22rem] w-[20rem] shrink-0 animate-pulse rounded-[2rem] bg-surface-container-low" key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-20">
        <SectionHeading
          accentClassName="bg-primary"
          title="Hosting"
          action={
            <SectionScrollerControls
              disabled
              nextLabel="Scroll hosting events right"
              onNext={() => {}}
              onPrevious={() => {}}
              previousLabel="Scroll hosting events left"
            />
          }
        />
        <QueryNotice message={getApiErrorMessage(error, "Unable to load your hosted events.")} tone="danger" />
      </section>
    );
  }

  if (!events.length) {
    return (
      <section className="mb-20">
        <SectionHeading
          accentClassName="bg-primary"
          title="Hosting"
          action={
            <SectionScrollerControls
              disabled
              nextLabel="Scroll hosting events right"
              onNext={() => {}}
              onPrevious={() => {}}
              previousLabel="Scroll hosting events left"
            />
          }
        />
        <HostingEmptyState />
      </section>
    );
  }

  return (
    <section className="mb-20">
      <SectionHeading
        accentClassName="bg-primary"
        title="Hosting"
        action={
          <SectionScrollerControls
            disabled={events.length <= 1}
            nextLabel="Scroll hosting events right"
            onNext={() => scrollByCardWidth("right")}
            onPrevious={() => scrollByCardWidth("left")}
            previousLabel="Scroll hosting events left"
          />
        }
      />
      <div
        className="flex gap-6 overflow-x-auto pb-6 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollerRef}
      >
        {events.map((event) => (
          <EventPosterCard
            badgeLabel={getEventMonthDay(event)}
            className="w-[20rem] shrink-0"
            description={getEventDescription(event)}
            eventId={event.eventId}
            footerLabel={getAttendanceState(event)}
            href={`/events/${event.inviteToken}`}
            key={event.eventId}
            location={getShortLocation(event)}
            overlayAction={
              <button
                aria-label="View co-host profiles"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.64rem] font-bold text-on-primary-container shadow-[0_10px_22px_-12px_rgba(255,143,112,0.95)] transition-transform hover:scale-[1.03]"
                onClick={(eventClick) => {
                  eventClick.preventDefault();
                  eventClick.stopPropagation();
                  onShowCoHosts(event);
                }}
                title="View co-host profiles"
                type="button"
              >
                <UserRound className="h-3.5 w-3.5" />
                Co-hosts
              </button>
            }
            title={getEventTitle(event)}
          />
        ))}
      </div>
    </section>
  );
}

function AttendingCard({ event, overlayAction }: { event: EventItem; overlayAction?: ReactNode }) {
  return (
    <EventPosterCard
      badgeLabel={getEventMonthDay(event)}
      className="w-[20rem] shrink-0"
      description={getEventDescription(event)}
      eventId={event.eventId}
      footerLabel={getAttendanceState(event)}
      href={`/events/${event.inviteToken}`}
      location={getShortLocation(event)}
      overlayAction={overlayAction}
      title={getEventTitle(event)}
    />
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 px-4">
      <div className="w-full max-w-md rounded-[1.8rem] bg-surface-container p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-bold text-on-surface">Co-Hosts</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{title}</p>
          </div>
          <button
            aria-label="Close co-host profiles"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {coHostsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-14 animate-pulse rounded-xl bg-surface-container-high" key={index} />
            ))}
          </div>
        ) : null}

        {coHostsQuery.isError ? (
          <QueryNotice message={getApiErrorMessage(coHostsQuery.error, "Unable to load co-host profiles.")} tone="danger" />
        ) : null}

        {!coHostsQuery.isLoading && !coHostsQuery.isError && !coHosts.length ? (
          <div className="rounded-xl bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">No co-host assigned.</div>
        ) : null}

        {!coHostsQuery.isLoading && !coHostsQuery.isError && coHosts.length ? (
          <div className="space-y-2">
            {coHosts.map((coHost) => (
              <div className="flex items-center justify-between rounded-xl bg-surface-container-high px-4 py-3" key={`${coHost.userId ?? coHost.name}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-xs font-black text-primary">
                    {coHost.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("")}
                  </div>
                  <p className="truncate text-sm font-semibold text-on-surface">{coHost.name}</p>
                </div>
                {coHost.userId ? (
                  <Link
                    className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-surface-container-highest"
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

function AttendingSection({
  events,
  loading,
  error,
  onShowCoHosts,
}: {
  events: EventItem[];
  loading: boolean;
  error: unknown;
  onShowCoHosts: (event: EventItem) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCardWidth = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -344 : 344,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-20">
      <SectionHeading
        accentClassName="bg-tertiary"
        title="Attending"
        action={
          <SectionScrollerControls
            disabled={events.length <= 1}
            nextLabel="Scroll attending events right"
            onNext={() => scrollByCardWidth("right")}
            onPrevious={() => scrollByCardWidth("left")}
            previousLabel="Scroll attending events left"
          />
        }
      />

      {loading ? (
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-[22rem] w-[20rem] shrink-0 animate-pulse rounded-[2rem] bg-surface-container-low" key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <QueryNotice message={getApiErrorMessage(error, "Unable to load the events you are attending.")} tone="danger" />
      ) : null}

      {!loading && !error && !events.length ? (
        <QueryNotice actionHref="/discover" actionLabel="Join New Events" message="Please join new events." />
      ) : null}

      {!loading && !error && events.length ? (
        <div
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={scrollerRef}
        >
          {events.map((event) => (
            <AttendingCard
              event={event}
              key={event.eventId}
              overlayAction={
                <button
                  aria-label="View co-host profiles"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[0.64rem] font-bold text-on-primary-container shadow-[0_10px_22px_-12px_rgba(255,143,112,0.95)] transition-transform hover:scale-[1.03]"
                  onClick={(eventClick) => {
                    eventClick.preventDefault();
                    eventClick.stopPropagation();
                    onShowCoHosts(event);
                  }}
                  title="View co-host profiles"
                  type="button"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Co-hosts
                </button>
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PastEventRow({
  event,
}: {
  event: PastEventSummary;
}) {
  return (
    <Link
      className="group flex flex-col gap-5 rounded-[2rem] border border-transparent bg-surface-container-low p-6 transition-all hover:border-white/5 hover:bg-surface-container-high md:flex-row md:items-center"
      href={`/events/${event.inviteToken}`}
    >
      <p className="w-24 shrink-0 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-surface-variant">
        {getPastEventMonthDay(event)}
      </p>

      <div className="min-w-0 flex-1">
        <h3 className="font-headline text-lg font-bold text-on-surface transition-colors group-hover:text-primary">
          {event.title?.trim() || "Untitled Event"}
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">{getPastEventLocation(event)}</p>
      </div>

      <div className="flex items-center justify-end gap-4 md:w-auto">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function MemoryLaneSection({
  events,
  loading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  events: PastEventSummary[];
  loading: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <section className="mb-12">
      <SectionHeading
        accentClassName="bg-[#5f5f64]"
        title="Memory Lane"
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[2rem] bg-surface-container-low" key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <QueryNotice message={getApiErrorMessage(error, "Unable to load your past events.")} tone="danger" />
      ) : null}

      {!loading && !error && !events.length ? (
        null
      ) : null}

      {!loading && !error && events.length ? (
        <>
          <div className="space-y-4">
            {events.map((event) => (
              <PastEventRow event={event} key={event.inviteToken} />
            ))}
          </div>

          {hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <button
                className="rounded-full bg-surface-container-high px-7 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                disabled={isFetchingNextPage}
                onClick={onLoadMore}
                type="button"
              >
                {isFetchingNextPage ? "Loading..." : "Load More History"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function MyEventsPage() {
  const [coHostModal, setCoHostModal] = useState<{ token: string; title: string } | null>(null);
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
    <div className="ui-page-shell ui-page-shell--medium pb-20">
      {showHeroSkeleton ? (
        <HeroSkeleton />
      ) : (
        <PageHero archiveCount={pastEvents.length} upcomingCount={upcomingCount} />
      )}

      <HostingSection
        error={hostingEventsQuery.error}
        events={hostingEvents}
        loading={hostingEventsQuery.isLoading}
        onShowCoHosts={(event) => setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) })}
      />
      <AttendingSection
        error={attendingEventsQuery.error}
        events={attendingEvents}
        loading={attendingEventsQuery.isLoading}
        onShowCoHosts={(event) => setCoHostModal({ token: event.inviteToken, title: getEventTitle(event) })}
      />
      <MemoryLaneSection
        error={pastEventsQuery.error}
        events={pastEvents}
        hasNextPage={Boolean(pastEventsQuery.hasNextPage)}
        isFetchingNextPage={pastEventsQuery.isFetchingNextPage}
        loading={pastEventsQuery.isLoading}
        onLoadMore={() => void pastEventsQuery.fetchNextPage()}
      />
      {coHostModal ? (
        <CoHostProfilesModal onClose={() => setCoHostModal(null)} title={coHostModal.title} token={coHostModal.token} />
      ) : null}
    </div>
  );
}
