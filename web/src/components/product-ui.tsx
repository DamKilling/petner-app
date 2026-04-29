import { CalendarClock, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Star, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { accentSoftClasses, trustToneClasses } from "@/lib/theme";
import type { AppNotification, Booking, Pet, ReviewSummary, ServiceOffer, ServiceRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tone = keyof typeof trustToneClasses;

export function TrustBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        trustToneClasses[tone],
      )}
    >
      <ShieldCheck className="size-3.5" />
      {label}
    </span>
  );
}

export function SectionTabs({
  tabs,
  active,
}: {
  tabs: Array<{ href: string; label: string; meta?: string }>;
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
            active === tab.href
              ? "border-[#f06f4f]/30 bg-[#f06f4f] text-white shadow-[0_10px_24px_rgba(240,111,79,0.18)]"
              : "border-black/10 bg-white/80 text-black/62 hover:bg-white",
          )}
        >
          {tab.label}
          {tab.meta ? <span className={cn("text-xs", active === tab.href ? "text-white/72" : "text-black/40")}>{tab.meta}</span> : null}
        </Link>
      ))}
    </div>
  );
}

export function MetricStrip({
  items,
  className,
}: {
  items: Array<{ label: string; value: string | number; hint?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-[1.75rem] border border-black/10 bg-white/72 p-4 shadow-[0_18px_50px_rgba(47,35,22,0.06)] md:grid-cols-3 md:p-5",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="rounded-[1.25rem] bg-white/85 px-4 py-4">
          <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
          <p className="mt-1 text-sm text-black/60">{item.label}</p>
          {item.hint ? <p className="mt-2 text-xs text-black/42">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

function petPersona(pet: Pet) {
  return pet.personality_tags?.length ? pet.personality_tags : pet.interests.slice(0, 3);
}

function petTrustBadges(pet: Pet) {
  const badges: Array<{ label: string; tone: Tone }> = [];

  if (pet.vaccinated || pet.vaccine_status === "complete") {
    badges.push({ label: "疫苗信息完整", tone: "verified" });
  }

  if ((pet.social_level ?? "warm") === "outgoing") {
    badges.push({ label: "社交友好", tone: "trust" });
  } else if ((pet.social_level ?? "warm") === "warm") {
    badges.push({ label: "慢热但稳定", tone: "warm" });
  }

  if (pet.visibility === "public") {
    badges.push({ label: "公开可联系", tone: "neutral" });
  }

  return badges.slice(0, 3);
}

export function PetCard({
  pet,
  href,
  ctaLabel = "查看档案",
  actionSlot,
  compact = false,
}: {
  pet: Pet;
  href: string;
  ctaLabel?: string;
  actionSlot?: ReactNode;
  compact?: boolean;
}) {
  const persona = petPersona(pet);

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/82 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
      <div className="grid gap-4 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] text-3xl",
              compact ? "size-16" : "size-20",
              accentSoftClasses[pet.accent],
            )}
            style={pet.avatar_url ? { backgroundImage: `url(${pet.avatar_url})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
          >
            {pet.avatar_url ? null : (
              <span>{pet.species === "猫咪" ? "🐱" : "🐶"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">{pet.name}</h3>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", accentSoftClasses[pet.accent])}>
                {pet.breed}
              </span>
            </div>
            <p className="mt-1 text-sm text-black/52">
              {pet.city} · {pet.age_text} · {pet.sex === "female" ? "女生" : pet.sex === "male" ? "男生" : "未标注性别"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {petTrustBadges(pet).map((badge) => (
                <TrustBadge key={badge.label} label={badge.label} tone={badge.tone} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm leading-6 text-black/64">{pet.bio}</p>

        <div className="flex flex-wrap gap-2">
          {persona.map((item) => (
            <span key={item} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/60">
              {item}
            </span>
          ))}
          {pet.energy_level ? (
            <span className="rounded-full bg-[#9bb89a]/14 px-3 py-1 text-xs text-[#4e6950]">
              活跃度 {pet.energy_level === "high" ? "高" : pet.energy_level === "medium" ? "中" : "低"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
          <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
            {ctaLabel}
          </Link>
          {actionSlot}
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({
  offer,
  href,
}: {
  offer: ServiceOffer;
  href?: string;
}) {
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/82 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
      <div className="grid gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              {offer.service_types.map((item) => (
                <span key={item} className="rounded-full bg-[#f06f4f]/12 px-3 py-1 text-xs font-semibold text-[#9b321c]">
                  {item}
                </span>
              ))}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">{offer.provider_name}</h3>
            {offer.title ? <p className="mt-1 text-base font-semibold text-[#2f241e]">{offer.title}</p> : null}
            <p className="mt-2 text-sm text-black/52">{offer.intro}</p>
          </div>
          <div className="rounded-[1.2rem] border border-black/8 bg-[#fff7ef] px-4 py-3 text-right">
            <p className="text-xs text-black/45">方式</p>
            <p className="mt-1 text-sm font-semibold">{offer.price_mode}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {offer.trust_badges.map((item) => (
            <TrustBadge key={item} label={item} tone={item.includes("实名") ? "verified" : item.includes("复购") ? "trust" : "warm"} />
          ))}
        </div>

        <div className="grid gap-3 text-sm text-black/62 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-black/42" />
            {offer.service_area}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-black/42" />
            {offer.response_time_label}
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-black/42" />
            {offer.availability_summary}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
          <div className="flex items-center gap-3 text-sm text-black/58">
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-current text-[#e7a94c]" />
              {offer.rating_avg.toFixed(1)}
            </span>
            <span>{offer.rating_count} 条评价</span>
            <span>{offer.repeat_booking_count} 次复约</span>
          </div>
          {href ? (
            <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
              发起联系
            </Link>
          ) : (
            <button className="text-sm font-semibold text-[#b74c30]">发起联系</button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ServiceRequestCard({
  request,
  href,
}: {
  request: ServiceRequest;
  href: string;
}) {
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/82 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
      <div className="grid gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-[#9bb89a]/16 px-3 py-1 text-xs font-semibold text-[#4e6950]">
              {request.request_type}
            </span>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">{request.title}</h3>
            <p className="mt-2 text-sm leading-6 text-black/58">{request.detail}</p>
          </div>
          <div className="rounded-[1.2rem] border border-black/8 bg-[#f5faf3] px-4 py-3 text-right">
            <p className="text-xs text-black/45">状态</p>
            <p className="mt-1 text-sm font-semibold">{request.status === "open" ? "开放中" : request.status === "matched" ? "已匹配" : "已关闭"}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-black/62 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-black/42" />
            {request.city}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-black/42" />
            {request.preferred_time_summary}
          </div>
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-black/42" />
            {request.related_pet_name ?? "无宠物档案需求"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
          <p className="text-sm text-black/58">{request.budget_summary}</p>
          <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
            查看需求
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ReviewHighlight({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="rounded-[1.75rem] border border-black/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.05)]">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#fff0d2] p-2 text-[#b97a13]">
          <Star className="size-4 fill-current" />
        </div>
        <div>
          <p className="text-lg font-semibold">{summary.rating_avg.toFixed(1)} / 5</p>
          <p className="text-sm text-black/52">{summary.rating_count} 条评价 · {summary.repeat_booking_count} 次复约</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {summary.highlight_tags.map((tag) => (
          <span key={tag} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/62">
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-black/64">“{summary.quote}”</p>
    </div>
  );
}

export function BookingTimeline({ items }: { items: Booking[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[1.5rem] border border-black/10 bg-white/82 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#b74c30]">{item.service_type}</p>
              <h3 className="mt-1 text-lg font-semibold">{item.location_summary}</h3>
              <p className="mt-1 text-sm text-black/54">{item.scheduled_time}</p>
            </div>
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-black/60">
              {item.status === "pending"
                ? "待确认"
                : item.status === "confirmed"
                  ? "已确认"
                  : item.status === "completed"
                    ? "已完成"
                    : item.status === "cancelled"
                      ? "已取消"
                      : "草稿"}
            </span>
          </div>
          <p className="mt-3 text-sm text-black/62">{item.price_summary}</p>
          <p className="mt-2 text-xs text-black/45">{item.safety_notice}</p>
          <Link href={`/app/match/bookings/${item.id}`} className="mt-3 inline-flex text-sm font-semibold text-[#b74c30]">
            查看预约详情
          </Link>
        </div>
      ))}
    </div>
  );
}

export function NotificationItem({ item }: { item: AppNotification }) {
  return (
    <Link
      href={item.action_url}
      className={cn(
        "flex items-start gap-3 rounded-[1.4rem] border p-4",
        item.read ? "border-black/8 bg-white/76" : "border-[#f06f4f]/18 bg-[#fff4ee]",
      )}
    >
      <div
        className={cn(
          "mt-0.5 rounded-full p-2",
          item.type === "booking"
            ? "bg-sky-100 text-sky-700"
            : item.type === "chat"
              ? "bg-orange-100 text-orange-700"
              : item.type === "trust"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-black/[0.05] text-black/58",
        )}
      >
        {item.type === "booking" ? (
          <CalendarClock className="size-4" />
        ) : item.type === "chat" ? (
          <MessageCircle className="size-4" />
        ) : item.type === "trust" ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <Clock3 className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black/82">{item.title}</p>
          {!item.read ? <span className="size-2 rounded-full bg-[#f06f4f]" /> : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-black/58">{item.body}</p>
      </div>
    </Link>
  );
}
