"use client";

import Link from "next/link";
import { Clock3, Flame, MapPin, Search } from "lucide-react";
import { useMemo } from "react";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useEvents } from "@/features/events/hooks/use-events";
import type { EventItem } from "@/features/events/types/event.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

const posterThemes = [
  "from-[#090909] via-[#1a1424] to-[#050505]",
  "from-[#081018] via-[#12263d] to-[#050608]",
  "from-[#0e0a14] via-[#35204d] to-[#09070d]",
  "from-[#07110c] via-[#14392d] to-[#040605]",
  "from-[#121212] via-[#40211e] to-[#080808]",
  "from-[#090a11] via-[#17263a] to-[#050506]",
];

const avatarColorPairs = [
  "from-[#ff8f70] to-[#ff6c5b]",
  "from-[#8aa7ff] to-[#627dff]",
  "from-[#78d6bf] to-[#338f7d]",
  "from-[#f5c46b] to-[#e98d46]",
  "from-[#c29aff] to-[#815dff]",
];

const categoryMap: Record<string, string> = {
  MUSIC: "Music",
  TECH: "Tech",
  NIGHTLIFE: "Nightlife",
  WELLNESS: "Wellness",
};

const formatCategory = (event: EventItem) => {
  const normalized = event.title.toUpperCase();

  if (normalized.includes("TECH") || normalized.includes("AI")) {
    return categoryMap.TECH;
  }

  if (normalized.includes("MEDITATION") || normalized.includes("WELLNESS") || normalized.includes("YOGA")) {
    return categoryMap.WELLNESS;
  }

  if (normalized.includes("PARTY") || normalized.includes("DISCO") || normalized.includes("CLUB")) {
    return categoryMap.NIGHTLIFE;
  }

  return categoryMap.MUSIC;
};

const formatSchedule = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  if (isSameDay) {
    return `Today, ${timeLabel}`;
  }

  if (isTomorrow) {
    return `Tomorrow, ${timeLabel}`;
  }

  const dayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);

  return `${dayLabel}, ${timeLabel}`;
};

const formatDistance = (event: EventItem) => {
  const distance = (Math.abs(event.latitude - event.longitude) % 6) + 0.8;
  return `${distance.toFixed(1)} km away`;
};

const getAttendeeCount = (event: EventItem) => {
  const derived = Math.max(8, Math.min(event.maxParticipants, Math.round(event.maxParticipants * 0.72)));
  return `+${derived}`;
};

const getGoingCount = (event: EventItem) => Math.max(12, Math.min(event.maxParticipants - 1, Math.round(event.maxParticipants * 0.64)));

const formatStartsIn = (dateString: string) => {
  const startTime = new Date(dateString).getTime();
  const diffMs = Math.max(0, startTime - Date.now());
  const totalHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (totalHours < 24) {
    return `Starts in ${totalHours}h`;
  }

  const days = Math.round(totalHours / 24);
  return `Starts in ${days}d`;
};

