import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { demoProfile } from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();

  if (configured && !user) {
    redirect("/login");
  }

  return (
    <AppShell isDemo={!configured} profile={user?.profile ?? demoProfile}>
      {!configured ? <div className="mb-8"><SetupNotice /></div> : null}
      {children}
    </AppShell>
  );
}
