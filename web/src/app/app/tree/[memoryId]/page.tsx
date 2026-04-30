import { notFound } from "next/navigation";

import { SignedImage } from "@/components/media";
import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { getMemory, getSignedMediaUrl } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ memoryId: string }>;
}) {
  const { memoryId } = await params;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).tree;
  const memory = await getMemory(memoryId);

  if (!memory) {
    notFound();
  }

  const audioUrl = await getSignedMediaUrl(memory.audio_path);

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/tree" variant="secondary">{copy.backToTree}</ButtonLink>}
        eyebrow={copy.memoryEyebrow}
        title={memory.title}
        description={memory.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <SignedImage alt={memory.title} path={memory.photo_path} />
        <Panel>
          <p className="text-sm font-semibold text-[#f06f4f]">{memory.date_text}</p>
          <p className="mt-6 text-lg leading-8 text-black/68">{memory.story}</p>
          {audioUrl ? (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-black/55">
                {memory.audio_display_name ?? copy.audioMemory}
              </p>
              <audio className="w-full" controls src={audioUrl} />
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
