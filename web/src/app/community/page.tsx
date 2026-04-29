import { MarketingShell } from "@/components/marketing-shell";
import { PetCard, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";
import { demoPets, demoPosts } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function CommunityPage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).publicPages.community;
  const landing = getDictionary(locale).landing;

  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          action={<ButtonLink href="/app/match?tab=community">{copy.action}</ButtonLink>}
        />

        <div className="flex flex-wrap gap-2">
          {copy.tabs.map((item, index) => (
            <span
              key={item}
              className={index === 0 ? "rounded-full bg-[#f06f4f] px-4 py-2 text-sm font-semibold text-white" : "rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/60"}
            >
              {item}
            </span>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.35fr]">
          <div className="grid gap-4">
            {demoPosts.map((post) => (
              <article key={post.id} className="rounded-[1.8rem] border border-black/8 bg-white/82 p-6 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <TrustBadge label={landing.badges[1]} tone="verified" />
                  <TrustBadge label={locale === "en" ? "Good for video intro" : "适合先视频认识"} tone="trust" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">
                  {post.pet_name} · {post.topic}
                </h2>
                <p className="mt-2 text-sm text-black/52">{post.city}</p>
                <p className="mt-4 text-sm leading-7 text-black/66">{post.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/58">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-[#b54a2f]">
                  <ButtonLink href="/app/match?tab=community" variant="ghost" className="px-0">
                    {copy.completeContent}
                  </ButtonLink>
                  <ButtonLink href="/app/match?tab=services" variant="ghost" className="px-0">
                    {copy.findPlaymate}
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-4">
            {demoPets.map((pet) => (
              <PetCard key={pet.id} locale={locale} pet={pet} href="/app/match?tab=community" compact />
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
