import { PublicBrowseShell } from "@/components/layout/public-browse-shell";
import { DiscoverPage } from "@/features/events/components/discover-page";

export default function DiscoverRoute() {
  return (
    <PublicBrowseShell>
      <DiscoverPage />
    </PublicBrowseShell>
  );
}
