"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AppPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function AppPageHeader({
  title,
  description,
  actions,
  meta,
  className,
  contentClassName,
}: AppPageHeaderProps) {
  return (
    <header className={cn("mb-8 border-b border-white/8 pb-6 lg:mb-10 lg:pb-7", className)}>
      <div className={cn("flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between", contentClassName)}>
        <div className="min-w-0 flex-1">
          {meta ? <div className="mb-3">{meta}</div> : null}
          <div className="max-w-4xl">
            <h1 className="font-headline text-4xl font-bold leading-[0.96] tracking-[-0.035em] text-on-surface sm:text-5xl xl:text-[4.45rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-[0.94rem] leading-[1.65] text-on-surface-variant sm:text-[0.98rem]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
