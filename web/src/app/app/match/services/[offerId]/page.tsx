import { notFound } from "next/navigation";

import { createBookingDraft, deleteServiceOffer, openServiceChat } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PetCard, ProfileSummary, ReviewHighlight, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getCurrentUser, getReviewSummary, getServiceOfferDetail } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

function serviceDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        eyebrow: "Service Detail",
        fallbackTitle: "Service detail",
        back: "Back to services",
        provider: "Service provider",
        area: "Service area",
        time: "Availability",
        price: "Pricing",
        contact: "Contact",
        book: "Start booking",
        viewPet: "View pet profile",
        noPetTitle: "This service is not linked to a pet profile",
        noPetDetail: "Chat first to confirm the service target, experience, and safety details.",
      }
    : {
        eyebrow: "服务详情",
        fallbackTitle: "服务详情",
        back: "返回服务广场",
        provider: "服务者",
        area: "服务区域",
        time: "可约时间",
        price: "价格方式",
        contact: "发起联系",
        book: "进入预约",
        viewPet: "查看宠物档案",
        noPetTitle: "这个服务没有绑定宠物档案",
        noPetDetail: "可以先通过聊天确认具体服务对象、经验和安全信息。",
      };
}

export default async function ServiceOfferDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const locale = await getRequestLocale();
  const copy = serviceDetailCopy(locale);
  const editorCopy = getDictionary(locale).editor;
  const [offer, reviewSummary, user] = await Promise.all([
    getServiceOfferDetail(offerId),
    getReviewSummary(),
    getCurrentUser(),
  ]);

  if (!offer) {
    notFound();
  }
  const canEdit = Boolean(user && offer.provider_id === user.id);

  return (
    <div className="grid gap-8">
      {canEdit ? (
        <div className="flex justify-end gap-2">
          <ButtonLink href={`/app/match/services/${offer.id}/edit`}>{editorCopy.edit}</ButtonLink>
          <form action={deleteServiceOffer}>
            <input name="offer_id" type="hidden" value={offer.id} />
            <ConfirmSubmitButton message={editorCopy.confirmDelete}>
              {editorCopy.deleteServiceOffer}
            </ConfirmSubmitButton>
          </form>
        </div>
      ) : null}
      <PageHeader
        eyebrow={copy.eyebrow}
        title={offer.title ?? copy.fallbackTitle}
        description={offer.intro}
        action={<ButtonLink href="/app/match?tab=services" variant="secondary">{copy.back}</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="grid gap-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              {offer.service_types.map((item) => (
                <span key={item} className="rounded-full bg-[#f06f4f]/12 px-3 py-1 text-xs font-semibold text-[#9b321c]">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-black/42">{copy.area}</p>
                <p className="mt-1 font-semibold">{offer.service_area}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.time}</p>
                <p className="mt-1 font-semibold">{offer.availability_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.price}</p>
                <p className="mt-1 font-semibold">{offer.price_mode}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {offer.trust_badges.map((badge) => (
                <TrustBadge key={badge} label={badge} tone="trust" />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={openServiceChat}>
                <input name="source_kind" type="hidden" value="offer" />
                <input name="source_id" type="hidden" value={offer.id} />
                <SubmitButton>{copy.contact}</SubmitButton>
              </form>
              <form action={createBookingDraft}>
                <input name="source_kind" type="hidden" value="offer" />
                <input name="source_id" type="hidden" value={offer.id} />
                <SubmitButton variant="secondary">{copy.book}</SubmitButton>
              </form>
            </div>
          </Panel>

          {offer.related_pet ? (
            <PetCard locale={locale} pet={offer.related_pet} href={`/app/match/pets/${offer.related_pet.id}`} ctaLabel={copy.viewPet} />
          ) : (
            <Panel>
              <h2 className="text-xl font-semibold">{copy.noPetTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">{copy.noPetDetail}</p>
            </Panel>
          )}
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <ReviewHighlight locale={locale} summary={reviewSummary} />
          <ProfileSummary
            fallbackName={offer.provider_name}
            locale={locale}
            profile={offer.provider_profile}
            roleLabel={copy.provider}
          />
        </div>
      </div>
    </div>
  );
}
