import { notFound } from "next/navigation";

import { createBookingDraft, openServiceChat } from "@/app/actions";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { PetCard, ReviewHighlight, TrustBadge } from "@/components/product-ui";
import { getReviewSummary, getServiceOfferDetail } from "@/lib/data";

export default async function ServiceOfferDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const [offer, reviewSummary] = await Promise.all([getServiceOfferDetail(offerId), getReviewSummary()]);

  if (!offer) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Service Detail"
        title={offer.title ?? "服务详情"}
        description={offer.intro}
        action={<ButtonLink href="/app/match?tab=services" variant="secondary">返回服务广场</ButtonLink>}
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
                <p className="text-xs text-black/42">服务区域</p>
                <p className="mt-1 font-semibold">{offer.service_area}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">可约时间</p>
                <p className="mt-1 font-semibold">{offer.availability_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">价格方式</p>
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
                <SubmitButton>发起联系</SubmitButton>
              </form>
              <form action={createBookingDraft}>
                <input name="source_kind" type="hidden" value="offer" />
                <input name="source_id" type="hidden" value={offer.id} />
                <SubmitButton variant="secondary">进入预约</SubmitButton>
              </form>
            </div>
          </Panel>

          {offer.related_pet ? (
            <PetCard pet={offer.related_pet} href={`/app/match/pets/${offer.related_pet.id}`} ctaLabel="查看宠物档案" />
          ) : (
            <Panel>
              <h2 className="text-xl font-semibold">这个服务没有绑定宠物档案</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">可以先通过聊天确认具体服务对象、经验和安全信息。</p>
            </Panel>
          )}
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <ReviewHighlight summary={reviewSummary} />
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">提供者</p>
            <h2 className="mt-3 text-2xl font-semibold">{offer.provider_name}</h2>
            <p className="mt-2 text-sm text-black/56">{offer.response_time_label}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
