import { MarketingShell } from "@/components/marketing-shell";
import { PetCard, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";
import { demoPets, demoPosts } from "@/lib/demo-data";

export default function CommunityPage() {
  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Community"
          title="真实日常、找玩伴与经验分享，会在同一条内容流里自然发生。"
          description="PetLife 的社区不是泛内容论坛，而是围绕宠物关系和陪伴场景组织的内容流。每条内容都尽量带出宠物档案与信任信息，方便继续互动。"
          action={<ButtonLink href="/app/match?tab=community">进入社区工作区</ButtonLink>}
        />

        <div className="flex flex-wrap gap-2">
          {["推荐", "找玩伴", "宠物日常", "求助问答", "经验分享"].map((item, index) => (
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
                  <TrustBadge label="宠物信息完整" tone="verified" />
                  <TrustBadge label="适合先视频认识" tone="trust" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{post.pet_name} · {post.topic}</h2>
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
                    查看完整内容流
                  </ButtonLink>
                  <ButtonLink href="/app/match?tab=services" variant="ghost" className="px-0">
                    我也想找玩伴
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-4">
            {demoPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} href="/app/match?tab=community" compact />
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
