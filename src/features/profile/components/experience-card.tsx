import Link from "next/link";
import type { ProfileExperience } from "@/features/profile/types/profile.types";

type ExperienceCardProps = {
  experience: ProfileExperience;
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const content = (
    <>
      <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${experience.theme}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_74%_70%,rgba(255,143,112,0.15),transparent_20%)]" />
      </div>

      <div className="p-5">
        <h4 className="font-headline text-[1.2rem] font-bold leading-tight text-on-surface">{experience.title}</h4>
        <p className="mt-1 text-[0.8rem] text-on-surface-variant">{experience.date}</p>
        <p className="mt-2 line-clamp-2 text-[0.8rem] text-on-surface-variant">{experience.location}</p>
        <span className="mt-4 inline-block text-[0.82rem] font-bold text-primary transition-transform group-hover:translate-x-0.5">
          {experience.actionLabel} -
        </span>
      </div>
    </>
  );

  if (experience.href) {
    return (
      <Link className="group overflow-hidden rounded-[1.55rem] bg-surface-container transition-colors duration-300 hover:bg-surface-container-high" href={experience.href}>
        {content}
      </Link>
    );
  }

  return <article className="group overflow-hidden rounded-[1.55rem] bg-surface-container transition-colors duration-300 hover:bg-surface-container-high">{content}</article>;
}
