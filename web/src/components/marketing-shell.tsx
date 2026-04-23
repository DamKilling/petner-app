import { PawPrint } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui";

const navItems = [
  { href: "/community", label: "社区精选" },
  { href: "/services", label: "服务匹配" },
  { href: "/safety", label: "信任与安全" },
];

export function MarketingShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(240,111,79,0.1),transparent_28rem),radial-gradient(circle_at_100%_0%,rgba(155,184,154,0.18),transparent_26rem),linear-gradient(180deg,#fffaf4_0%,#fff9f2_46%,#f7f1e8_100%)] text-[#2f241e]">
      <header className="sticky top-0 z-30 border-b border-black/8 bg-[#fffaf2]/88 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[1rem] bg-[#f06f4f] text-white shadow-[0_14px_28px_rgba(240,111,79,0.22)]">
              <PawPrint className="size-4" />
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight">PetLife</p>
              <p className="text-[11px] text-black/42">宠物社交、陪伴与服务</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-black/60 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="secondary" className="hidden md:inline-flex">
              登录
            </ButtonLink>
            <ButtonLink href="/app">开始使用</ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12">{children}</main>
    </div>
  );
}
