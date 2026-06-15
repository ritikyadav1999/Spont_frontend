import { PublicBrowseShell } from "@/components/layout/public-browse-shell";
import { EditEventPage } from "@/features/host/components/edit-event-page";

type EditEventRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function EditEventRoute({ params }: EditEventRouteProps) {
  const { token } = await params;

  return (
    <PublicBrowseShell>
      <EditEventPage token={token} />
    </PublicBrowseShell>
  );
}
