import { notFound } from "next/navigation";

import { deletePost, updatePost } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getOwnedPets, getPost } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).editor;
  const user = await getCurrentUser();
  const data = user ? await getPost(postId, user.id) : null;

  if (!user || !data || data.post.author_id !== user.id) {
    notFound();
  }

  const pets = await getOwnedPets(user.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href={`/app/match/posts/${data.post.id}`} variant="secondary">{copy.backToDetail}</ButtonLink>}
        eyebrow="Edit Post"
        title={copy.editPostTitle}
        description={copy.editPostDescription}
      />

      <Panel>
        <form action={updatePost} className="grid gap-4">
          <input name="post_id" type="hidden" value={data.post.id} />
          <SelectField label={getDictionary(locale).match.relatedPet} name="related_pet_id" defaultValue={data.post.related_pet_id ?? ""}>
            <option value="">{copy.noRelatedPet}</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={copy.fallbackPetName} name="pet_name" defaultValue={data.post.pet_name} required />
            <Field label={copy.topic} name="topic" defaultValue={data.post.topic} required />
            <Field label={copy.city} name="city" defaultValue={data.post.city} required />
          </div>
          <TextArea label={copy.content} name="content" defaultValue={data.post.content} required />
          <Field label={copy.tags} name="tags" defaultValue={data.post.tags.join(" ")} />
          <SubmitButton>{copy.saveChanges}</SubmitButton>
        </form>
      </Panel>

      <Panel className="border-red-200 bg-red-50/60">
        <h2 className="text-xl font-semibold text-red-700">{copy.deletePost}</h2>
        <p className="mt-2 text-sm leading-6 text-red-700/70">{copy.deleteWarning}</p>
        <form action={deletePost} className="mt-5">
          <input name="post_id" type="hidden" value={data.post.id} />
          <ConfirmSubmitButton message={copy.confirmDelete}>{copy.deletePost}</ConfirmSubmitButton>
        </form>
      </Panel>
    </div>
  );
}
