export interface ProfileStat {
  label: string;
  value: string;
  accent?: boolean;
}

export interface ProfileExperience {
  id: string;
  title: string;
  date: string;
  location: string;
  actionLabel: string;
  featured?: boolean;
  theme: string;
  href?: string;
}
