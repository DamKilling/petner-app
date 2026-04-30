import { notFound } from "next/navigation";

import { deleteMemory, updateMemory } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getMemory } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function EditMemoryPage({
  params,
}: {
  params: Promise<{ memoryId: string }>;
}) {
  const { memoryId } = await params;
  const [locale, user, memory] = await Promise.all([getRequestLocale(), getCurrentUser(), getMemory(memoryId)]);
  const copy = getDictionary(locale).editor;

  if (!user || !memory || memory.owner_id !== user.id) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href={`/app/tree/${memory.id}`} variant="secondary">{copy.backToDetail}</ButtonLink>}
        eyebrow="Edit Memory"
        title={copy.editMemoryTitle}
        description={copy.editMemoryDescription}
      />

      <Panel>
        <form action={updateMemory} className="grid gap-4">
          <input name="memory_id" type="hidden" value={memory.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={getDictionary(locale).memoryComposer.titleLabel} name="title" defaultValue={memory.title} required />
            <Field label={getDictionary(locale).memoryComposer.subtitleLabel} name="subtitle" defaultValue={memory.subtitle} required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={getDictionary(locale).memoryComposer.dateLabel} name="date_text" defaultValue={memory.date_text} required />
            <SelectField label={getDictionary(locale).memoryComposer.ornamentLabel} name="ornament" defaultValue={memory.ornament}>
              <option value="star">star</option>
              <option value="bell">bell</option>
              <option value="heart">heart</option>
              <option value="paw">paw</option>
            </SelectField>
            <SelectField label={getDictionary(locale).memoryComposer.accentLabel} name="accent" defaultValue={memory.accent}>
              <option value="pine">pine</option>
              <option value="ember">ember</option>
              <option value="sky">sky</option>
              <option value="peach">peach</option>
              <option value="mint">mint</option>
            </SelectField>
          </div>
          <TextArea label={getDictionary(locale).memoryComposer.storyLabel} name="story" defaultValue={memory.story} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.replacePhoto} name="photo" type="file" />
            <Field label={copy.replaceAudio} name="audio" type="file" />
          </div>
          <p className="text-sm text-black/50">{copy.optionalReplacement}</p>
          <SubmitButton>{copy.saveChanges}</SubmitButton>
        </form>
      </Panel>

      <Panel className="border-red-200 bg-red-50/60">
        <h2 className="text-xl font-semibold text-red-700">{copy.deleteMemory}</h2>
        <p className="mt-2 text-sm leading-6 text-red-700/70">{copy.deleteWarning}</p>
        <form action={deleteMemory} className="mt-5">
          <input name="memory_id" type="hidden" value={memory.id} />
          <ConfirmSubmitButton message={copy.confirmDelete}>{copy.deleteMemory}</ConfirmSubmitButton>
        </form>
      </Panel>
    </div>
  );
}
