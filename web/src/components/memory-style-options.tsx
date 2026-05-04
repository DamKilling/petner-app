import { Bell, Heart, PawPrint, Star } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";

import type { Dictionary } from "@/lib/i18n";
import { accentClasses, accentSoftClasses } from "@/lib/theme";
import type { AccentToken } from "@/lib/types";
import { cn } from "@/lib/utils";

const ornamentIcons = {
  star: Star,
  bell: Bell,
  heart: Heart,
  paw: PawPrint,
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

const accentTokens = ["pine", "ember", "sky", "peach", "mint"] as const satisfies readonly AccentToken[];

export type MemoryOrnamentToken = keyof typeof ornamentIcons;

export function normalizeMemoryOrnament(value?: string | null): MemoryOrnamentToken {
  return value && value in ornamentIcons ? (value as MemoryOrnamentToken) : "star";
}

export function normalizeMemoryAccent(value?: string | null): AccentToken {
  return accentTokens.some((token) => token === value) ? (value as AccentToken) : "pine";
}

export function MemoryOrnamentIcon({
  ornament,
  className,
}: {
  ornament?: string | null;
  className?: string;
}) {
  const Icon = ornamentIcons[normalizeMemoryOrnament(ornament)];

  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}

export function MemoryAccentBadge({
  accent,
  children,
  className,
}: {
  accent?: string | null;
  children: ReactNode;
  className?: string;
}) {
  const safeAccent = normalizeMemoryAccent(accent);

  return (
    <span className={cn(accentSoftClasses[safeAccent], "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

export function MemoryStylePicker({
  copy,
  defaultOrnament = "star",
  defaultAccent = "pine",
}: {
  copy: Dictionary["memoryComposer"];
  defaultOrnament?: string | null;
  defaultAccent?: string | null;
}) {
  const selectedOrnament = normalizeMemoryOrnament(defaultOrnament);
  const selectedAccent = normalizeMemoryAccent(defaultAccent);

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <fieldset className="min-w-0 rounded-3xl border border-black/10 bg-white/70 p-4">
        <legend className="px-1 text-sm font-semibold text-black/70">{copy.ornamentLabel}</legend>
        <p className="mt-1 text-xs leading-5 text-black/45">{copy.ornamentHelp}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {copy.ornamentOptions.map((option) => {
            const Icon = ornamentIcons[normalizeMemoryOrnament(option.value)];

            return (
              <label key={option.value} className="min-w-0 cursor-pointer">
                <input
                  className="peer sr-only"
                  defaultChecked={option.value === selectedOrnament}
                  name="ornament"
                  type="radio"
                  value={option.value}
                />
                <span className="flex min-w-0 items-center gap-2 rounded-2xl border border-black/8 bg-[#f8f3ec] px-3 py-2 text-sm font-semibold text-black/62 transition peer-checked:border-[#f06f4f]/45 peer-checked:bg-[#fff0e8] peer-checked:text-[#9b321c]">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{option.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="min-w-0 rounded-3xl border border-black/10 bg-white/70 p-4">
        <legend className="px-1 text-sm font-semibold text-black/70">{copy.accentLabel}</legend>
        <p className="mt-1 text-xs leading-5 text-black/45">{copy.accentHelp}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {copy.accentOptions.map((option) => {
            const safeAccent = normalizeMemoryAccent(option.value);

            return (
              <label key={option.value} className="min-w-0 cursor-pointer">
                <input
                  className="peer sr-only"
                  defaultChecked={safeAccent === selectedAccent}
                  name="accent"
                  type="radio"
                  value={safeAccent}
                />
                <span className="flex min-w-0 items-center gap-2 rounded-2xl border border-black/8 bg-[#f8f3ec] px-3 py-2 text-sm font-semibold text-black/62 transition peer-checked:border-[#f06f4f]/45 peer-checked:bg-white peer-checked:text-[#2f241e]">
                  <span className={cn(accentClasses[safeAccent], "size-4 shrink-0 rounded-full")} aria-hidden="true" />
                  <span className="truncate">{option.label}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
