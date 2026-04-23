import type { AccentToken, UploadStatus } from "@/lib/types";

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
