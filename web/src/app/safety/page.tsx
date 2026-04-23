import { ShieldCheck, UserRoundCheck, Syringe, BadgeCheck, Clock3, MessageCircleMore } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader } from "@/components/ui";

const safetyItems = [
  {
    title: "身份与资料认证",
    detail: "身份状态不藏在角落，而是直接出现在资料卡、服务卡和聊天页顶部。",
    icon: UserRoundCheck,
  },
  {
    title: "宠物信息与疫苗状态",
    detail: "宠物档案中展示疫苗、健康摘要、性格与社交友好度，帮助用户先判断适配度。",
    icon: Syringe,
  },
  {
    title: "历史评价与复约记录",
    detail: "评分、评价标签、复约次数会贯穿在服务详情、个人主页和预约流程里。",
    icon: BadgeCheck,
  },
  {
    title: "响应速度与沟通记录",
    detail: "聊天页会展示响应速度与预约状态，帮助双方判断当前关系进度。",
    icon: Clock3,
  },
];

export default function SafetyPage() {
  return (
    <MarketingShell>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Trust & Safety"
          title="让用户放心，不靠一句“平台保障”，而靠每一步都看得见的信任信息。"
          description="PetLife 会把身份、宠物信息、评价、复约记录、响应速度和安全提示直接嵌到卡片、详情页、消息页和预约流程里。"
          action={<ButtonLink href="/app/match?tab=services">去看看服务卡怎么呈现</ButtonLink>}
        />

        <div className="flex flex-wrap gap-2">
          <TrustBadge label="身份认证" tone="verified" />
          <TrustBadge label="宠物信息完整" tone="trust" />
          <TrustBadge label="历史评价可追溯" tone="warm" />
          <TrustBadge label="流程安全提醒" tone="neutral" />
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {safetyItems.map((item) => {
            const Icon = item.icon;
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
              <h2 className="text-2xl font-semibold">安全提示会出现在真正需要它的地方</h2>
              <p className="mt-3 text-sm leading-7 text-white/64">
                比如在预约确认前提醒用户核对宠物健康信息、见面地点和应急联系人；在聊天页顶部展示当前是否已进入预约阶段，而不是等问题发生后才去解释。
              </p>
              <ButtonLink href="/app/chats" variant="ghost" className="mt-5 text-white hover:text-white/76">
                <MessageCircleMore className="mr-2 size-4" />
                查看消息页承接方式
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
