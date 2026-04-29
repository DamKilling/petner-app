import { BadgeCheck, Clock3, MessageCircleMore, ShieldCheck, Syringe, UserRoundCheck } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

const icons = [UserRoundCheck, Syringe, BadgeCheck, Clock3];

export default async function SafetyPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).publicPages.safety;

  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<ButtonLink href="/app/match?tab=services">{copy.action}</ButtonLink>}
        />

        <div className="flex flex-wrap gap-2">
          <TrustBadge label={copy.badges[0]} tone="verified" />
          <TrustBadge label={copy.badges[1]} tone="trust" />
          <TrustBadge label={copy.badges[2]} tone="warm" />
          <TrustBadge label={copy.badges[3]} tone="neutral" />
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {copy.items.map((item, index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <div key={item.title} className="rounded-[1.8rem] border border-black/8 bg-white/82 p-6 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
                <div className="flex size-11 items-center justify-center rounded-[1rem] bg-[#f06f4f]/12 text-[#b14e31]">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-black/60">{item.detail}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-[2rem] border border-black/8 bg-[#1f1916] p-6 text-white shadow-[0_28px_80px_rgba(32,25,22,0.16)]">
          <div className="flex items-start gap-4">
            <div className="rounded-[1rem] bg-white/10 p-3 text-[#f6c07b]">
              <ShieldCheck className="size-5" />
            </div>
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold">{copy.tipTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-white/64">{copy.tipDetail}</p>
              <ButtonLink href="/app/chats" variant="ghost" className="mt-5 text-white hover:text-white/76">
                <MessageCircleMore className="mr-2 size-4" />
                {copy.tipCta}
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
