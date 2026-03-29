import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { RegisterScreen } from "@/features/auth/components/register-screen";

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(STORAGE_KEYS.sessionCookie)?.value === "1";

  if (hasSession) {
    redirect("/discover");
  }

  return <RegisterScreen />;
}
