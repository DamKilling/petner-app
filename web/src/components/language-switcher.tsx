"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";

import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  compact = false,
  inverted = false,
}: {
  locale: Locale;
  compact?: boolean;
  inverted?: boolean;
}) {
  const router = useRouter();
  const nextLocale: Locale = locale === "zh" ? "en" : "zh";

  function switchLocale() {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      aria-label={locale === "zh" ? "Switch language to English" : "切换语言为中文"}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 text-xs font-semibold",
        inverted
          ? "border-white/12 bg-white/8 text-white/76 hover:bg-white/12"
          : "border-black/10 bg-white/76 text-black/62 hover:bg-white hover:text-black/82",
        compact ? "px-3" : "min-w-[5.75rem]",
      )}
      type="button"
      onClick={switchLocale}
    >
      <Languages className="size-3.5" />
      <span>{locale === "zh" ? "中文" : "EN"}</span>
      {!compact ? <span className={cn(inverted ? "text-white/36" : "text-black/30")}>/</span> : null}
      {!compact ? <span className={cn(locale === "zh" ? "text-black/36" : "text-black/70", inverted && "text-white/54")}>{locale === "zh" ? "EN" : "中文"}</span> : null}
    </button>
  );
}
