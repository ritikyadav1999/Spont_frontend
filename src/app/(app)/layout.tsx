import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { STORAGE_KEYS } from "@/config/storage-keys";
import { AppShell } from "@/components/layout/app-shell";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(STORAGE_KEYS.sessionCookie)?.value === "1";

  if (!hasSession) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
