import { notFound } from "next/navigation";

import { deleteServiceOffer, updateServiceOffer } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getOwnedPets, getServiceOfferDetail } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function EditServiceOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).editor;
  const user = await getCurrentUser();
  const offer = await getServiceOfferDetail(offerId);

  if (!user || !offer || offer.provider_id !== user.id) {
    notFound();
  }

  const pets = await getOwnedPets(user.id);

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href={`/app/match/services/${offer.id}`} variant="secondary">{copy.backToDetail}</ButtonLink>}
        eyebrow="Edit Service"
        title={copy.editServiceOfferTitle}
        description={copy.editServiceOfferDescription}
      />

      <Panel>
        <form action={updateServiceOffer} className="grid gap-4">
          <input name="offer_id" type="hidden" value={offer.id} />
          <Field label={copy.serviceTitle} name="title" defaultValue={offer.title ?? ""} required />
          <SelectField label={getDictionary(locale).match.relatedPet} name="related_pet_id" defaultValue={offer.related_pet_id ?? ""}>
            <option value="">{copy.noRelatedPet}</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </SelectField>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.serviceTypes} name="service_types" defaultValue={offer.service_types.join(" ")} required />
            <Field label={copy.serviceArea} name="service_area" defaultValue={offer.service_area} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={copy.availability} name="availability_summary" defaultValue={offer.availability_summary} required />
            <Field label={copy.priceMode} name="price_mode" defaultValue={offer.price_mode} required />
          </div>
          <TextArea label={copy.intro} name="intro" defaultValue={offer.intro} required />
          <SubmitButton>{copy.saveChanges}</SubmitButton>
        </form>
      </Panel>

      <Panel className="border-red-200 bg-red-50/60">
        <h2 className="text-xl font-semibold text-red-700">{copy.deleteServiceOffer}</h2>
        <p className="mt-2 text-sm leading-6 text-red-700/70">{copy.deleteWarning}</p>
        <form action={deleteServiceOffer} className="mt-5">
          <input name="offer_id" type="hidden" value={offer.id} />
          <ConfirmSubmitButton message={copy.confirmDelete}>{copy.deleteServiceOffer}</ConfirmSubmitButton>
        </form>
      </Panel>
    </div>
  );
}
