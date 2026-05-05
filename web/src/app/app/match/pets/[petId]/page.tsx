import { CalendarClock, HeartHandshake, ShieldCheck, Sparkles, Syringe } from "lucide-react";
import { notFound } from "next/navigation";

import { openChat } from "@/app/actions";
import { BookingTimeline, ReviewHighlight, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getBookingTimeline, getPet, getReviewSummary } from "@/lib/data";
import { getRequestLocale } from "@/lib/i18n-server";
import { accentSoftClasses } from "@/lib/theme";

function petDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        back: "Back to community",
        eyebrow: "Pet Profile",
        description: "A pet profile that helps people decide whether to chat, interact, or book next.",
        vaccineComplete: "Vaccine info complete",
        healthPending: "Health info pending",
        socialFriendly: "Social friendly",
        calmStable: "Calm and steady",
        energy: "Energy level",
        socialLevel: "Social friendliness",
        high: "High",
        medium: "Medium",
        low: "Low",
        female: "Female",
        male: "Male",
        unknownSex: "Sex not set",
        lookingFor: "Looking for",
        healthSummary: "Health summary",
        startChat: "Start chat",
        viewServices: "View service matches",
        interactionPreference: "Interaction preferences",
        interactionDetail: "Use personality and interests to judge fit before reaching out.",
        serviceFlowTitle: "What happens if this becomes a service relationship",
        serviceFlowDetail: "Showing next steps here lowers the friction before chat and booking.",
        trustTitle: "Trust signals in this profile",
        trustDetail: "Key trust cues should live inside the profile, not in a separate help page.",
        petInfo: "Pet info",
        socialStyle: "Social style",
        decisionTip: "Decision tip",
        vaccineTextComplete: "Basic vaccine info is complete. You can continue confirming offline meetup details.",
        vaccineTextPending: "Health information still needs confirmation.",
        socialTextOutgoing: "Suitable for moving into offline interaction.",
        socialTextCareful: "Start with chat or a short video call first.",
        decisionText: "Check the profile, start a chat, confirm time and place, then book.",
      }
    : {
        back: "返回社区广场",
        eyebrow: "宠物档案",
        description: "这是一张帮助用户判断是否适合继续互动、聊天和预约的宠物档案。",
        vaccineComplete: "疫苗信息完整",
        healthPending: "健康信息待确认",
        socialFriendly: "社交友好",
        calmStable: "慢热稳定",
        energy: "活跃程度",
        socialLevel: "社交友好度",
        high: "高",
        medium: "中",
        low: "低",
        female: "女生",
        male: "男生",
        unknownSex: "未标注性别",
        lookingFor: "想找怎样的关系",
        healthSummary: "健康摘要",
        startChat: "发起聊天",
        viewServices: "继续看服务匹配",
        interactionPreference: "互动偏好",
        interactionDetail: "用性格和兴趣帮助用户判断适配度。",
        serviceFlowTitle: "如果进入服务关系，流程会如何继续",
        serviceFlowDetail: "在档案页提前解释下一步，有助于降低联系和预约的心理负担。",
        trustTitle: "档案页里的信任信息",
        trustDetail: "信任信号应该直接嵌在资料中，而不是另开帮助页。",
        petInfo: "宠物信息",
        socialStyle: "社交方式",
        decisionTip: "决策建议",
        vaccineTextComplete: "已完成基础疫苗，可继续沟通线下见面细节。",
        vaccineTextPending: "健康信息仍需进一步确认。",
        socialTextOutgoing: "适合直接进入线下互动。",
        socialTextCareful: "建议先从聊天或视频初聊开始。",
        decisionText: "先查看资料，再发起聊天，再确认时间与地点，最后进入预约。",
      };
}

function levelLabel(value: string | undefined, copy: ReturnType<typeof petDetailCopy>) {
  return value === "high" || value === "outgoing" ? copy.high : value === "medium" || value === "warm" ? copy.medium : copy.low;
}

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const locale = await getRequestLocale();
  const copy = petDetailCopy(locale);
  const pet = await getPet(petId);
  const reviewSummary = await getReviewSummary();
  const bookings = await getBookingTimeline("demo");

  if (!pet) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/match?tab=community" variant="secondary">{copy.back}</ButtonLink>}
        eyebrow={copy.eyebrow}
        title={`${pet.name} · ${pet.breed}`}
        description={copy.description}
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="overflow-hidden rounded-[2.2rem] border border-black/8 bg-[#1f1916] p-6 text-white shadow-[0_28px_80px_rgba(32,25,22,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={accentSoftClasses[pet.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
              {pet.city}
            </span>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={pet.vaccinated ? copy.vaccineComplete : copy.healthPending} tone="verified" />
              <TrustBadge label={pet.social_level === "outgoing" ? copy.socialFriendly : copy.calmStable} tone="trust" />
            </div>
          </div>
          <div className="mt-6 flex min-h-80 items-center justify-center rounded-[1.8rem] bg-[linear-gradient(135deg,#ffd3b7,#b7d7d0)] text-8xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
            {pet.species.toLowerCase().includes("cat") || pet.species.includes("猫") ? "🐱" : "🐶"}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs text-white/44">{copy.energy}</p>
              <p className="mt-2 text-lg font-semibold">{levelLabel(pet.energy_level, copy)}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs text-white/44">{copy.socialLevel}</p>
              <p className="mt-2 text-lg font-semibold">{levelLabel(pet.social_level, copy)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{pet.name}</h2>
                <p className="mt-2 text-sm text-black/54">
                  {pet.species} · {pet.breed} · {pet.age_text} · {pet.sex === "female" ? copy.female : pet.sex === "male" ? copy.male : copy.unknownSex}
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
                  <p className="text-sm font-semibold">{copy.lookingFor}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/62">{pet.looking_for}</p>
              </div>
              <div className="rounded-[1.35rem] bg-[#eef6f0] p-4">
                <div className="flex items-center gap-2 text-[#4b7b5b]">
                  <Syringe className="size-4" />
                  <p className="text-sm font-semibold">{copy.healthSummary}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/62">{pet.health_summary}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={openChat}>
                <input name="pet_id" type="hidden" value={pet.id} />
                <SubmitButton>{copy.startChat}</SubmitButton>
              </form>
              <ButtonLink href="/app/match?tab=services" variant="secondary">
                {copy.viewServices}
              </ButtonLink>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <ReviewHighlight locale={locale} summary={reviewSummary} />
            <Panel>
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-[#b14e31]" />
                <div>
                  <h2 className="text-lg font-semibold">{copy.interactionPreference}</h2>
                  <p className="mt-1 text-sm text-black/56">{copy.interactionDetail}</p>
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
              <h2 className="text-2xl font-semibold">{copy.serviceFlowTitle}</h2>
              <p className="mt-1 text-sm text-black/56">{copy.serviceFlowDetail}</p>
            </div>
          </div>
          <div className="mt-5">
            <BookingTimeline items={bookings.slice(0, 1)} locale={locale} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#4b7b5b]" />
            <div>
              <h2 className="text-2xl font-semibold">{copy.trustTitle}</h2>
              <p className="mt-1 text-sm text-black/56">{copy.trustDetail}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              {copy.petInfo}: {pet.vaccinated ? copy.vaccineTextComplete : copy.vaccineTextPending}
            </div>
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              {copy.socialStyle}: {pet.social_level === "outgoing" ? copy.socialTextOutgoing : copy.socialTextCareful}
            </div>
            <div className="rounded-[1.35rem] border border-black/8 bg-white p-4 text-sm leading-6 text-black/62">
              {copy.decisionTip}: {copy.decisionText}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
