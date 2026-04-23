import { MarketingShell } from "@/components/marketing-shell";
import { BookingTimeline, ReviewHighlight, ServiceCard } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";
import { demoBookings, demoReviewSummary, demoServiceOffers } from "@/lib/demo-data";

export default function ServicesPage() {
  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Services"
          title="服务发现不该靠猜，而应该在列表页就能看懂是否靠谱、是否适合联系。"
          description="PetLife 把宠物陪伴、玩伴匹配、临时照看和附近活动放进同一套服务逻辑里：先看资料，再发起联系，再进入预约。"
          action={<ButtonLink href="/app/match?tab=services">进入服务工作区</ButtonLink>}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {["宠物陪伴", "玩伴匹配", "临时照看 / 遛宠"].map((item) => (
            <div key={item} className="rounded-[1.6rem] border border-black/8 bg-white/76 p-4 text-sm font-semibold text-black/72">
              {item}
            </div>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
          <div className="grid gap-4">
            {demoServiceOffers.map((offer) => (
              <ServiceCard key={offer.id} offer={offer} href="/app/match?tab=services" />
            ))}
          </div>
          <div className="grid gap-4">
            <ReviewHighlight summary={demoReviewSummary} />
            <div className="rounded-[1.8rem] border border-black/8 bg-white/82 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
              <h2 className="text-xl font-semibold">预约流程一眼看懂</h2>
              <p className="mt-2 text-sm leading-6 text-black/60">先联系、再确认细节、再进入预约，不把用户直接丢进冷冰冰的表单里。</p>
              <div className="mt-5">
                <BookingTimeline items={demoBookings} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
