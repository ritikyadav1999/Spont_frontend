"use client";

import Link from "next/link";
import { MapPin, Search, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useEvents } from "@/features/events/hooks/use-events";
import type { EventItem } from "@/features/events/types/event.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

// ─── Visual themes ──────────────────────────────────────────────────────────
const cardThemes = [
  { bg: "from-[#1a0a00] via-[#3d1800] to-[#0f0500]", glow: "rgba(255,120,60,0.35)", accent: "#ff8f70" },
  { bg: "from-[#000d1a] via-[#001f3f] to-[#000810]", glow: "rgba(80,140,255,0.3)", accent: "#8aa7ff" },
  { bg: "from-[#0d001a] via-[#280040] to-[#070009]", glow: "rgba(160,100,255,0.3)", accent: "#c29aff" },
  { bg: "from-[#001a0d] via-[#003320] to-[#000d07]", glow: "rgba(60,200,140,0.28)", accent: "#78d6bf" },
  { bg: "from-[#1a0a00] via-[#2e1900] to-[#0a0400]", glow: "rgba(240,180,80,0.28)", accent: "#f5c46b" },
  { bg: "from-[#0a001a] via-[#1a0035] to-[#050009]", glow: "rgba(190,190,255,0.28)", accent: "#bebeff" },
];

const avatarPalette = [
  "from-[#ff8f70] to-[#e05a38]",
  "from-[#bebeff] to-[#8a8aff]",
  "from-[#78d6bf] to-[#3a9a82]",
  "from-[#f5c46b] to-[#d48c2a]",
  "from-[#c29aff] to-[#7a4adf]",
  "from-[#ff8fa8] to-[#d44068]",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFirstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

const getInitials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  const diffH = (d.getTime() - Date.now()) / 3_600_000;
  if (diffH < 0)  return "Live now";
  if (diffH < 1)  return `In ${Math.round(diffH * 60)}m`;
  if (diffH < 24) return `In ${Math.round(diffH)}h`;
  if (diffH < 48) return "Tomorrow";
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", hour: "numeric" }).format(d);
};

// ─── Social proof ─────────────────────────────────────────────────────────────
const NAMES = ["Arjun", "Priya", "Rahul", "Ananya", "Kiran", "Sneha", "Rohan", "Divya", "Aditya", "Meera"];

const getSocialProof = (e: EventItem, idx: number) => {
  const going    = Math.max(4, Math.min(e.maxParticipants - 1, Math.round(e.maxParticipants * 0.62)));
  const left     = Math.max(1, e.maxParticipants - going);
  const person   = NAMES[(idx * 3 + e.title.length) % NAMES.length]!;
  const others   = going - 1;
  const hostName = getFirstName(e.creator.name);

  const primary = [
    `${person} and ${others} others are going`,
    `${going} people joined today`,
    `${hostName} is hosting · ${going} going`,
    `${person} just joined · ${others} going`,
  ][idx % 4]!;

  const secondary = left <= 5
    ? `🔥 ${left} spots left`
    : going > 20
      ? "Trending nearby"
      : e.joinMode === "OPEN"
        ? "Open · Join now"
        : `${left} spots open`;

  return { primary, secondary, going, left };
};

