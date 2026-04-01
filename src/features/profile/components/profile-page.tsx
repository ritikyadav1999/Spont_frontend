"use client";

import { Share2, SquarePen } from "lucide-react";
import { useMemo } from "react";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMyPastEvents } from "@/features/events/hooks/use-events";
import type { PastEventSummary } from "@/features/events/types/event.types";
import { usePublicProfile } from "@/features/profile/hooks/use-profile";
import { ExperienceCard } from "@/features/profile/components/experience-card";
import { ExperienceFeatureCard } from "@/features/profile/components/experience-feature-card";
import { PushNotificationSettingsCard } from "@/features/notifications/components/push-notification-settings-card";
import type { PublicProfile } from "@/features/profile/types/public-profile.types";
import type { ProfileExperience } from "@/features/profile/types/profile.types";
import { getApiErrorMessage } from "@/lib/utils/api-response";

const getInitials = (name?: string) =>
  (name ?? "Spont User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const experienceThemes = [
  "from-[#101227] via-[#111a43] to-[#0f1220]",
  "from-[#edd68a] via-[#f0d899] to-[#d9be74]",
  "from-[#9ac3c0] via-[#bed4cc] to-[#789694]",
  "from-[#f5d0c2] via-[#efc2b2] to-[#e9b49d]",
  "from-[#07120d] via-[#13231c] to-[#07100d]",
];

const formatPastDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const toExperience = (event: PastEventSummary, index: number): ProfileExperience => ({
  id: event.inviteToken,
  title: event.title,
  date: formatPastDate(event.startTime),
  location: event.location,
  actionLabel: "View Details",
  featured: index === 3,
  theme: experienceThemes[index % experienceThemes.length],
  href: `/events/${event.inviteToken}`,
});

type ProfilePageProps = {
  userId?: string;
};

export function ProfilePage({ userId }: ProfilePageProps) {
  const { user } = useAuth();
  const isPublicProfile = Boolean(userId);
  const publicProfileQuery = usePublicProfile(userId ?? "");
  const myPastEventsQuery = useMyPastEvents(!isPublicProfile);

  const selectedProfile = useMemo<PublicProfile | null>(() => {
    if (isPublicProfile) {
      return publicProfileQuery.data ?? null;
    }

    return user
      ? {
          userId: user.id ?? "",
          name: user.name ?? "Spont User",
          email: user.email,
          phone: user.phone,
          gender: user.gender,
        }
      : null;
  }, [isPublicProfile, publicProfileQuery.data, user]);

  const name = selectedProfile?.name?.trim() || "Spont User";
  const realExperiences = useMemo(
    () => myPastEventsQuery.data?.pages.flatMap((page) => page.data).map(toExperience) ?? [],
    [myPastEventsQuery.data],
  );
  const experienceItems = isPublicProfile ? [] : realExperiences;
  const regularExperiences = experienceItems.filter((experience) => !experience.featured);
  const featuredExperience = experienceItems.find((experience) => experience.featured) ?? null;

  if (isPublicProfile && publicProfileQuery.isLoading) {
    return <div className="h-[36rem] animate-pulse rounded-[1.75rem] bg-surface-container-low" />;
  }

  if (isPublicProfile && publicProfileQuery.isError) {
    return (
      <div className="rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
        {getApiErrorMessage(publicProfileQuery.error, "Unable to load this profile.")}
      </div>
    );
  }

  return (
    <div className="ui-page-shell pb-14">
      <AppPageHeader
        description={isPublicProfile ? "A closer look at this host's rhythm, presence, and archive." : "Your identity and event archive in one place."}
        title="Profile"
      />

      <section className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-12">
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-full bg-[linear-gradient(145deg,rgba(255,143,112,0.26),rgba(190,190,255,0.16))] blur-2xl" />
          <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_24%),linear-gradient(145deg,#17202b,#27384d_48%,#10161f)] ring-4 ring-surface md:h-48 md:w-48">
            <span className="font-headline text-6xl font-black tracking-tight text-white/92 md:text-7xl">{getInitials(name)}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 xl:pt-2">
          <div className="max-w-3xl">
            <h1 className="font-headline text-5xl font-extrabold leading-[0.92] tracking-[-0.05em] text-on-surface xl:text-[5rem]">
              {name}
            </h1>
          </div>
        </div>

        <div className="flex gap-3 xl:flex-col xl:pt-6">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-[0.92rem] font-bold text-on-primary-container transition-transform hover:scale-[1.02]"
            type="button"
          >
            <SquarePen className="h-4 w-4" />
            {isPublicProfile ? "Follow Profile" : "Edit Profile"}
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high px-6 py-3 text-[0.92rem] font-semibold text-on-surface transition-colors hover:bg-surface-container-highest"
            type="button"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </section>

      <section className="mt-20">
        {!isPublicProfile ? (
          <div className="mb-10">
            <PushNotificationSettingsCard />
          </div>
        ) : null}

        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Past Experiences</h2>
          {!isPublicProfile ? (
            <span className="text-[0.82rem] font-medium text-on-surface-variant">Viewing {experienceItems.length} past events</span>
          ) : null}
        </div>

        {isPublicProfile ? (
          <div className="rounded-[1.5rem] bg-surface-container p-6 text-sm text-on-surface-variant">
            Public event history is not available yet.
          </div>
        ) : myPastEventsQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-[22rem] animate-pulse rounded-[1.55rem] bg-surface-container-low" key={index} />
            ))}
          </div>
        ) : experienceItems.length ? (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {regularExperiences.slice(0, 3).map((experience) => (
                <ExperienceCard experience={experience} key={experience.id} />
              ))}

              {featuredExperience ? <ExperienceFeatureCard experience={featuredExperience} /> : null}

              {regularExperiences.slice(3).map((experience) => (
                <ExperienceCard experience={experience} key={experience.id} />
              ))}
            </div>

            {myPastEventsQuery.hasNextPage ? (
              <div className="mt-12 flex justify-center">
                <button
                  className="inline-flex items-center gap-3 rounded-full bg-surface-container-high px-7 py-3.5 text-[0.82rem] font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
                  disabled={myPastEventsQuery.isFetchingNextPage}
                  onClick={() => void myPastEventsQuery.fetchNextPage()}
                  type="button"
                >
                  {myPastEventsQuery.isFetchingNextPage ? "Loading..." : "Load More History"}
                  <span className="text-on-surface-variant">v</span>
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container p-6 text-sm text-on-surface-variant">
            Your past event archive is still building. Join a few moments and they&apos;ll show up here.
          </div>
        )}

        {!isPublicProfile && myPastEventsQuery.isError ? (
          <div className="mt-6 rounded-[1.5rem] bg-rose-500/10 px-6 py-5 text-sm text-rose-200">
            {getApiErrorMessage(myPastEventsQuery.error, "Unable to load your past events.")}
          </div>
        ) : null}
      </section>
    </div>
  );
}
