import type { AccentToken, UploadStatus } from "@/lib/types";

export const designTokens = {
  background: {
    base: "#FFF9F2",
    subtle: "#F6EFE5",
    raised: "#FFFDFC",
    dark: "#1F1916",
  },
  text: {
    primary: "#2F241E",
    secondary: "rgba(47, 36, 30, 0.64)",
    tertiary: "rgba(47, 36, 30, 0.46)",
  },
  accent: {
    primary: "#F06F4F",
    primarySoft: "rgba(240, 111, 79, 0.12)",
    sage: "#9BB89A",
    trust: "#8CB7D9",
    gold: "#E7C57A",
  },
} as const;

export const accentClasses: Record<AccentToken, string> = {
  ember: "bg-[#f06f4f] text-white",
  pine: "bg-[#1f6f4a] text-white",
  sky: "bg-[#58a9d6] text-slate-950",
  peach: "bg-[#f6b38d] text-slate-950",
  plum: "bg-[#7a5ea7] text-white",
  mint: "bg-[#8dd7b6] text-slate-950",
};

export const accentSoftClasses: Record<AccentToken, string> = {
  ember: "bg-[#f06f4f]/12 text-[#9b321c]",
  pine: "bg-[#1f6f4a]/12 text-[#155437]",
  sky: "bg-[#58a9d6]/14 text-[#24617c]",
  peach: "bg-[#f6b38d]/18 text-[#9a4e2c]",
  plum: "bg-[#7a5ea7]/14 text-[#4f3a75]",
  mint: "bg-[#8dd7b6]/18 text-[#2f6c51]",
};

export const statusLabel: Record<UploadStatus, string> = {
  draft: "草稿",
  uploading: "上传中",
  reviewing: "审核中",
  published: "已发布",
};

export const trustToneClasses = {
  verified: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  trust: "border border-sky-200 bg-sky-50 text-sky-700",
  warm: "border border-orange-200 bg-orange-50 text-orange-700",
  neutral: "border border-black/10 bg-black/[0.03] text-black/60",
  warning: "border border-amber-200 bg-amber-50 text-amber-700",
} as const;
