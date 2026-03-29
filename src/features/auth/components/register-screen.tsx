"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

type RegisterStep = 1 | 2;

const stepOneFields: Array<keyof RegisterSchema> = ["name", "email", "password", "gender"];

export function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [step, setStep] = useState<RegisterStep>(1);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "MALE",
      phone: "",
    },
  });

  const selectedGender = useWatch({ control, name: "gender" });

  const onSubmit = (values: RegisterSchema) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        router.push("/login?registered=1");
      },
    });
  };

  const moveToPhoneStep = async () => {
    const isValid = await trigger(stepOneFields);
    if (isValid) {
      setStep(2);
    }
  };

  return (
    <AuthShell
      badge="Join the movement"
      description="Create your account and step into the curated serendipity of your city."
      title={
        <>
          The <span className="text-primary">pulse</span>
          <br />
          awaits you.
        </>
      }
    >
      <div className="rounded-[1.75rem] bg-surface-container p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] sm:p-7">
        <div className="mb-7 text-center lg:text-left">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Create Account</h2>
          <p className="mt-2 text-on-surface-variant">
            {step === 1 ? "Start your profile and enter the pulse." : "Add your phone number to complete registration."}
          </p>
        </div>

        <form autoComplete="off" className="space-y-6" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-[0.14em] text-primary">FULL NAME</label>
                <input
                  className={cn(
                    "w-full rounded-xl border border-transparent bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-slate-600",
                    "focus:border-primary/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                    errors.name && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
                  )}
                  placeholder="Alex Sterling"
                  type="text"
                  {...register("name")}
                />
                {errors.name ? <p className="text-sm text-rose-300">{errors.name.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-[0.14em] text-primary">EMAIL ADDRESS</label>
                <input
                  className={cn(
                    "w-full rounded-xl border border-transparent bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-slate-600",
                    "focus:border-primary/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                    errors.email && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
                  )}
                  placeholder="alex@spont.pulse"
                  type="email"
                  {...register("email")}
                />
                {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
              </div>

              <div className="relative space-y-2">
                <label className="ml-1 text-xs font-bold tracking-[0.14em] text-primary">PASSWORD</label>
                <input
                  className={cn(
                    "w-full rounded-xl border border-transparent bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-slate-600",
                    "focus:border-primary/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                    errors.password && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
                  )}
                  placeholder="............"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute bottom-4 right-4 text-slate-500 transition-colors hover:text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-[0.14em] text-primary">GENDER</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={cn(
                      "rounded-full px-4 py-3 text-sm font-semibold transition",
                      selectedGender === "MALE"
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                    )}
                    onClick={() => setValue("gender", "MALE", { shouldValidate: true })}
                    type="button"
                  >
                    MALE
                  </button>
                  <button
                    className={cn(
                      "rounded-full px-4 py-3 text-sm font-semibold transition",
                      selectedGender === "FEMALE"
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest",
                    )}
                    onClick={() => setValue("gender", "FEMALE", { shouldValidate: true })}
                    type="button"
                  >
                    FEMALE
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input
                  className="mt-1 h-5 w-5 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/40 focus:ring-offset-0"
                  id="terms"
                  type="checkbox"
                />
                <label className="text-sm leading-relaxed text-on-surface-variant" htmlFor="terms">
                  I agree to the{" "}
                  <button className="text-on-surface underline decoration-primary/30 underline-offset-4" type="button">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button className="text-on-surface underline decoration-primary/30 underline-offset-4" type="button">
                    Privacy Policy
                  </button>
                  .
                </label>
              </div>

              <button
                className="w-full rounded-full bg-primary-container py-4 font-headline text-lg font-extrabold text-on-primary-container shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={moveToPhoneStep}
                type="button"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-[0.14em] text-primary">PHONE NUMBER</label>
                <input
                  className={cn(
                    "w-full rounded-xl border border-transparent bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-slate-600",
                    "focus:border-primary/40 focus:ring-1 focus:ring-primary/40 focus:outline-none",
                    errors.phone && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
                  )}
                  placeholder="7027593424"
                  type="tel"
                  {...register("phone")}
                />
                {errors.phone ? <p className="text-sm text-rose-300">{errors.phone.message}</p> : null}
              </div>

              {registerMutation.isError ? (
                <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {getApiErrorMessage(registerMutation.error)}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  className="w-1/3 rounded-full bg-surface-container-high py-3 text-sm font-bold text-white transition-colors hover:bg-surface-container-highest"
                  onClick={() => setStep(1)}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="w-2/3 rounded-full bg-primary-container py-4 font-headline text-lg font-extrabold text-on-primary-container shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={registerMutation.isPending}
                  type="submit"
                >
                  {registerMutation.isPending ? "Creating..." : "Complete Registration"}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[10px] font-bold tracking-[0.2em] text-slate-600">OR JOIN WITH</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              className="rounded-full bg-surface-container-high py-3 text-sm font-bold text-white transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              Google
            </button>
            <button
              className="rounded-full bg-surface-container-high py-3 text-sm font-bold text-white transition-colors hover:bg-surface-container-highest"
              type="button"
            >
              Apple
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?
          <Link className="ml-1 font-bold text-primary hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
