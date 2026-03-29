import { cn } from "@/lib/utils/cn";

type ProfileStatProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function ProfileStat({ label, value, accent = false }: ProfileStatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className={cn("font-headline text-[1.9rem] font-extrabold tracking-tight", accent ? "text-primary" : "text-on-surface")}>
        {value}
      </span>
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{label}</span>
    </div>
  );
}
