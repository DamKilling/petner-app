import { notFound } from "next/navigation";

import { SignedVideo } from "@/components/media";
import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { getVideo } from "@/lib/data";
import { statusLabel } from "@/lib/theme";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await getVideo(videoId);

  if (!video) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/videos" variant="secondary">返回视频</ButtonLink>}
        eyebrow="Video Detail"
        title={video.title}
        description={video.caption}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.7fr]">
        <SignedVideo path={video.asset_path} />
        <Panel>
          <p className="text-sm font-semibold text-[#f06f4f]">{statusLabel[video.status]}</p>
          <p className="mt-4 text-sm text-black/55">时长: {video.duration_text}</p>
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
