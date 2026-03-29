import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { LoginScreen } from "@/features/auth/components/login-screen";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(STORAGE_KEYS.sessionCookie)?.value === "1";

  if (hasSession) {
    redirect("/discover");
  }

  const params = await searchParams;
  const registeredValue = params.registered;
  const isRegistered = Array.isArray(registeredValue)
    ? registeredValue[0] === "1"
    : registeredValue === "1";

  return <LoginScreen isRegistered={isRegistered} />;
}
