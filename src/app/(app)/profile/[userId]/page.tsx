import { ProfilePage } from "@/features/profile/components/profile-page";

type PublicProfileRouteProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function PublicProfileRoute({ params }: PublicProfileRouteProps) {
  const { userId } = await params;

  return <ProfilePage userId={userId} />;
}
