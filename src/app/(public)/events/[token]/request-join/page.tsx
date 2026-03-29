import { PublicBrowseShell } from "@/components/layout/public-browse-shell";
import { RequestJoinPage } from "@/features/events/components/request-join-page";

type RequestJoinRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function RequestJoinRoute({ params }: RequestJoinRouteProps) {
  const { token } = await params;

  return (
    <PublicBrowseShell>
      <RequestJoinPage token={token} />
    </PublicBrowseShell>
  );
}
