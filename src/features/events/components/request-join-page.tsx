"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2, Phone, Rocket, Sparkles, UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useEventByToken, useRequestJoinEvent } from "@/features/events/hooks/use-events";
import { requestJoinSchema, type RequestJoinSchema } from "@/features/events/schemas/request-join.schema";
import { tokenStorage } from "@/lib/api/token-storage";
import { userStorage } from "@/lib/api/user-storage";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
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

export function RequestJoinPage({ token }: { token: string }) {
  const router = useRouter();
  const eventQuery = useEventByToken(token);
  const requestJoinMutation = useRequestJoinEvent(token);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestJoinSchema>({
    resolver: zodResolver(requestJoinSchema),
    defaultValues: {
      name: "",
      gender: "MALE",
      phone: "",
    },
  });

  const selectedGender = useWatch({
    control,
    name: "gender",
  });

  const onSubmit = (values: RequestJoinSchema) => {
    requestJoinMutation.mutate(values, {
      onSuccess: (session) => {
        tokenStorage.setTokens({
          accessToken: session.token,
        });
        userStorage.setUser({
          name: values.name,
          gender: values.gender,
          phone: values.phone,
        });
        setAuthenticated(
          {
            name: values.name,
            gender: values.gender,
            phone: values.phone,
          },
          {
            accessToken: session.token,
          },
        );
        router.push(`/events/${token}`);
      },
    });
  };

  return (
    <div className="ui-page-shell ui-page-shell--narrow pb-20">
      <div className="mb-5">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
          href={`/events/${token}`}
        >
          Back to Event
        </Link>
      </div>

      <AppPageHeader
        description={
          eventQuery.data
            ? `Complete a quick join request for ${eventQuery.data.title}. We only need the basics to send your request through.`
            : "Complete a quick join request. We only need the basics to send your request through."
        }
        title="Request Join"
      />

      <form className="space-y-6 pb-8" onSubmit={handleSubmit(onSubmit)}>
        <SectionCard icon={<Sparkles className="h-4 w-4" />} title="About You">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Full Name</label>
              <input
                className={cn(
                  "w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                  errors.name && "ring-1 ring-rose-400/50",
                )}
                placeholder="Your name"
                type="text"
                {...register("name")}
              />
              {errors.name ? <p className="text-sm text-rose-300">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-3">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {(["MALE", "FEMALE"] as const).map((option) => (
                  <button
                    className={cn(
                      "rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                      selectedGender === option
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                    )}
                    key={option}
                    onClick={() => setValue("gender", option, { shouldValidate: true })}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant">Phone Number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className={cn(
                    "w-full rounded-xl bg-surface-container-highest px-12 py-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                    errors.phone && "ring-1 ring-rose-400/50",
                  )}
                  placeholder="Phone number"
                  type="tel"
                  {...register("phone")}
                />
              </div>
              {errors.phone ? <p className="text-sm text-rose-300">{errors.phone.message}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<Users className="h-4 w-4" />} title="What Happens Next">
          <div className="grid gap-4 text-sm text-on-surface-variant sm:grid-cols-3">
            <div className="rounded-[1.2rem] bg-surface-container-high p-5">
              <UserRound className="mb-3 h-5 w-5 text-primary" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Identity</p>
              <p className="mt-2 leading-6">We attach your basic profile details to the join request.</p>
            </div>
            <div className="rounded-[1.2rem] bg-surface-container-high p-5">
              <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Review</p>
              <p className="mt-2 leading-6">The host will receive your request and decide based on the event rules.</p>
            </div>
            <div className="rounded-[1.2rem] bg-surface-container-high p-5">
              <Rocket className="mb-3 h-5 w-5 text-primary" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Access</p>
              <p className="mt-2 leading-6">We save the returned member token so you can continue inside the app.</p>
            </div>
          </div>
        </SectionCard>

        {eventQuery.isError ? (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {getApiErrorMessage(eventQuery.error, "Unable to load event details.")}
          </p>
        ) : null}

        {requestJoinMutation.isError ? (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {getApiErrorMessage(requestJoinMutation.error, "Unable to submit join request.")}
          </p>
        ) : null}

        <button
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary-container px-6 py-5 font-headline text-lg font-extrabold text-on-primary-container transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={requestJoinMutation.isPending}
          type="submit"
        >
          <span>{requestJoinMutation.isPending ? "Submitting..." : "Send Join Request"}</span>
          <Rocket className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
