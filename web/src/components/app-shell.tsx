import {
  HeartHandshake,
  Home,
  MessageCircle,
  PawPrint,
  PlaySquare,
  TreePine,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions";
import type { Profile } from "@/lib/types";

const navItems = [
  { href: "/app", label: "首页", icon: Home },
  { href: "/app/tree", label: "成长树", icon: TreePine },
  { href: "/app/videos", label: "视频", icon: PlaySquare },
  { href: "/app/match", label: "社交", icon: HeartHandshake },
  { href: "/app/profile", label: "我的", icon: UserRound },
];

export function AppShell({
  children,
  profile,
  isDemo = false,
}: {
  children: ReactNode;
  profile: Profile;
  isDemo?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe5bd,transparent_32rem),linear-gradient(135deg,#fffaf1,#f6efe5)]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-black/10 bg-[#201a16] p-6 text-white lg:flex lg:flex-col">
        <Link href="/app" className="flex items-center gap-3 text-2xl font-semibold">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f06f4f]">
            <PawPrint className="size-5" />
          </span>
          PetLife
        </Link>

        <nav className="mt-12 grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/72 hover:bg-white/10 hover:text-white"
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/72 hover:bg-white/10 hover:text-white"
            href="/app/chats"
          >
            <MessageCircle className="size-4" />
            聊天
          </Link>
        </nav>

        <div className="mt-auto rounded-[1.75rem] bg-white/10 p-4">
          <p className="text-sm font-semibold">{profile.display_name}</p>
          <p className="mt-1 text-xs text-white/55">{isDemo ? "配置 Supabase 后启用多人数据" : profile.city}</p>
          {!isDemo ? (
            <form action={signOut} className="mt-4">
              <button className="text-sm font-semibold text-[#ffd4c7]" type="submit">
                退出登录
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#fffaf1]/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-2 text-lg font-semibold">
            <PawPrint className="size-5 text-[#f06f4f]" />
            PetLife
          </Link>
          <Link className="text-sm font-semibold text-black/60" href="/app/profile">
            {profile.display_name}
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 pb-28 lg:ml-72 lg:px-10 lg:py-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-black/10 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-black/62"
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
