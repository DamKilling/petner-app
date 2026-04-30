import { notFound } from "next/navigation";

import { deleteServiceRequest, updateServiceRequest } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getOwnedPets, getServiceRequestDetail } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function EditServiceRequestPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).editor;
  const user = await getCurrentUser();
  const request = await getServiceRequestDetail(requestId);

  if (!user || !request || request.requester_id !== user.id) {
    notFound();
  }

  const pets = await getOwnedPets(user.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href={`/app/match/requests/${request.id}`} variant="secondary">{copy.backToDetail}</ButtonLink>}
        eyebrow="Edit Request"
        title={copy.editServiceRequestTitle}
        description={copy.editServiceRequestDescription}
      />

      <Panel>
        <form action={updateServiceRequest} className="grid gap-4">
          <input name="request_id" type="hidden" value={request.id} />
          <Field label={copy.requestTitle} name="title" defaultValue={request.title} required />
          <SelectField label={getDictionary(locale).match.relatedPet} name="related_pet_id" defaultValue={request.related_pet_id ?? ""}>
            <option value="">{copy.noRelatedPet}</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label={copy.requestType} name="request_type" defaultValue={request.request_type}>
              <option value="宠物陪伴">宠物陪伴</option>
              <option value="玩伴匹配">玩伴匹配</option>
              <option value="临时照看">临时照看</option>
              <option value="附近活动">附近活动</option>
            </SelectField>
            <Field label={copy.city} name="city" defaultValue={request.city} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.preferredTime} name="preferred_time_summary" defaultValue={request.preferred_time_summary} required />
            <Field label={copy.budget} name="budget_summary" defaultValue={request.budget_summary} required />
          </div>
          <TextArea label={copy.detail} name="detail" defaultValue={request.detail} required />
          <SubmitButton>{copy.saveChanges}</SubmitButton>
        </form>
      </Panel>

      <Panel className="border-red-200 bg-red-50/60">
        <h2 className="text-xl font-semibold text-red-700">{copy.deleteServiceRequest}</h2>
        <p className="mt-2 text-sm leading-6 text-red-700/70">{copy.deleteWarning}</p>
        <form action={deleteServiceRequest} className="mt-5">
          <input name="request_id" type="hidden" value={request.id} />
          <ConfirmSubmitButton message={copy.confirmDelete}>{copy.deleteServiceRequest}</ConfirmSubmitButton>
        </form>
      </Panel>
    </div>
  );
}
