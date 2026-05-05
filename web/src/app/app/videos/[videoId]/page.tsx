import { notFound } from "next/navigation";

import { SignedVideo } from "@/components/media";
import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { getVideo } from "@/lib/data";
import { getRequestLocale } from "@/lib/i18n-server";
import type { UploadStatus } from "@/lib/types";

const videoStatusCopy: Record<"zh" | "en", Record<UploadStatus, string>> = {
  zh: {
    draft: "草稿",
    uploading: "上传中",
    reviewing: "审核中",
    published: "已发布",
  },
  en: {
    draft: "Draft",
    uploading: "Uploading",
    reviewing: "In review",
    published: "Published",
  },
};

function videoDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        back: "Back to videos",
        eyebrow: "Video Detail",
        duration: "Duration",
      }
    : {
        back: "返回视频",
        eyebrow: "视频详情",
        duration: "时长",
      };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const locale = await getRequestLocale();
  const copy = videoDetailCopy(locale);
  const video = await getVideo(videoId);

  if (!video) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/videos" variant="secondary">{copy.back}</ButtonLink>}
        eyebrow={copy.eyebrow}
        title={video.title}
        description={video.caption}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.7fr]">
        <SignedVideo path={video.asset_path} />
        <Panel>
          <p className="text-sm font-semibold text-[#f06f4f]">{videoStatusCopy[locale][video.status]}</p>
          <p className="mt-4 text-sm text-black/55">{copy.duration}: {video.duration_text}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
