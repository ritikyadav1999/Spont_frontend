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
  const submitLabel =
    mode === "edit"
      ? activeMutation.isPending
        ? "Saving Changes..."
        : "Save Event Changes"
      : activeMutation.isPending
        ? "Publishing..."
        : "Publish Experience";

  return (
    <div className="ui-page-shell ui-page-shell--narrow pb-32 lg:pb-12 max-w-2xl mx-auto px-4">
      <AppPageHeader
        title={pageTitle}
      />

      <form className="space-y-6 pb-8" onSubmit={handleSubmit(onSubmit)}>
        <SectionCard icon={<Sparkles className="h-4 w-4" />} title="The Essentials">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">Event Title</label>
              <input
                className={cn(
                  "w-full rounded-2xl bg-surface-container-highest px-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none border border-transparent focus:border-primary/20",
                  errors.title && "border-rose-400/30",
                )}
                placeholder="Something catchy..."
                type="text"
                {...register("title")}
              />
              {errors.title ? <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">Description</label>
              <textarea
                className={cn(
                  "min-h-28 w-full resize-none rounded-2xl bg-surface-container-highest px-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none border border-transparent focus:border-primary/20",
                  errors.description && "border-rose-400/30",
                )}
                placeholder="What's the vibe? Mention any requirements or perks..."
                {...register("description")}
              />
              {errors.description ? <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<ImageIcon className="h-4 w-4" />} title="Event Visuals">
          <div className="space-y-2">
            <label className="ml-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">Cover Photo</label>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-white/10 bg-surface-container-low/60 px-4 py-8 text-center transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99]">
              <input
                accept="image/*"
                className="hidden"
                type="file"
                onChange={(event) => setCoverFileName(event.target.files?.[0]?.name ?? null)}
              />
              <CloudUpload className="mx-auto h-8 w-8 text-primary/85 animate-pulse" />
              <p className="mt-3 text-sm font-semibold text-on-surface">Choose cover image</p>
              <p className="mt-0.5 text-xs text-on-surface-variant/70">PNG, JPG or WEBP (UI ready)</p>
              <span className="mt-3 inline-flex rounded-full bg-surface-container-high border border-white/[0.04] px-4 py-1.5 text-xs font-bold text-on-surface-variant">
                {coverFileName ? coverFileName : "Browse Files"}
              </span>
            </label>
          </div>
        </SectionCard>

        <SectionCard icon={<TimerReset className="h-4 w-4" />} title="Logistics">
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Start Date & Time */}
              <div className="space-y-3">
                <h4 className="ml-1 text-[0.62rem] font-bold uppercase tracking-wider text-primary">Start Details</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className={cn(
                    "bg-surface-container-highest/60 rounded-2xl px-4 py-3 border border-transparent transition-all focus-within:border-primary/20",
                    errors.startDate && "border-rose-400/30"
                  )}>
                    <label className="block text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">Date</label>
                    <input
                      className="w-full bg-transparent text-sm text-on-surface focus:outline-none mt-1"
                      type="date"
                      {...register("startDate")}
                    />
                  </div>
                  <div className={cn(
                    "bg-surface-container-highest/60 rounded-2xl px-4 py-3 border border-transparent transition-all focus-within:border-primary/20",
                    errors.startTime && "border-rose-400/30"
                  )}>
                    <label className="block text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">Time</label>
                    <input
                      className="w-full bg-transparent text-sm text-on-surface focus:outline-none mt-1"
                      type="time"
                      {...register("startTime")}
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="space-y-3">
                <h4 className="ml-1 text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">End Details</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className={cn(
                    "bg-surface-container-highest/60 rounded-2xl px-4 py-3 border border-transparent transition-all focus-within:border-primary/20",
                    errors.endDate && "border-rose-400/30"
                  )}>
                    <label className="block text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">Date</label>
                    <input
                      className="w-full bg-transparent text-sm text-on-surface focus:outline-none mt-1"
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                  <div className={cn(
                    "bg-surface-container-highest/60 rounded-2xl px-4 py-3 border border-transparent transition-all focus-within:border-primary/20",
                    errors.endTime && "border-rose-400/30"
                  )}>
                    <label className="block text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80">Time</label>
                    <input
                      className="w-full bg-transparent text-sm text-on-surface focus:outline-none mt-1"
                      type="time"
                      {...register("endTime")}
                    />
                  </div>
                </div>
                {errors.endTime ? <p className="text-xs text-rose-400 mt-1">{errors.endTime.message}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Location Search</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    className={cn(
                      "w-full rounded-2xl bg-surface-container-highest px-11 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none border border-transparent focus:border-primary/20",
                      errors.locationName && "border-rose-400/30",
                    )}
                    placeholder="Enter venue or street address"
                    type="text"
                    {...register("locationQuery")}
                  />
                </div>
                <button
                  className="rounded-2xl bg-surface-container-high px-5 py-3.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-[0.98] shrink-0"
                  onClick={handleLocationSearch}
                  type="button"
                >
                  {isSearchingLocation ? "..." : "Search"}
                </button>
              </div>
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

            {locationError ? <p className="text-xs text-rose-400">{locationError}</p> : null}
            {errors.locationName ? <p className="text-xs text-rose-400">{errors.locationName.message}</p> : null}

            <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-surface-container-highest/40">
              <div className="flex items-center justify-between px-4 py-3 text-[0.62rem] font-bold uppercase tracking-wider text-on-surface-variant/80 border-b border-white/[0.03]">
                <span className="truncate max-w-[70%]">{selectedLocation || "Map preview"}</span>
                {selectedLocation ? <span className="shrink-0">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span> : null}
              </div>
              <div className="h-48 bg-surface-container-low relative grayscale contrast-125 brightness-90">
                <iframe className="h-full w-full border-0" loading="lazy" src={mapUrl} title="Location map preview" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem]">
              {/* Capacity Range Slider */}
              <div className="rounded-2xl bg-surface-container-high/60 border border-white/[0.03] p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">Capacity</label>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-4 py-2">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-high text-base font-bold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-95 disabled:opacity-50"
                    disabled={maxParticipants <= CAPACITY_MIN}
                    onClick={() => updateCapacity(maxParticipants - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="font-headline text-2xl font-black text-primary">{maxParticipants}</span>
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1.5">Spots</span>
                  </div>
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-high text-base font-bold text-on-surface transition-colors hover:bg-surface-container-highest active:scale-95 disabled:opacity-50"
                    disabled={maxParticipants >= CAPACITY_MAX}
                    onClick={() => updateCapacity(maxParticipants + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <input
                  className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary"
                  max={CAPACITY_MAX}
                  min={CAPACITY_MIN}
                  step={1}
                  type="range"
                  {...register("maxParticipants", { valueAsNumber: true })}
                />
              </div>

              {/* Segment Controller: Join Mode */}
              <div className="rounded-2xl bg-surface-container-high/60 border border-white/[0.03] p-4 flex flex-col justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3">
                  Join Mode
                </label>
                <div className="flex rounded-xl bg-surface-container-highest p-1 border border-white/[0.03]">
                  {joinModeOptions.map((option) => (
                    <button
                      className={cn(
                        "flex-1 rounded-lg py-2 text-xs font-bold transition-all text-center",
                        joinMode === option.value
                          ? "bg-primary text-[#480d00] shadow-sm font-black"
                          : "text-on-surface-variant hover:text-on-surface",
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

              {/* Segment Controller: Visibility */}
              <div className="rounded-2xl bg-surface-container-high/60 border border-white/[0.03] p-4 flex flex-col justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3">
                  Visibility
                </label>
                <div className="flex rounded-xl bg-surface-container-highest p-1 border border-white/[0.03]">
                  {visibilityOptions.map((option) => (
                    <button
                      className={cn(
                        "flex-1 rounded-lg py-2 text-xs font-bold transition-all text-center",
                        visibility === option.value
                          ? "bg-primary text-[#480d00] shadow-sm font-black"
                          : "text-on-surface-variant hover:text-on-surface",
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
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
            {getApiErrorMessage(activeMutation.error)}
          </p>
        ) : null}

        {/* Desktop Submit Button */}
        <button
          className="hidden lg:flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 font-headline text-sm font-extrabold text-[#480d00] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          disabled={activeMutation.isPending}
          type="submit"
        >
          <span>{submitLabel}</span>
          <Rocket className="h-4 w-4" />
        </button>

        {/* Sticky Submit Button for Mobile View */}
        <div className="fixed bottom-[calc(3.4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4 py-3 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-white/[0.04] lg:hidden">
          <button
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-[#480d00] transition-transform active:scale-[0.98] disabled:opacity-50"
            disabled={activeMutation.isPending}
            type="submit"
          >
            <span>{submitLabel}</span>
            <Rocket className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
