import { notFound } from "next/navigation";

import { deleteMemory } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SignedImage } from "@/components/media";
import { MemoryAccentBadge, MemoryOrnamentIcon, normalizeMemoryAccent } from "@/components/memory-style-options";
import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { getCurrentUser, getMemory, getSignedMediaUrl } from "@/lib/data";
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
  const [memory, user] = await Promise.all([getMemory(memoryId), getCurrentUser()]);

  if (!memory) {
    notFound();
  }

  const audioUrl = await getSignedMediaUrl(memory.audio_path);
  const canEdit = Boolean(user && memory.owner_id === user.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/app/tree" variant="secondary">{copy.backToTree}</ButtonLink>
            {canEdit ? (
              <ButtonLink href={`/app/tree/${memory.id}/edit`}>{getDictionary(locale).editor.edit}</ButtonLink>
            ) : null}
            {canEdit ? (
              <form action={deleteMemory}>
                <input name="memory_id" type="hidden" value={memory.id} />
                <ConfirmSubmitButton message={getDictionary(locale).editor.confirmDelete}>
                  {getDictionary(locale).editor.delete}
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </div>
        }
        eyebrow={copy.memoryEyebrow}
        title={memory.title}
        description={memory.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <SignedImage alt={memory.title} path={memory.photo_path} />
        <Panel>
          <MemoryAccentBadge accent={normalizeMemoryAccent(memory.accent)} className="text-sm">
            <MemoryOrnamentIcon ornament={memory.ornament} />
            {memory.date_text}
          </MemoryAccentBadge>
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
