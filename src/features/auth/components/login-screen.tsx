"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getApiErrorMessage } from "@/lib/utils/api-response";
import { cn } from "@/lib/utils/cn";

type LoginScreenProps = {
  isRegistered?: boolean;
};

export function LoginScreen({ isRegistered = false }: LoginScreenProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginSchema) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <AuthShell
      badge="Real-time discovery"
      description="Sign in to discover spontaneous plans, live moments, and the people already out there."
      title={
        <>
          Move with the
          <br />
          <span className="text-primary">pulse</span> of your city.
        </>
      }
    >
      <div className="rounded-[1.75rem] bg-surface-container p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] sm:p-7">
        <div className="mb-7 text-center lg:text-left">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Welcome Back</h2>
          <p className="mt-2 text-on-surface-variant">Sign in to sync with the pulse.</p>
        </div>

        {isRegistered ? (
          <p className="mb-6 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Account created. Please sign in.
          </p>
        ) : null}

        <div className="mb-8 grid grid-cols-2 gap-4">
          <button
            className="group flex items-center justify-center gap-3 rounded-2xl bg-surface-container-high px-4 py-3.5 text-sm font-medium transition-colors hover:bg-surface-container-highest"
            type="button"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-1.92 5.36-7.84 5.36-5.12 0-9.28-4.24-9.28-9.52s4.16-9.52 9.28-9.52c2.92 0 4.88 1.24 6 2.32l2.6-2.52C19.32 1.4 16.24 0 12.48 0 5.56 0 0 5.56 0 12.48S5.56 24.96 12.48 24.96c7.24 0 12.04-5.08 12.04-12.24 0-.84-.08-1.48-.2-2.12h-11.84z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
          <button
            className="group flex items-center justify-center gap-3 rounded-2xl bg-surface-container-high px-4 py-3.5 text-sm font-medium transition-colors hover:bg-surface-container-highest"
            type="button"
          >
            <svg className="h-5 w-5 fill-on-surface" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.96.95-2.21 1.72-3.72 1.72-1.55 0-2.48-.91-3.93-.91-1.48 0-2.55.91-3.95.91-1.41 0-2.73-.77-3.71-1.72-2-1.93-3.41-5.61-3.41-8.56 0-4.63 3.03-7.1 5.92-7.1 1.49 0 2.58.91 3.89.91 1.25 0 2.22-.91 3.96-.91 2.47 0 4.58 1.63 5.48 3.86-5.09 2.12-4.27 8.91.82 11.02-.45 1.15-1.15 2.21-1.35 2.78zM12.03 5.35c-.15-2.23 1.64-4.14 3.7-4.35.25 2.38-2.07 4.41-3.7 4.35z" />
            </svg>
            Apple
          </button>
        </div>

        <p className="mb-8 text-center text-xs uppercase tracking-[0.2em] text-on-surface-variant">Or continue with</p>

        <form autoComplete="off" className="space-y-6" onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-on-surface-variant" htmlFor="identifier">
              Email or Phone
            </label>
            <input
              className={cn(
                "w-full rounded-2xl border border-transparent bg-surface-container-highest px-5 py-4 text-on-surface transition-all",
                "placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/40",
                errors.identifier && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
              )}
              id="identifier"
              placeholder="name@pulse.com or +91..."
              type="text"
              {...register("identifier")}
            />
            {errors.identifier ? <p className="text-sm text-rose-300">{errors.identifier.message}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="ml-1 flex items-center justify-between">
              <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <button className="text-xs font-bold text-tertiary transition-colors hover:text-primary" type="button">
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                className={cn(
                  "w-full rounded-2xl border border-transparent bg-surface-container-highest px-5 py-4 text-on-surface transition-all",
                  "placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/40",
                  errors.password && "border-rose-400/40 focus:border-rose-400 focus:ring-rose-400/40",
                )}
                id="password"
                placeholder="........"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
          </div>

          {loginMutation.isError ? (
            <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getApiErrorMessage(loginMutation.error)}
            </p>
          ) : null}

          <div className="pt-2">
            <button
              className="w-full rounded-full bg-primary px-6 py-3.5 font-headline font-extrabold text-on-primary-container shadow-[0_10px_30px_-10px_rgba(255,143,112,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loginMutation.isPending}
              type="submit"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Not on the list yet?
          <Link className="ml-1 font-bold text-primary hover:underline" href="/register">
            Join the Pulse
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
