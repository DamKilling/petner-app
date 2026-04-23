import { CalendarClock, HeartHandshake, ShieldCheck, Sparkles, Syringe } from "lucide-react";
import { notFound } from "next/navigation";

import { openChat } from "@/app/actions";
import { BookingTimeline, ReviewHighlight, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getBookingTimeline, getPet, getReviewSummary } from "@/lib/data";
import { accentSoftClasses } from "@/lib/theme";

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await getPet(petId);
  const reviewSummary = await getReviewSummary();
  const bookings = await getBookingTimeline("demo");

  if (!pet) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/match?tab=community" variant="secondary">返回社区广场</ButtonLink>}
        eyebrow="Pet Profile"
        title={`${pet.name} · ${pet.breed}`}
        description="这不是普通资料卡，而是一张能帮助用户判断是否适合进一步互动、聊天和预约的宠物档案。"
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="overflow-hidden rounded-[2.2rem] border border-black/8 bg-[#1f1916] p-6 text-white shadow-[0_28px_80px_rgba(32,25,22,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={accentSoftClasses[pet.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
              {pet.city}
            </span>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={pet.vaccinated ? "疫苗信息完整" : "健康信息待确认"} tone="verified" />
              <TrustBadge label={pet.social_level === "outgoing" ? "社交友好" : "慢热稳定"} tone="trust" />
            </div>
          </div>
          <div className="mt-6 flex min-h-80 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,#ffd3b7,#b7d7d0)] text-8xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
            {pet.species === "猫咪" ? "🐱" : "🐶"}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs text-white/44">活跃程度</p>
              <p className="mt-2 text-lg font-semibold">{pet.energy_level === "high" ? "高" : pet.energy_level === "medium" ? "中" : "低"}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs text-white/44">社交友好度</p>
              <p className="mt-2 text-lg font-semibold">
                {pet.social_level === "outgoing" ? "高" : pet.social_level === "warm" ? "中" : "低"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{pet.name}</h2>
                <p className="mt-2 text-sm text-black/54">
                  {pet.species} · {pet.breed} · {pet.age_text} · {pet.sex === "female" ? "女生" : pet.sex === "male" ? "男生" : "未标注性别"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {pet.personality_tags?.map((item) => (
                  <span key={item} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/58">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-black/66">{pet.bio}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.35rem] bg-[#fff7ef] p-4">
                <div className="flex items-center gap-2 text-[#b14e31]">
                  <HeartHandshake className="size-4" />
                  <p className="text-sm font-semibold">想找怎样的关系</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/62">{pet.looking_for}</p>
              </div>
              <div className="rounded-[1.35rem] bg-[#eef6f0] p-4">
                <div className="flex items-center gap-2 text-[#4b7b5b]">
                  <Syringe className="size-4" />
                  <p className="text-sm font-semibold">健康摘要</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/62">{pet.health_summary}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={openChat}>
                <input name="pet_id" type="hidden" value={pet.id} />
                <SubmitButton>发起聊天</SubmitButton>
              </form>
              <ButtonLink href="/app/match?tab=services" variant="secondary">
                继续看服务匹配
              </ButtonLink>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <ReviewHighlight summary={reviewSummary} />
            <Panel>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-[#b14e31]" />
                <div>
                  <h2 className="text-lg font-semibold">互动偏好</h2>
                  <p className="mt-1 text-sm text-black/56">用更像社交画像的方式帮助用户判断适配度。</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {pet.interests.map((interest) => (
                  <span key={interest} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/58">
                    {interest}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.86fr_1fr]">
        <Panel>
          <div className="flex items-center gap-3">
            <CalendarClock className="size-5 text-[#b14e31]" />
            <div>
              <h2 className="text-2xl font-semibold">如果进入服务关系，流程会如何继续</h2>
              <p className="mt-1 text-sm text-black/56">在档案页提前解释下一步，有助于降低联系和预约的心理负担。</p>
            </div>
          </div>
          <div className="mt-5">
            <BookingTimeline items={bookings.slice(0, 1)} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#4b7b5b]" />
            <div>
              <h2 className="text-2xl font-semibold">档案页里的信任信息</h2>
              <p className="mt-1 text-sm text-black/56">信任信号应该直接嵌在资料中，而不是另开帮助页。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              宠物信息：{pet.vaccinated ? "已完成基础疫苗，可继续沟通线下见面细节。" : "健康信息仍需进一步确认。"}
            </div>
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              社交方式：{pet.social_level === "outgoing" ? "适合直接进入线下互动" : "建议先从聊天或视频初聊开始"}。
            </div>
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              决策建议：先查看资料，再发起聊天，再确认时间与地点，最后进入预约。
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
