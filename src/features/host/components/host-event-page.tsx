"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, Image as ImageIcon, Rocket, Search, Sparkles, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useCreateEvent, useUpdateEvent } from "@/features/host/hooks/use-host-event";
import { hostEventSchema, type HostEventSchema } from "@/features/host/schemas/host-event.schema";
import type { CreateEventPayload, LocationSearchResult } from "@/features/host/types/host-event.types";
import type { EventItem } from "@/features/events/types/event.types";
import { toast } from "@/lib/toast/toast-store";
import { cn } from "@/lib/utils/cn";
import { getApiErrorMessage } from "@/lib/utils/api-response";

const joinModeOptions = [
  { label: "Open", value: "OPEN" },
  { label: "Approval", value: "APPROVAL_REQUIRED" },
] as const;

const visibilityOptions = [
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
] as const;

const CAPACITY_MIN = 1;
const CAPACITY_MAX = 2000;

const toIsoString = (date: string, time: string) => new Date(`${date}T${time}`).toISOString();
const toInputDate = (value: string) => new Date(value).toISOString().slice(0, 10);
const toInputTime = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));

type HostEventPageProps = {
  mode?: "create" | "edit";
  token?: string;
  initialEvent?: EventItem | null;
};

async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to search locations right now.");
  }

  const payload = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>;

  return payload.map((item) => ({
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.4rem] bg-surface-container p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-tertiary/10 p-2 text-tertiary">{icon}</div>
        <h3 className="font-headline text-[1.3rem] font-bold tracking-tight text-on-surface">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function HostEventPage({ mode = "create", token, initialEvent = null }: HostEventPageProps) {
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent(token ?? "");
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostEventSchema>({
    resolver: zodResolver(hostEventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      locationQuery: "",
      locationName: "",
      latitude: 0,
      longitude: 0,
      maxParticipants: 12,
      joinMode: "OPEN",
      visibility: "PUBLIC",
      status: "SCHEDULED",
    },
  });

  useEffect(() => {
    if (!initialEvent) {
      return;
    }

    reset({
      title: initialEvent.title,
      description: initialEvent.description,
      startDate: toInputDate(initialEvent.startTime),
      startTime: toInputTime(initialEvent.startTime),
      endDate: toInputDate(initialEvent.endTime),
      endTime: toInputTime(initialEvent.endTime),
      locationQuery: initialEvent.locationName,
      locationName: initialEvent.locationName,
      latitude: initialEvent.latitude,
      longitude: initialEvent.longitude,
      maxParticipants: initialEvent.maxParticipants,
      joinMode: initialEvent.joinMode,
      visibility: initialEvent.visibility,
      status: initialEvent.status,
    });
  }, [initialEvent, reset]);

  const maxParticipants = watch("maxParticipants");
  const selectedLocation = watch("locationName");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const locationQuery = watch("locationQuery");
  const joinMode = watch("joinMode");
  const visibility = watch("visibility");

  const mapUrl = useMemo(() => {
    if (!selectedLocation) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.93%2C77.65%2C13.03&layer=mapnik";
    }

    return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${latitude + 0.02}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }, [latitude, longitude, selectedLocation]);

  const updateCapacity = (nextValue: number) => {
    const clampedValue = Math.min(CAPACITY_MAX, Math.max(CAPACITY_MIN, nextValue));
    setValue("maxParticipants", clampedValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) {
      setLocationError("Enter a location to search.");
      return;
    }

    try {
      setIsSearchingLocation(true);
      setLocationError(null);
      const results = await searchLocations(locationQuery);
      setSearchResults(results);

      if (!results.length) {
        setLocationError("No matching places found.");
      }
    } catch (error) {
      setLocationError(getApiErrorMessage(error, "Location search failed."));
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (result: LocationSearchResult) => {
    setValue("locationQuery", result.displayName, { shouldValidate: true });
    setValue("locationName", result.displayName, { shouldValidate: true });
    setValue("latitude", result.latitude, { shouldValidate: true });
    setValue("longitude", result.longitude, { shouldValidate: true });
    setSearchResults([]);
    setLocationError(null);
  };

  const onSubmit = (values: HostEventSchema) => {
    const payload: CreateEventPayload = {
      title: values.title,
      description: values.description,
      startTime: toIsoString(values.startDate, values.startTime),
      endTime: toIsoString(values.endDate, values.endTime),
      locationName: values.locationName,
      latitude: values.latitude,
      longitude: values.longitude,
      status: values.status,
      joinMode: values.joinMode,
      visibility: values.visibility,
      maxParticipants: values.maxParticipants,
    };

    if (mode === "edit" && token) {
      updateEventMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Event details updated successfully.");
          router.push(`/events/${token}`);
        },
      });
      return;
    }

    createEventMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Event published successfully.");
        router.push("/discover");
      },
    });
  };

  const activeMutation = mode === "edit" ? updateEventMutation : createEventMutation;
  const pageTitle = mode === "edit" ? "Edit Event Details" : "Host Experience";
  const pageDescription =
    mode === "edit"
      ? "Update your event details, timing, access settings, and location before the next wave of guests arrives."
      : "Design a moment. Fill out the details below to broadcast your spontaneous event to the community.";
  const submitLabel =
    mode === "edit"
      ? activeMutation.isPending
        ? "Saving Changes..."
        : "Save Event Changes"
      : activeMutation.isPending
        ? "Publishing..."
        : "Publish Experience";

  return (
    <div className="ui-page-shell ui-page-shell--narrow pb-20">
      <AppPageHeader
        description={pageDescription}
        title={pageTitle}
      />

      <form className="space-y-6 pb-8" onSubmit={handleSubmit(onSubmit)}>
        <SectionCard icon={<Sparkles className="h-4 w-4" />} title="The Essentials">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Event Title</label>
              <input
                className={cn(
                  "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                  errors.title && "ring-1 ring-rose-400/50",
                )}
                placeholder="Something catchy..."
                type="text"
                {...register("title")}
              />
              {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Description</label>
              <textarea
                className={cn(
                  "min-h-28 w-full resize-none rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                  errors.description && "ring-1 ring-rose-400/50",
                )}
                placeholder="What's the vibe? Mention any requirements or perks..."
                {...register("description")}
              />
              {errors.description ? <p className="text-sm text-rose-300">{errors.description.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<ImageIcon className="h-4 w-4" />} title="Event Visuals">
          <div className="space-y-3">
            <label className="ml-1 block text-sm font-medium text-on-surface-variant">Cover Photo</label>
            <label className="block cursor-pointer rounded-[1.35rem] border border-dashed border-white/10 bg-surface-container-low px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(event) => setCoverFileName(event.target.files?.[0]?.name ?? null)}
              />
              <CloudUpload className="mx-auto h-10 w-10 text-on-surface-variant" />
              <p className="mt-4 text-base font-semibold text-on-surface">Drag & drop your cover image</p>
              <p className="mt-1 text-sm text-on-surface-variant">PNG, JPG or WEBP (UI ready, backend pending)</p>
              <span className="mt-4 inline-flex rounded-full bg-surface-container-high px-5 py-2 text-xs font-bold text-on-surface">
                {coverFileName ? coverFileName : "Browse Files"}
              </span>
            </label>
          </div>
        </SectionCard>

        <SectionCard icon={<TimerReset className="h-4 w-4" />} title="Logistics">
          <div className="space-y-8">
            <div className="grid gap-7 lg:grid-cols-2">
              <div className="space-y-4">
                <h4 className="ml-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary/80">Start</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                      Date
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none",
                        errors.startDate && "ring-1 ring-rose-400/50",
                      )}
                      type="date"
                      {...register("startDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                      Time
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none",
                        errors.startTime && "ring-1 ring-rose-400/50",
                      )}
                      type="time"
                      {...register("startTime")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="ml-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">End</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                      Date
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none",
                        errors.endDate && "ring-1 ring-rose-400/50",
                      )}
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                      Time
                    </label>
                    <input
                      className={cn(
                        "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none",
                        errors.endTime && "ring-1 ring-rose-400/50",
                      )}
                      type="time"
                      {...register("endTime")}
                    />
                  </div>
                </div>
                {errors.endTime ? <p className="text-sm text-rose-300">{errors.endTime.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <label className="ml-1 block text-sm font-medium text-on-surface-variant">Location Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    className={cn(
                      "w-full rounded-xl bg-surface-container-highest px-12 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                      errors.locationName && "ring-1 ring-rose-400/50",
                    )}
                    placeholder="Enter venue or street address"
                    type="text"
                    {...register("locationQuery")}
                  />
                </div>
              </div>

              <button
                className="mt-7 rounded-full bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
                onClick={handleLocationSearch}
                type="button"
              >
                {isSearchingLocation ? "Searching..." : "Search Place"}
              </button>
            </div>

            {searchResults.length ? (
              <div className="grid gap-2">
                {searchResults.map((result) => (
                  <button
                    className="rounded-xl bg-surface-container-high px-4 py-3 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
                    key={`${result.latitude}-${result.longitude}`}
                    onClick={() => handleSelectLocation(result)}
                    type="button"
                  >
                    {result.displayName}
                  </button>
                ))}
              </div>
            ) : null}

            {locationError ? <p className="text-sm text-rose-300">{locationError}</p> : null}
            {errors.locationName ? <p className="text-sm text-rose-300">{errors.locationName.message}</p> : null}

            <div className="overflow-hidden rounded-[1.35rem] bg-surface-container-highest">
              <div className="flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                <span>{selectedLocation || "Map preview"}</span>
                {selectedLocation ? <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span> : null}
              </div>
              <div className="h-72 bg-surface-container-low">
                <iframe className="h-full w-full border-0 grayscale" loading="lazy" src={mapUrl} title="Location map preview" />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem_12rem]">
              <div className="rounded-2xl bg-surface-container-high p-5">
                <label className="block text-sm font-medium text-on-surface-variant">Capacity</label>
                <input
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary"
                  max={CAPACITY_MAX}
                  min={CAPACITY_MIN}
                  step={1}
                  type="range"
                  {...register("maxParticipants", { valueAsNumber: true })}
                />
                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-3 py-3">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-base font-black text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={maxParticipants <= CAPACITY_MIN}
                    onClick={() => updateCapacity(maxParticipants - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <div className="min-w-[4.5rem] text-center">
                    <div className="font-headline text-2xl font-black text-primary">{maxParticipants}</div>
                    <div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Spots</div>
                  </div>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-base font-black text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={maxParticipants >= CAPACITY_MAX}
                    onClick={() => updateCapacity(maxParticipants + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-high p-4">
                <label className="mb-2 ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Join Mode
                </label>
                <div className="grid gap-2">
                  {joinModeOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                        joinMode === option.value
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container",
                      )}
                      key={option.value}
                      onClick={() => setValue("joinMode", option.value, { shouldValidate: true })}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-high p-4">
                <label className="mb-2 ml-1 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                  Visibility
                </label>
                <div className="grid gap-2">
                  {visibilityOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                        visibility === option.value
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container",
                      )}
                      key={option.value}
                      onClick={() => setValue("visibility", option.value, { shouldValidate: true })}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {activeMutation.isError ? (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {getApiErrorMessage(activeMutation.error)}
          </p>
        ) : null}

        <button
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary-container px-6 py-5 font-headline text-lg font-extrabold text-on-primary-container transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={activeMutation.isPending}
          type="submit"
        >
          <span>{submitLabel}</span>
          <Rocket className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
