import { CalendarClock, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Star, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { markNotificationRead, openNotification } from "@/app/actions";
import { getDictionary, type Locale } from "@/lib/i18n";
import { accentSoftClasses, trustToneClasses } from "@/lib/theme";
import type { AppNotification, AppNotificationType, Booking, Pet, Profile, ReviewSummary, ServiceOffer, ServiceRequest } from "@/lib/types";
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

function profileCopy(locale: Locale) {
  return locale === "en"
    ? {
        fallbackName: "PetLife user",
        cityFallback: "City not set",
        bioFallback: "Profile not completed yet.",
        verified: "Verified",
        basic: "Profile visible",
        unverified: "Not verified",
        response: "Response",
        rating: "Rating",
        reviews: "reviews",
      }
    : {
        fallbackName: "PetLife 用户",
        cityFallback: "城市未填写",
        bioFallback: "资料还没有完善。",
        verified: "已认证",
        basic: "资料可见",
        unverified: "未认证",
        response: "响应",
        rating: "评分",
        reviews: "条评价",
      };
}

function profileInitial(profile: Profile | null | undefined, fallbackName: string) {
  return (profile?.display_name || fallbackName).trim().slice(0, 1).toUpperCase();
}

export function ProfileSummary({
  profile,
  fallbackName,
  roleLabel,
  locale = "zh",
  compact = false,
  dark = false,
  className,
}: {
  profile?: Profile | null;
  fallbackName?: string;
  roleLabel: string;
  locale?: Locale;
  compact?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const copy = profileCopy(locale);
  const displayName = profile?.display_name || fallbackName || copy.fallbackName;
  const city = profile?.city || copy.cityFallback;
  const verificationLabel =
    profile?.verification_status === "verified"
      ? copy.verified
      : profile?.verification_status === "unverified"
        ? copy.unverified
        : copy.basic;
  const responseTime = profile?.response_time_label;
  const ratingText =
    typeof profile?.rating_avg === "number" && typeof profile?.rating_count === "number"
      ? `${profile.rating_avg.toFixed(1)} · ${profile.rating_count} ${copy.reviews}`
      : null;

  if (compact) {
    return (
      <div className={cn("flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-2", dark ? "border-white/12 bg-white/8 text-white" : "border-black/8 bg-black/[0.025] text-[#2f241e]", className)}>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold", dark ? "bg-white/14 text-white" : "bg-[#fff0e6] text-[#b74c30]")}>
          {profileInitial(profile, displayName)}
        </div>
        <div className="min-w-0">
          <p className={cn("truncate text-xs font-semibold", dark ? "text-white/58" : "text-black/45")}>{roleLabel}</p>
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className={cn("truncate text-xs", dark ? "text-white/54" : "text-black/50")}>
            {city}
            {responseTime ? ` · ${responseTime}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[1.5rem] border p-5", dark ? "border-white/12 bg-white/8 text-white" : "border-black/8 bg-white/82 text-[#2f241e]", className)}>
      <div className="flex items-start gap-4">
        <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold", dark ? "bg-white/14 text-white" : "bg-[#fff0e6] text-[#b74c30]")}>
          {profileInitial(profile, displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.22em]", dark ? "text-white/48" : "text-[#b14e31]")}>{roleLabel}</p>
          <h3 className="mt-2 truncate text-2xl font-semibold">{displayName}</h3>
          <p className={cn("mt-1 text-sm", dark ? "text-white/58" : "text-black/52")}>{city}</p>
        </div>
      </div>
      <p className={cn("mt-4 text-sm leading-6", dark ? "text-white/62" : "text-black/62")}>{profile?.bio || copy.bioFallback}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <TrustBadge label={verificationLabel} tone={profile?.verification_status === "verified" ? "verified" : "neutral"} />
        {responseTime ? <TrustBadge label={`${copy.response}: ${responseTime}`} tone="trust" /> : null}
        {ratingText ? <TrustBadge label={`${copy.rating}: ${ratingText}`} tone="warm" /> : null}
      </div>
    </div>
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
    <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-black/10 bg-white/75 p-1 shadow-[0_12px_32px_rgba(47,35,22,0.06)] backdrop-blur">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white",
            active === tab.href
              ? "bg-[#e96a4b] text-white shadow-[0_10px_22px_rgba(233,106,75,0.22)]"
              : "text-black/58 hover:text-black/78",
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

function petTrustBadges(pet: Pet, locale: Locale) {
  const copy = getDictionary(locale).product;
  const badges: Array<{ label: string; tone: Tone }> = [];

  if (pet.vaccinated || pet.vaccine_status === "complete") {
    badges.push({ label: copy.verifiedVaccine, tone: "verified" });
  }

  if ((pet.social_level ?? "warm") === "outgoing") {
    badges.push({ label: copy.socialFriendly, tone: "trust" });
  } else if ((pet.social_level ?? "warm") === "warm") {
    badges.push({ label: copy.warmButStable, tone: "warm" });
  }

  if (pet.visibility === "public") {
    badges.push({ label: copy.publicContact, tone: "neutral" });
  }

  return badges.slice(0, 3);
}

export function PetCard({
  pet,
  href,
  ctaLabel,
  actionSlot,
  compact = false,
  locale = "zh",
}: {
  pet: Pet;
  href: string;
  ctaLabel?: string;
  actionSlot?: ReactNode;
  compact?: boolean;
  locale?: Locale;
}) {
  const copy = getDictionary(locale).product;
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
            {pet.avatar_url ? null : <span>{pet.species.includes("cat") || pet.species.includes("猫") ? "🐱" : "🐶"}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold tracking-tight">{pet.name}</h3>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", accentSoftClasses[pet.accent])}>
                {pet.breed}
              </span>
            </div>
            <p className="mt-1 text-sm text-black/52">
              {pet.city} · {pet.age_text} · {pet.sex === "female" ? copy.female : pet.sex === "male" ? copy.male : copy.unknownSex}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {petTrustBadges(pet, locale).map((badge) => (
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
              {copy.energy}: {pet.energy_level === "high" ? copy.energyHigh : pet.energy_level === "medium" ? copy.energyMedium : copy.energyLow}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
          <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
            {ctaLabel ?? copy.detail}
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
  locale = "zh",
}: {
  offer: ServiceOffer;
  href?: string;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);

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
            <p className="text-xs text-black/45">{dict.common.priceMode}</p>
            <p className="mt-1 text-sm font-semibold">{offer.price_mode}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {offer.trust_badges.map((item) => (
            <TrustBadge key={item} label={item} tone={item.includes("实名") || item.toLowerCase().includes("verified") ? "verified" : item.includes("复") || item.toLowerCase().includes("repeat") ? "trust" : "warm"} />
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
            <span>
              {offer.rating_count} {dict.product.reviews}
            </span>
            <span>
              {offer.repeat_booking_count} {dict.product.repeatBookings}
            </span>
          </div>
          {href ? (
            <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
              {dict.product.detail}
            </Link>
          ) : (
            <button className="text-sm font-semibold text-[#b74c30]">{dict.common.contact}</button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ServiceRequestCard({
  request,
  href,
  locale = "zh",
}: {
  request: ServiceRequest;
  href: string;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const statusLabel =
    request.status === "open"
      ? dict.product.statusOpen
      : request.status === "matched"
        ? dict.product.statusMatched
        : dict.product.statusClosed;

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
            <p className="text-xs text-black/45">{dict.common.status}</p>
            <p className="mt-1 text-sm font-semibold">{statusLabel}</p>
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
            {request.related_pet_name ?? dict.common.noPetRequest}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
          <p className="text-sm text-black/58">{request.budget_summary}</p>
          <Link href={href} className="text-sm font-semibold text-[#b74c30] hover:text-[#9b3f27]">
            {dict.product.requestDetail}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ReviewHighlight({ summary, locale = "zh" }: { summary: ReviewSummary; locale?: Locale }) {
  const copy = getDictionary(locale).product;

  return (
    <div className="rounded-[1.75rem] border border-black/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(47,35,22,0.05)]">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#fff0d2] p-2 text-[#b97a13]">
          <Star className="size-4 fill-current" />
        </div>
        <div>
          <p className="text-lg font-semibold">{summary.rating_avg.toFixed(1)} / 5</p>
          <p className="text-sm text-black/52">
            {summary.rating_count} {copy.reviews} · {summary.repeat_booking_count} {copy.repeatBookings}
          </p>
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

export function BookingTimeline({ items, locale = "zh" }: { items: Booking[]; locale?: Locale }) {
  const dict = getDictionary(locale);

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
              {dict.product.bookingStatuses[item.status]}
            </span>
          </div>
          <p className="mt-3 text-sm text-black/62">{item.price_summary}</p>
          <p className="mt-2 text-xs text-black/45">{item.safety_notice}</p>
          <Link href={`/app/match/bookings/${item.id}`} className="mt-3 inline-flex text-sm font-semibold text-[#b74c30]">
            {dict.product.bookingDetail}
          </Link>
        </div>
      ))}
    </div>
  );
}

export function NotificationItem({
  item,
  locale = "zh",
  interactive = false,
}: {
  item: AppNotification;
  locale?: Locale;
  interactive?: boolean;
}) {
  const copy = getDictionary(locale).messages;
  const typeLabels: Record<AppNotificationType, string> = {
    chat: copy.notificationTypes.chat,
    booking: copy.notificationTypes.booking,
    service: copy.notificationTypes.service,
    community: copy.notificationTypes.community,
  };
  const iconTone =
    item.type === "booking"
      ? "bg-sky-100 text-sky-700"
      : item.type === "chat"
        ? "bg-orange-100 text-orange-700"
        : item.type === "service"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-black/[0.05] text-black/58";
  const icon =
    item.type === "booking" ? (
      <CalendarClock className="size-4" />
    ) : item.type === "chat" ? (
      <MessageCircle className="size-4" />
    ) : item.type === "service" ? (
      <CheckCircle2 className="size-4" />
    ) : (
      <Clock3 className="size-4" />
    );

  const content = (
    <>
      <div className={cn("mt-0.5 rounded-full p-2", iconTone)}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold text-black/54">
            {typeLabels[item.type]}
          </span>
          {!item.read ? <span className="rounded-full bg-[#f06f4f]/12 px-2.5 py-1 text-[11px] font-semibold text-[#b74c30]">{copy.unread}</span> : null}
          {item.read ? <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold text-black/42">{copy.read}</span> : null}
        </div>
        <p className="mt-2 text-sm font-semibold text-black/82">{item.title}</p>
        <p className="mt-1 text-sm leading-6 text-black/58">{item.body}</p>
        {interactive ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={openNotification}>
              <input name="notification_id" type="hidden" value={item.id} />
              <button className="rounded-full bg-[#f06f4f] px-4 py-2 text-xs font-semibold text-white" type="submit">
                {copy.viewAndMarkRead}
              </button>
            </form>
            {!item.read ? (
              <form action={markNotificationRead}>
                <input name="notification_id" type="hidden" value={item.id} />
                <button className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black/62" type="submit">
                  {copy.markRead}
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (interactive) {
    return (
      <article
        className={cn(
          "flex items-start gap-3 rounded-[1.4rem] border p-4",
          item.read ? "border-black/8 bg-white/76" : "border-[#f06f4f]/18 bg-[#fff4ee]",
        )}
      >
        {content}
      </article>
    );
  }

  return (
    <Link
      href={item.action_url}
      className={cn(
        "flex items-start gap-3 rounded-[1.4rem] border p-4",
        item.read ? "border-black/8 bg-white/76" : "border-[#f06f4f]/18 bg-[#fff4ee]",
      )}
    >
      {content}
    </Link>
  );
}
