import { PublicBrowseShell } from "@/components/layout/public-browse-shell";
import { EventDetailsPage } from "@/features/events/components/event-details-page";

type EventDetailsRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function EventDetailsRoute({ params }: EventDetailsRouteProps) {
  const { token } = await params;

  return (
    <PublicBrowseShell>
      <EventDetailsPage token={token} />
    </PublicBrowseShell>
  );
}
