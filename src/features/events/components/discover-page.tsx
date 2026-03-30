"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Search } from "lucide-react";
import { useMemo } from "react";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useEvents } from "@/features/events/hooks/use-events";
import type { EventItem } from "@/features/events/types/event.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

const posterThemes = [
  "from-[#180c23] via-[#5a2d7d] to-[#09090c]",
  "from-[#2f98a4] via-[#3e8999] to-[#1f3d52]",
  "from-[#cbc88e] via-[#a7a765] to-[#5d6844]",
  "from-[#08130d] via-[#0b231a] to-[#020706]",
  "from-[#376d77] via-[#2b6d75] to-[#183640]",
  "from-[#10131e] via-[#1c2d40] to-[#071018]",
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
  const distance = Math.abs(event.latitude - event.longitude) % 5;
  return `${distance.toFixed(1)} mi`;
};

const formatPrice = (event: EventItem) => {
  if (event.visibility === "PUBLIC" || event.maxParticipants >= 20) {
    return "FREE";
  }

  return `$${Math.max(20, event.maxParticipants * 4).toFixed(2)}`;
};

const getAttendeeCount = (event: EventItem) => {
  const derived = Math.max(8, Math.min(event.maxParticipants, Math.round(event.maxParticipants * 0.72)));
  return `+${derived}`;
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
  const price = formatPrice(event);
  const theme = posterThemes[index % posterThemes.length];

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-surface-container-low transition-colors duration-300 hover:bg-surface-container"
      href={`/events/${event.inviteToken}`}
    >
      <div className={cn("relative aspect-[4/4.2] overflow-hidden bg-gradient-to-br", theme)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_24%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_72%_82%,rgba(255,143,112,0.18),transparent_22%)]" />
        <button
          className="absolute right-3 top-3 rounded-full bg-surface/40 p-1.5 text-on-surface transition-colors hover:bg-primary hover:text-on-primary-container"
          type="button"
        >
          <Bookmark className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-tertiary">
            {category}
          </span>
          <span
            className={cn(
              "inline-flex rounded-lg px-2 py-1 text-[0.7rem] font-black",
              price === "FREE" ? "bg-primary text-on-primary-container" : "bg-surface-container-highest text-on-surface",
            )}
          >
            {price}
          </span>
        </div>

        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-[1.05rem] font-bold leading-tight text-on-surface transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          <span className="shrink-0 pt-0.5 text-[0.72rem] font-medium text-on-surface-variant">{formatDistance(event)}</span>
        </div>

        <p className="mb-3 line-clamp-3 text-[0.8rem] leading-relaxed text-on-surface-variant">{event.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-on-surface">
            <CalendarDays className="h-3 w-3 text-primary" />
            <span>{formatSchedule(event.startTime)}</span>
          </div>

          <div className="flex -space-x-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary ring-2 ring-surface-container-low">
              {getInitials(event.creator.name || "AA")}
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-tertiary/20 text-[8px] font-bold text-tertiary ring-2 ring-surface-container-low">
              SP
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest text-[7px] font-bold text-on-surface ring-2 ring-surface-container-low">
              {getAttendeeCount(event)}
            </div>
          </div>
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
