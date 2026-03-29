"use client";

import type { ReactNode } from "react";
import { Sparkles, Zap } from "lucide-react";

type AuthShellProps = {
  badge: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
};

export function AuthShell({ badge, title, description, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden kinetic-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-[8%] h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-8rem] top-[16%] h-80 w-80 rounded-full bg-tertiary/10 blur-[140px]" />
        <div className="absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/8 blur-[160px]" />
      </div>

      <main className="ui-page-padding relative z-10 flex min-h-screen items-center justify-center">
        <div className="absolute left-6 top-6 sm:left-8 sm:top-8">
          <span className="font-headline text-3xl font-black tracking-tighter text-primary sm:text-4xl">Spont</span>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-on-surface-variant">Kinetic Noir</p>
        </div>

        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <section className="mx-auto max-w-[36rem] text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {badge}
            </div>
            <h1 className="mt-6 font-headline text-5xl font-extrabold leading-[0.96] tracking-[-0.04em] text-on-surface sm:text-6xl lg:text-[4.6rem]">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-[30rem] text-base leading-relaxed text-on-surface-variant lg:mx-0 lg:text-lg">
              {description}
            </p>
          </section>

          <section className="mx-auto w-full max-w-[29rem]">{children}</section>
        </div>

        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
          <div className="absolute right-[8%] top-20 flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-surface-container text-primary shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
            <Zap className="h-5 w-5" />
          </div>
          <div className="absolute bottom-16 left-[6%] flex h-20 w-20 -rotate-12 items-center justify-center rounded-full bg-surface-container text-tertiary shadow-[0_24px_60px_-40px_rgba(0,0,0,0.8)]">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>
      </main>
    </div>
  );
}
