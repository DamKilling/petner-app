"use client";

import {
  BellDot,
  Compass,
  Grid2x2,
  MessageCircleMore,
  PawPrint,
  TreePine,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const navConfig = [
  { href: "/app", icon: Grid2x2, key: "overview" },
  { href: "/app/match?tab=community", icon: UsersRound, key: "community" },
  { href: "/app/match?tab=services", icon: Compass, key: "services" },
  { href: "/app/profile?tab=pets", icon: PawPrint, key: "pets" },
  { href: "/app/tree", icon: TreePine, key: "tree" },
  { href: "/app/chats", icon: MessageCircleMore, key: "messages" },
  { href: "/app/profile?tab=account", icon: UserRound, key: "account" },
] as const;

const mobileNavKeys = new Set(["overview", "community", "services", "tree", "messages"]);

function resolveActiveKey(pathname: string, searchParams: { get(name: string): string | null }) {
  if (pathname === "/app") {
    return "overview";
  }

  if (pathname.startsWith("/app/chats")) {
    return "messages";
  }

  if (pathname.startsWith("/app/tree")) {
    return "tree";
  }

  if (pathname.startsWith("/app/match/pets")) {
    return "pets";
  }

  if (pathname.startsWith("/app/match")) {
    return searchParams.get("tab") === "services" ? "services" : "community";
  }

  if (pathname.startsWith("/app/profile")) {
    return searchParams.get("tab") === "pets" ? "pets" : "account";
  }

  return "overview";
}

export function AppShell({
  children,
  profile,
  locale,
  isDemo = false,
  unreadNotificationCount = 0,
}: {
  children: ReactNode;
  profile: Profile;
  locale: Locale;
  isDemo?: boolean;
  unreadNotificationCount?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = resolveActiveKey(pathname, searchParams);
  const copy = getDictionary(locale);
  const navLabels = copy.shell.appNav;
  const desktopNavItems = navConfig.map((item) => ({
    ...item,
    label: navLabels[item.key],
  }));
  const mobileNavItems = desktopNavItems.filter((item) => mobileNavKeys.has(item.key));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(240,111,79,0.08),transparent_26rem),radial-gradient(circle_at_100%_0%,rgba(155,184,154,0.12),transparent_28rem),linear-gradient(180deg,#fffaf4_0%,#fff9f2_46%,#f7f1e8_100%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 overflow-y-auto border-r border-black/8 bg-[#1f1916] px-6 py-7 text-white lg:flex lg:flex-col">
        <Link href="/app" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center overflow-hidden rounded-[1.1rem] border border-white/12 bg-white shadow-[0_16px_30px_rgba(255,255,255,0.10)]">
            <Image
              alt=""
              className="size-full object-contain p-1"
              height={44}
              src="/brand/petlife-cat-icon.jpg"
              width={44}
            />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">PetLife</p>
            <p className="text-xs text-white/48">{copy.common.petlifeTagline}</p>
          </div>
        </Link>

        <nav className="mt-10 grid gap-2">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-[1.25rem] px-4 py-3 text-sm font-medium",
                  active ? "bg-white text-[#1f1916]" : "text-white/68 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                {active ? <span className="size-2 rounded-full bg-[#f06f4f]" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <LanguageSwitcher locale={locale} inverted />
        </div>

        <div className="mt-4 space-y-3">
          <Link
            href="/app/chats"
            className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white/78 hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              <BellDot className="size-4" />
              {copy.shell.notifications}
            </span>
            {unreadNotificationCount ? (
              <span className="rounded-full bg-[#f06f4f] px-2 py-0.5 text-[11px] font-semibold text-white">
                {unreadNotificationCount}
              </span>
            ) : null}
          </Link>
          {!isDemo ? (
            <form action={signOut}>
              <button className="w-full rounded-[1.2rem] border border-white/10 px-4 py-3 text-left text-sm font-semibold text-[#ffd1c5] hover:bg-white/8" type="submit">
                {copy.common.signOut}
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-black/8 bg-[#fffaf2]/88 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white">
              <Image
                alt=""
                className="size-full object-contain p-1"
                height={36}
                src="/brand/petlife-cat-icon.jpg"
                width={36}
              />
            </span>
            <div>
              <p className="text-base font-semibold">PetLife</p>
              <p className="text-[11px] text-black/44">{profile.city}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} compact />
            <Link
              href="/app/profile?tab=account"
              className="rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-black/64"
            >
              {profile.display_name}
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 pb-28 lg:ml-80 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-black/8 bg-[#fffdf9]/94 px-2 py-2 backdrop-blur lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeKey === item.key;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[11px] font-medium",
                active ? "bg-[#f06f4f]/12 text-[#b54a2f]" : "text-black/54",
              )}
            >
              <Icon className="size-4" />
              {item.label}
              {item.key === "messages" && unreadNotificationCount ? (
                <span className="absolute right-4 top-1.5 size-2 rounded-full bg-[#f06f4f]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
