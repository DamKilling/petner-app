import Link from "next/link";

import { addVideo } from "@/app/actions";
import { EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getVideos } from "@/lib/data";
import { accentSoftClasses, statusLabel } from "@/lib/theme";

export default async function VideosPage() {
  const user = await getCurrentUser();
  const videos = await getVideos(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Video"
        title="宠物视频发布"
        description="上传真实视频文件，保存标题、文案、标签和发布状态。v1 不做转码，直接浏览器播放。"
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1fr]">
        <Panel>
          <h2 className="text-2xl font-semibold">上传新视频</h2>
          <form action={addVideo} className="mt-6 grid gap-4">
            <Field label="视频文件" name="video" required type="file" />
            <Field label="标题" name="title" required />
            <Field defaultValue="00:30" label="时长" name="duration_text" required />
            <TextArea label="视频描述" name="caption" required />
            <Field defaultValue="成长 日常" label="标签" name="tags" />
            <SelectField defaultValue="peach" label="主题色" name="accent">
              <option value="peach">Peach</option>
              <option value="ember">Ember</option>
              <option value="sky">Sky</option>
              <option value="mint">Mint</option>
            </SelectField>
            <SubmitButton>上传并进入详情</SubmitButton>
          </form>
        </Panel>

        <section className="grid gap-4">
          {videos.length ? (
            videos.map((video) => (
              <Link
                className="rounded-[2rem] border border-black/10 bg-white/78 p-6 hover:-translate-y-0.5 hover:bg-white"
                href={`/app/videos/${video.id}`}
                key={video.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{video.title}</h2>
                    <p className="mt-2 text-sm text-black/52">{video.duration_text}</p>
                  </div>
                  <span className={accentSoftClasses[video.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
                    {statusLabel[video.status]}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/55">{video.caption}</p>
              </Link>
            ))
          ) : (
            <EmptyState title="还没有视频" detail="上传第一个宠物视频，验证真实 Storage 文件流。" />
          )}
        </section>
      </div>
    </div>
  );
}
