import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { demoProfile } from "@/lib/demo-data";
import { getCurrentUser, getUnreadNotificationCount } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  const unreadNotificationCount = await getUnreadNotificationCount(user?.id ?? "demo");

  if (configured && !user) {
    redirect("/login");
  }

  return (
    <AppShell
      isDemo={!configured}
      locale={locale}
      profile={user?.profile ?? demoProfile}
      unreadNotificationCount={unreadNotificationCount}
    >
      {!configured ? <div className="mb-8"><SetupNotice copy={dict.setupNotice} /></div> : null}
      {children}
    </AppShell>
  );
}