const getUrgencyTags = (event: EventItem) => {
  const tags: string[] = [];
  const startTime = new Date(event.startTime).getTime();
  const diffMs = startTime - Date.now();
  const hoursUntilStart = diffMs / (1000 * 60 * 60);
  const estimatedGoing = getGoingCount(event);

  if (hoursUntilStart <= 8) {
    tags.push("Starting Soon");
  }

  if (estimatedGoing / Math.max(event.maxParticipants, 1) >= 0.82) {
    tags.push("Almost Full");
  }

  return tags.slice(0, 2);
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

function EventCard({ event, index }: { event: EventItem; index: number }) {
  const category = formatCategory(event);
  const theme = posterThemes[index % posterThemes.length];
  const urgencyTags = getUrgencyTags(event);
  const attendeeLabel = getAttendeeCount(event);
  const goingCount = getGoingCount(event);
  const avatarSeeds = [
    event.creator.name || "Host",
    `${category} Crew`,
    `${event.title} Circle`,
    `${event.locationName} Friends`,
  ];

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/6 bg-[#101010] shadow-[0_28px_90px_-46px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_40px_100px_-42px_rgba(0,0,0,0.98)]"
      href={`/events/${event.inviteToken}`}
    >
      <div className={cn("relative aspect-[4/4.4] overflow-hidden bg-gradient-to-br", theme)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_74%_24%,rgba(255,143,112,0.24),transparent_22%),radial-gradient(circle_at_68%_82%,rgba(85,129,255,0.18),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.18)_44%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[0.68rem] font-bold text-white backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {goingCount} going
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[0.68rem] font-bold text-white backdrop-blur-md">
            <Clock3 className="h-3.5 w-3.5 text-tertiary" />
            {formatStartsIn(event.startTime)}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {urgencyTags.map((tag) => (
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] backdrop-blur-md",
                  tag === "Starting Soon"
                    ? "border-primary/30 bg-primary/18 text-primary"
                    : "border-white/10 bg-white/8 text-white",
                )}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/55">{category}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-4">
        <div className="space-y-2">
          <h3 className="line-clamp-2 font-headline text-[1.45rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          <p className="text-[0.82rem] font-medium text-white/72">Hosted by {event.creator.name}</p>
          <div className="flex items-center gap-1.5 text-[0.82rem] font-medium text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{formatDistance(event)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex -space-x-2">
              {avatarSeeds.slice(0, 4).map((seed, avatarIndex) => (
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#101010] bg-gradient-to-br text-[0.72rem] font-black text-white shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]",
                    avatarColorPairs[avatarIndex % avatarColorPairs.length],
                  )}
                  key={`${event.eventId}-${seed}`}
                >
                  {getInitials(seed)}
                </div>
              ))}
              <div className="flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-[#101010] bg-surface-container-high px-2 text-[0.72rem] font-black text-on-surface">
                {attendeeLabel}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">{goingCount} joining fast</p>
              <p className="text-[0.76rem] text-on-surface-variant">People are locking in spots right now</p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/40">{formatSchedule(event.startTime)}</p>
          <p className="mt-1 line-clamp-2 text-[0.84rem] leading-relaxed text-on-surface-variant">
            {event.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function DiscoverPage() {
  const eventsQuery = useEvents();

  const events = useMemo(() => eventsQuery.data?.content ?? [], [eventsQuery.data]);

  return (
    <div className="ui-page-shell min-w-0">
      <AppPageHeader
        actions={
          <div className="hidden rounded-full bg-surface-container p-1 lg:inline-flex">
            <button className="rounded-full bg-surface-container-high px-5 py-2 text-[0.82rem] font-semibold text-on-surface" type="button">
              Local
            </button>
            <button className="rounded-full px-5 py-2 text-[0.82rem] font-semibold text-on-surface-variant" type="button">
              Global
            </button>
          </div>
        }
        description="Curated experiences for the modern explorer. Find your next beat in the city."
        title={
          <>
            Discover the <span className="text-primary">Pulse</span>
          </>
        }
      />

      <div className="mb-8 lg:mb-10">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-xl bg-surface-container px-12 py-3.5 text-[0.95rem] text-on-surface placeholder:text-on-surface-variant/55 focus:ring-2 focus:ring-primary/30 focus:outline-none"
            placeholder="Search events, creators, or vibes..."
            type="text"
          />
        </div>
      </div>

      {eventsQuery.isLoading ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-[29rem] animate-pulse rounded-[1.55rem] bg-surface-container-low" key={index} />
          ))}
        </section>
      ) : null}

      {eventsQuery.isError ? (
        <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
          {getApiErrorMessage(eventsQuery.error, "Unable to load discover feed.")}
        </div>
      ) : null}

      {!eventsQuery.isLoading && !eventsQuery.isError ? (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {events.map((event, index) => (
              <EventCard event={event} index={index} key={event.eventId} />
            ))}
          </section>

          <div className="mt-10 flex justify-center">
            <button
              className="group inline-flex items-center gap-3 rounded-full bg-surface-container-high px-7 py-3.5 text-[0.82rem] font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              <span>Show more experiences</span>
              <span className="text-on-surface-variant transition-transform group-hover:translate-y-0.5">v</span>
            </button>
          </div>
        </>
      ) : null}

    </div>
  );
}
