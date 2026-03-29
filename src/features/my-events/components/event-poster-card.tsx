import Image from "next/image";
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
    <div className="flex -space-x-2">
      {attendeeAvatarColors.slice(0, 3).map((colorClassName, index) => (
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-[0.54rem] font-bold text-white",
            "bg-gradient-to-br",
            colorClassName,
          )}
          key={`${eventId}-${index}`}
        >
          {index + 1}
        </div>
      ))}
      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-surface-container-high text-[0.5rem] font-bold text-on-surface">
        +{Math.max(1, Math.min(99, 1 + (eventId.length % 24)))}
      </div>
    </div>
  );
}

type EventPosterCardProps = {
  href: string;
  title: string;
  location: string;
  description: string;
  imageSrc: string;
  badgeLabel: string;
  footerLabel: string;
  eventId: string;
  className?: string;
  overlayAction?: ReactNode;
};

export function EventPosterCard({
  href,
  title,
  location,
  description,
  imageSrc,
  badgeLabel,
  footerLabel,
  eventId,
  className,
  overlayAction,
}: EventPosterCardProps) {
  return (
    <Link
      className={cn("group relative flex flex-col overflow-hidden rounded-[2rem] bg-surface-container", className)}
      href={href}
    >
      {overlayAction ? <div className="absolute left-4 top-4 z-20">{overlayAction}</div> : null}
      <div className="relative h-48 overflow-hidden">
        <Image alt={title} className="object-cover transition-transform duration-700 group-hover:scale-105" fill sizes="320px" src={imageSrc} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/35 to-transparent" />
        <div className="absolute right-4 top-4 rounded-xl bg-[#0e0e0e]/80 px-3 py-1 backdrop-blur-md">
          <p className="text-xs font-bold text-white">{badgeLabel}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface transition-colors group-hover:text-primary">{title}</h3>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-on-surface-variant">{description}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <AttendeeStack eventId={eventId} />
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-tertiary">{footerLabel}</span>
        </div>
      </div>
    </Link>
  );
}
