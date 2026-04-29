import { ArrowRight, CheckCircle2, HeartHandshake, MessageCircleMore, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { PetCard, ReviewHighlight, ServiceCard, TrustBadge } from "@/components/product-ui";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { ButtonLink } from "@/components/ui";
import { demoPets, demoReviewSummary, demoServiceOffers } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

const featureIcons = [UsersRound, HeartHandshake, Sparkles];

export default async function Home() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale);
  const landing = copy.landing;

  return (
    <MarketingShell>
      <section className="grid gap-8 pb-12 pt-3 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-18">
        <RevealOnScroll className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">
            <ShieldCheck className="size-3.5" />
            {landing.heroEyebrow}
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">{landing.heroTitle}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-black/62 md:text-lg">{landing.heroDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/app">{landing.primaryCta}</ButtonLink>
            <ButtonLink href="/community" variant="secondary">
              {landing.secondaryCta}
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <TrustBadge label={landing.badges[0]} tone="verified" />
            <TrustBadge label={landing.badges[1]} tone="trust" />
            <TrustBadge label={landing.badges[2]} tone="warm" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="grid gap-4" delay={120}>
          <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-[#1f1916] p-5 text-white shadow-[0_30px_80px_rgba(32,25,22,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/48">{landing.petPreview}</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {demoPets[0].name} · {demoPets[0].breed}
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">{landing.coreFeature}</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[0.75fr_1fr]">
              <div className="flex min-h-52 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#ffd3b7,#b7d7d0)] text-7xl">
                🐶
              </div>
              <div className="grid gap-4">
                <div className="rounded-[1.3rem] bg-white/8 p-4">
                  <p className="text-xs text-white/48">{landing.socialProfile}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demoPets[0].personality_tags?.map((item) => (
                      <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/82">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.3rem] bg-white/8 p-4">
                    <p className="text-xs text-white/48">{landing.energyLevel}</p>
                    <p className="mt-2 text-lg font-semibold">{landing.high}</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/8 p-4">
                    <p className="text-xs text-white/48">{landing.socialFriendly}</p>
                    <p className="mt-2 text-lg font-semibold">{landing.high}</p>
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-[#f6b38d]/12 p-4 text-sm leading-6 text-white/80">
                  {landing.petSafetyNote}
                </div>
              </div>
            </div>
          </div>
          <ReviewHighlight locale={locale} summary={demoReviewSummary} />
        </RevealOnScroll>
      </section>

      <section className="grid gap-4 border-t border-black/8 py-12 md:grid-cols-3">
        {landing.featured.map((item, index) => {
          const Icon = featureIcons[index] ?? Sparkles;
          return (
            <RevealOnScroll
              key={item.title}
              className="rounded-[1.8rem] border border-black/8 bg-white/72 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.05)]"
              delay={index * 90}
            >
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-[#f06f4f]/12 text-[#b14e31]">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/60">{item.detail}</p>
              <ButtonLink href={item.href} variant="ghost" className="mt-5 px-0">
                {item.cta}
              </ButtonLink>
            </RevealOnScroll>
          );
        })}
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <RevealOnScroll className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">{landing.communityKicker}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">{landing.communityTitle}</h2>
          <p className="mt-4 text-base leading-8 text-black/62">{landing.communityDescription}</p>
          <ButtonLink href="/community" variant="secondary" className="mt-6">
            {landing.communityCta}
          </ButtonLink>
        </RevealOnScroll>
        <RevealOnScroll className="grid gap-4 md:grid-cols-2" delay={120}>
          <PetCard href="/community" locale={locale} pet={demoPets[0]} ctaLabel={landing.petProfileCta} compact />
          <PetCard href="/community" locale={locale} pet={demoPets[1]} ctaLabel={landing.petDailyCta} compact />
        </RevealOnScroll>
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <RevealOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">{landing.flowKicker}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">{landing.flowTitle}</h2>
          <div className="mt-6 grid gap-3">
            {landing.flowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-[1.4rem] border border-black/8 bg-white/76 px-4 py-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f06f4f] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-black/68">{step}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
        <RevealOnScroll className="grid gap-4" delay={120}>
          {demoServiceOffers.map((offer) => (
            <ServiceCard key={offer.id} locale={locale} offer={offer} href="/services" />
          ))}
        </RevealOnScroll>
      </section>

      <section className="grid gap-6 border-t border-black/8 py-12 lg:grid-cols-[1fr_0.9fr]">
        <RevealOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">{landing.trustKicker}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">{landing.trustTitle}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-black/62">{landing.trustDescription}</p>
        </RevealOnScroll>
        <RevealOnScroll className="grid gap-3" delay={120}>
          {landing.trustBullets.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-black/8 bg-white/76 p-4">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4b7b5b]" />
              <p className="text-sm leading-6 text-black/66">{item}</p>
            </div>
          ))}
          <ButtonLink href="/safety" variant="secondary" className="mt-2">
            {landing.trustCta}
          </ButtonLink>
        </RevealOnScroll>
      </section>

      <RevealOnScroll className="rounded-[2.2rem] bg-[#1f1916] px-6 py-10 text-white shadow-[0_28px_80px_rgba(32,25,22,0.18)] md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">{landing.finalKicker}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">{landing.finalTitle}</h2>
            <p className="mt-4 text-base leading-8 text-white/64">{landing.finalDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/app">
              {landing.ownerCta}
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              {landing.serviceCta}
            </ButtonLink>
            <ButtonLink href="/app/chats" variant="ghost" className="text-white hover:text-white/76">
              <MessageCircleMore className="mr-2 size-4" />
              {landing.messagesCta}
            </ButtonLink>
          </div>
        </div>
      </RevealOnScroll>
    </MarketingShell>
  );
}
