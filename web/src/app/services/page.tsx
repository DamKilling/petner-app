import { MarketingShell } from "@/components/marketing-shell";
import { BookingTimeline, ReviewHighlight, ServiceCard } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";
import { demoBookings, demoReviewSummary, demoServiceOffers } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function ServicesPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).publicPages.services;

  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<ButtonLink href="/app/match?tab=services">{copy.action}</ButtonLink>}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {copy.chips.map((item) => (
            <div key={item} className="rounded-[1.6rem] border border-black/8 bg-white/76 p-4 text-sm font-semibold text-black/72">
              {item}
            </div>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.42fr]">
          <div className="grid gap-4">
            {demoServiceOffers.map((offer) => (
              <ServiceCard key={offer.id} locale={locale} offer={offer} href="/app/match?tab=services" />
            ))}
          </div>
          <div className="grid gap-4">
            <ReviewHighlight locale={locale} summary={demoReviewSummary} />
            <div className="rounded-[1.8rem] border border-black/8 bg-white/82 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
              <h2 className="text-xl font-semibold">{copy.flowTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-black/60">{copy.flowDescription}</p>
              <div className="mt-5">
                <BookingTimeline locale={locale} items={demoBookings} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
