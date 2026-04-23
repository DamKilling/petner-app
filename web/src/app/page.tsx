import { ArrowRight, CheckCircle2, HeartHandshake, MessageCircleMore, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { PetCard, ReviewHighlight, ServiceCard, TrustBadge } from "@/components/product-ui";
import { ButtonLink } from "@/components/ui";
import { demoPets, demoReviewSummary, demoServiceOffers } from "@/lib/demo-data";

const featuredSections = [
  {
    title: "社区内容流",
    detail: "照片、视频、问答与找玩伴信息放在同一条可浏览的内容流里，既活跃也不杂乱。",
    cta: "先看看社区",
    href: "/community",
    icon: UsersRound,
  },
  {
    title: "宠物陪伴与匹配",
    detail: "从附近玩伴、宠物陪伴到临时照看，用清楚的步骤把联系和预约串起来。",
    cta: "寻找玩伴",
    href: "/services",
    icon: HeartHandshake,
  },
  {
    title: "成长记录",
    detail: "宠物档案、成长故事、照片和视频会被整理成长期可回看的陪伴资产。",
    cta: "开始建立档案",
    href: "/app/tree",
    icon: Sparkles,
  },
];

const flowSteps = [
  "浏览社区或服务",
  "查看宠物 / 主人档案",
  "发起联系与聊天",
  "确认时间地点与安全信息",
  "服务完成后评价",
];

export default function Home() {
  return (
    <MarketingShell>
      <section className="grid gap-8 pb-12 pt-3 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-18">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">
            <ShieldCheck className="size-3.5" />
            社区优先的宠物陪伴平台
          </p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">
            在一个地方，认识合适的宠物伙伴，也找到靠谱的陪伴与服务。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-black/62 md:text-lg">
            PetLife 把宠物社交、成长记录、陪伴匹配和服务流程放进同一套清晰的产品体验里，让浏览、信任、联系和预约都更低摩擦。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/app">
              开始使用
            </ButtonLink>
            <ButtonLink href="/community" variant="secondary">
              先看看社区
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <TrustBadge label="身份认证可见" tone="verified" />
            <TrustBadge label="宠物信息完整" tone="trust" />
            <TrustBadge label="历史评价可追溯" tone="warm" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-[#1f1916] p-5 text-white shadow-[0_30px_80px_rgba(32,25,22,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/48">宠物档案预览</p>
                <h2 className="mt-2 text-2xl font-semibold">{demoPets[0].name} · {demoPets[0].breed}</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">核心特色</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[0.75fr_1fr]">
              <div className="flex min-h-52 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,#ffd3b7,#b7d7d0)] text-7xl">
                🐶
              </div>
              <div className="grid gap-4">
                <div className="rounded-[1.3rem] bg-white/8 p-4">
                  <p className="text-xs text-white/48">社交画像</p>
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
                    <p className="text-xs text-white/48">活跃程度</p>
                    <p className="mt-2 text-lg font-semibold">高</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/8 p-4">
                    <p className="text-xs text-white/48">社交友好度</p>
                    <p className="mt-2 text-lg font-semibold">高</p>
                  </div>
                </div>
                <div className="rounded-[1.3rem] border border-white/10 bg-[#f6b38d]/12 p-4 text-sm leading-6 text-white/80">
                  已完成基础疫苗，可先聊天确认见面节奏，再继续预约线下互动。
                </div>
              </div>
            </div>
          </div>
          <ReviewHighlight summary={demoReviewSummary} />
        </div>
      </section>

      <section className="grid gap-4 border-t border-black/8 py-12 md:grid-cols-3">
        {featuredSections.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[1.8rem] border border-black/8 bg-white/72 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.05)]">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-[#f06f4f]/12 text-[#b14e31]">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/60">{item.detail}</p>
              <ButtonLink href={item.href} variant="ghost" className="mt-5 px-0">
                {item.cta}
              </ButtonLink>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">社区精选</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">先看到真实的宠物日常，再决定要不要进一步联系。</h2>
          <p className="mt-4 text-base leading-8 text-black/62">
            社区内容流不是一个杂乱的论坛，而是围绕找玩伴、宠物日常、求助问答和经验分享组织的活跃场域。内容里直接带宠物档案和信任提示，方便快速判断。
          </p>
          <ButtonLink href="/community" variant="secondary" className="mt-6">
            查看更多内容
          </ButtonLink>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <PetCard href="/community" pet={demoPets[0]} ctaLabel="查看宠物档案" compact />
          <PetCard href="/community" pet={demoPets[1]} ctaLabel="看看它的日常" compact />
        </div>
      </section>

      <section className="grid gap-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">服务流程</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">把服务做成一眼能看懂的步骤，而不是一堆说明文案。</h2>
          <div className="mt-6 grid gap-3">
            {flowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-[1.4rem] border border-black/8 bg-white/76 px-4 py-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f06f4f] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-black/68">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          {demoServiceOffers.map((offer) => (
            <ServiceCard key={offer.id} offer={offer} href="/services" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t border-black/8 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b14e31]">信任与安全</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight">重要的不是说自己可靠，而是把可靠展示出来。</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-black/62">
            PetLife 会把身份认证、宠物信息、历史评价、复约记录、响应速度和流程提示直接放在卡片、详情页和预约流程里，让用户在每一步都知道依据是什么。
          </p>
        </div>
        <div className="grid gap-3">
          {[
            "身份认证与宠物信息状态直接出现在卡片和详情页",
            "服务流程内展示安全提示、历史记录与下一步动作",
            "聊天页也能看到宠物档案摘要与预约状态",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-black/8 bg-white/76 p-4">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4b7b5b]" />
              <p className="text-sm leading-6 text-black/66">{item}</p>
            </div>
          ))}
          <ButtonLink href="/safety" variant="secondary" className="mt-2">
            了解平台如何保障安全
          </ButtonLink>
        </div>
      </section>

      <section className="rounded-[2.2rem] bg-[#1f1916] px-6 py-10 text-white shadow-[0_28px_80px_rgba(32,25,22,0.18)] md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">开始使用</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">无论你是宠物主人，还是正在寻找陪伴与玩伴，都可以从清晰的下一步开始。</h2>
            <p className="mt-4 text-base leading-8 text-white/64">
              先建立宠物档案，或先看看附近的社区与匹配信息。PetLife 会把内容、信任和服务流程连接到同一条路径上。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/app">
              我是宠物主人，立即开始
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              我想找玩伴 / 服务
            </ButtonLink>
            <ButtonLink href="/app/chats" variant="ghost" className="text-white hover:text-white/76">
              <MessageCircleMore className="mr-2 size-4" />
              看看消息流如何承接
            </ButtonLink>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
