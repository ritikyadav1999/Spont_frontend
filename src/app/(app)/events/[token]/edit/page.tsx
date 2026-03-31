import { EditEventPage } from "@/features/host/components/edit-event-page";

type EditEventRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function EditEventRoute({ params }: EditEventRouteProps) {
  const { token } = await params;

  return <EditEventPage token={token} />;
}
