import Link from "next/link";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const attendeeAvatarColors = [
  "from-[#ff8f70] to-[#ff6a42]",
  "from-[#bebeff] to-[#9696ff]",
  "from-[#7ed7c1] to-[#58a08f]",
  "from-[#f4b16f] to-[#d68b3d]",
];

function AttendeeStack({ eventId }: { eventId: string }) {
  return (
    <div className="flex -space-x-1.5">
      {attendeeAvatarColors.slice(0, 3).map((colorClassName, index) => (
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border border-surface text-[0.52rem] font-bold text-white",
            "bg-gradient-to-br",
            colorClassName,
          )}
          key={`${eventId}-${index}`}
        >
          {index + 1}
        </div>
      ))}
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-surface-container-high text-[0.5rem] font-bold text-on-surface">
        +{Math.max(1, Math.min(99, 1 + (eventId.length % 24)))}
      </div>
    </div>
  );
}

type EventPosterCardProps = {
  href: string;
  title: string;
  location: string;
  description?: string;
  badgeLabel: string;
  footerLabel: string;
  eventId?: string;
  className?: string;
  overlayAction?: ReactNode;
  isMuted?: boolean;
};

export function EventPosterCard({
  href,
  title,
  location,
  description,
  badgeLabel,
  footerLabel,
  eventId,
  className,
  overlayAction,
  isMuted = false,
}: EventPosterCardProps) {
  return (
    <Link
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-surface-container/60 border border-white/[0.04] transition-all duration-200 active:scale-[0.98] lg:hover:-translate-y-1 lg:hover:border-white/[0.1] lg:hover:bg-surface-container",
        isMuted && "opacity-75 grayscale hover:grayscale-0 hover:opacity-100",
        className,
      )}
      href={href}
    >
      {overlayAction ? <div className="absolute left-4 top-4 z-20">{overlayAction}</div> : null}
      <div className="relative h-44 overflow-hidden bg-surface-container-high/40 border-b border-white/[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,143,112,0.14),transparent_25%),radial-gradient(circle_at_78%_26%,rgba(113,122,255,0.1),transparent_22%)]" />
        <div className="absolute right-4 top-4 rounded-xl bg-[#0e0e0e]/70 px-3 py-1.5 backdrop-blur-md border border-white/[0.06]">
          <p className="text-[0.68rem] font-bold text-white uppercase tracking-wider">{badgeLabel}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-headline text-base font-bold text-on-surface transition-colors group-hover:text-primary leading-tight">{title}</h3>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-on-surface-variant/80">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{location}</span>
        </p>
        {description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-on-surface-variant/70">{description}</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-white/[0.03]">
          {eventId ? (
            <AttendeeStack eventId={eventId} />
          ) : (
            <div className="h-6" />
          )}
          <span className="text-[0.58rem] font-bold uppercase tracking-wider text-tertiary">{footerLabel}</span>
        </div>
      </div>
    </Link>
  );
}
