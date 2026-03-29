import Link from "next/link";
import type { ProfileExperience } from "@/features/profile/types/profile.types";

type ExperienceFeatureCardProps = {
  experience: ProfileExperience;
};

export function ExperienceFeatureCard({ experience }: ExperienceFeatureCardProps) {
  const content = (
    <div className="flex h-full flex-col md:flex-row">
      <div className={`relative min-h-60 md:w-[44%] ${experience.theme}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_28%,rgba(255,255,255,0.22),transparent_20%),linear-gradient(180deg,transparent,rgba(0,0,0,0.08))]" />
      </div>

      <div className="flex flex-1 flex-col justify-center p-7">
        <h4 className="max-w-[15rem] font-headline text-[2rem] font-bold leading-[0.95] tracking-tight text-on-surface">
          {experience.title}
        </h4>
        <div className="mt-8">
          <p className="mb-3 text-[0.78rem] text-on-surface-variant">{experience.date}</p>
          <p className="mb-5 max-w-[21rem] text-[0.92rem] leading-relaxed text-on-surface-variant">{experience.location}</p>
          <span className="text-[0.9rem] font-bold text-primary transition-transform group-hover:translate-x-0.5">
            {experience.actionLabel} -
          </span>
        </div>
      </div>
    </div>
  );

  if (experience.href) {
    return (
      <Link className="group overflow-hidden rounded-[1.65rem] bg-surface-container transition-colors duration-300 hover:bg-surface-container-high md:col-span-2" href={experience.href}>
        {content}
      </Link>
    );
  }

  return <article className="group overflow-hidden rounded-[1.65rem] bg-surface-container transition-colors duration-300 hover:bg-surface-container-high md:col-span-2">{content}</article>;
}