// ─── Avatar Stack ─────────────────────────────────────────────────────────────
function AvatarStack({ seeds, accent }: { seeds: string[]; accent: string }) {
  return (
    <div className="flex -space-x-2.5">
      {seeds.slice(0, 3).map((s, i) => (
        <div
          key={`${s}-${i}`}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0f0f0f] bg-gradient-to-br text-[0.56rem] font-black text-white",
            avatarPalette[i % avatarPalette.length],
          )}
        >
          {getInitials(s)}
        </div>
      ))}
      <div
        className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-[#0f0f0f] px-1.5 text-[0.52rem] font-black"
        style={{ background: `${accent}22`, color: accent }}
      >
        +{Math.max(2, seeds.length * 4)}
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, index }: { event: EventItem; index: number }) {
  const theme    = cardThemes[index % cardThemes.length]!;
  const { primary, secondary, left } = getSocialProof(event, index);
  const when     = formatWhen(event.startTime);
  // eslint-disable-next-line react-hooks/purity
  const urgent   = new Date(event.startTime).getTime() - Date.now() < 8 * 3_600_000;
  const almostFull = left <= 5;

  const seeds = [
    event.creator.name,
    getFirstName(event.creator.name) + " crew",
    event.locationName.split(",")[0] ?? "Local",
    event.title.split(" ")[0] ?? "Spont",
  ];

  return (
    <Link
      href={`/events/${event.inviteToken}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.55rem] border border-white/[0.06] bg-[#0f0f0f] transition-transform duration-150 active:scale-[0.97] lg:hover:-translate-y-0.5 lg:hover:border-white/[0.13]"
    >
      {/* Artwork */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br",
          theme.bg,
          "aspect-[4/4] lg:aspect-[4/3.4]",
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 26% 26%, ${theme.glow}, transparent 44%),
                         radial-gradient(circle at 74% 74%, ${theme.glow.replace(/[\d.]+\)$/, "0.14)")}, transparent 40%)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0.86)_100%)]" />

        {/* Top row: urgency + time */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <div>
            {urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/22 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-primary backdrop-blur-md">
                <Zap className="h-2.5 w-2.5" />
                Soon
              </span>
            )}
            {almostFull && !urgent && (
              <span className="inline-flex rounded-full bg-white/[0.12] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white/90 backdrop-blur-md">
                Almost full
              </span>
            )}
          </div>
          <span className="rounded-full bg-black/52 px-2 py-0.5 text-[0.62rem] font-semibold text-white/75 backdrop-blur-md">
            {when}
          </span>
        </div>

        {/* Bottom overlay: title + location + avatars */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className="font-headline text-[1.18rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white transition-colors duration-100 group-hover:text-primary lg:text-[1.25rem]"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.95)" }}
              >
                {event.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[0.71rem] text-white/55">
                <MapPin className="h-2.5 w-2.5 shrink-0" style={{ color: theme.accent }} />
                {event.locationName.split(",")[0]}
              </p>
            </div>
            <AvatarStack seeds={seeds} accent={theme.accent} />
          </div>
        </div>
      </div>

      {/* Social proof strip */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.78rem] font-semibold text-on-surface">{primary}</p>
          <p
            className="mt-0.5 truncate text-[0.7rem] font-medium"
            style={{ color: almostFull || urgent ? theme.accent : "var(--on-surface-variant)" }}
          >
            {secondary}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
          style={{ background: `${theme.accent}18`, color: theme.accent }}
        >
          {event.joinMode === "OPEN" ? "Open" : "Invite"}
        </span>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.55rem] bg-surface-container-low">
      <div className="aspect-[4/4] animate-pulse bg-surface-container lg:aspect-[4/3.4]" />
      <div className="space-y-2 px-3 py-2.5">
        <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-surface-container" />
        <div className="h-2 w-1/2 animate-pulse rounded-full bg-surface-container" />
      </div>
    </div>
  );
}

// ─── Discover Page ────────────────────────────────────────────────────────────
export function DiscoverPage() {
  const eventsQuery = useEvents();
  const [searchValue, setSearchValue] = useState("");

  const allEvents = useMemo(() => eventsQuery.data?.content ?? [], [eventsQuery.data]);

  const filteredEvents = useMemo(() => {
    let result = allEvents;
    if (searchValue.trim()) {
      const q = searchValue.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.locationName.toLowerCase().includes(q) ||
          e.creator.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allEvents, searchValue]);

  return (
    <div className="min-w-0">
      {/* ── Search bar ── */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[1.05rem] w-[1.05rem] -translate-y-1/2 text-on-surface-variant/50" />
        <input
          aria-label="Search events"
          className="w-full rounded-2xl bg-surface-container py-[0.65rem] pl-[2.3rem] pr-4 text-[0.88rem] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/25"
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Events, people, places…"
          type="text"
          value={searchValue}
        />
      </div>

      {/* ── Loading state ── */}
      {eventsQuery.isLoading && (
        <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* ── Error state ── */}
      {eventsQuery.isError && (
        <div className="rounded-2xl bg-rose-500/10 px-4 py-3.5 text-[0.82rem] text-rose-200">
          {getApiErrorMessage(eventsQuery.error, "Unable to load events.")}
        </div>
      )}

      {/* ── Feed ── */}
      {!eventsQuery.isLoading && !eventsQuery.isError && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-3xl">🌆</p>
              <p className="mt-3 font-semibold text-on-surface">Nothing here yet</p>
              <p className="mt-1 text-[0.82rem] text-on-surface-variant">
                {searchValue ? "Try a different search" : "Quiet for now — check back soon"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredEvents.map((event, i) => (
                  <EventCard event={event} index={i} key={event.eventId} />
                ))}
              </div>

              {/* Load more — subtle */}
              {filteredEvents.length >= 10 && (
                <button
                  type="button"
                  className="mt-2 w-full rounded-2xl border border-white/[0.07] bg-surface-container py-3 text-[0.8rem] font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  Load more events
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
