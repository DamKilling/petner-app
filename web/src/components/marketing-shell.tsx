import { PawPrint } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ButtonLink } from "@/components/ui";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export async function MarketingShell({
  children,
}: {
  children: ReactNode;
}) {
  const locale: Locale = await getRequestLocale();
  const copy = getDictionary(locale);

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
              <p className="text-[11px] text-black/42">{copy.common.petlifeTagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-black/60 md:flex">
            {copy.shell.marketingNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} compact />
            <ButtonLink href="/login" variant="secondary" className="hidden md:inline-flex">
              {copy.common.login}
            </ButtonLink>
            <ButtonLink href="/app">{copy.common.start}</ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12">{children}</main>
    </div>
  );
}
