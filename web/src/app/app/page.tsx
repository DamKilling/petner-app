import { ArrowRight, CalendarClock, PawPrint, Sparkles, TreePine, UsersRound } from "lucide-react";

import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { BookingTimeline, MetricStrip, NotificationItem, PetCard, ReviewHighlight, ServiceCard } from "@/components/product-ui";
import { demoProfile } from "@/lib/demo-data";
import {
  getBookingTimeline,
  getCurrentUser,
  getDashboardData,
  getDiscoverPets,
  getNotifications,
  getReviewSummary,
  getServiceOffers,
} from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function AppHomePage() {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).appHome;
  const user = await getCurrentUser();
  const profile = user?.profile ?? demoProfile;
  const [data, discoverPets, offers, reviewSummary, bookings, notifications] = await Promise.all([
    getDashboardData(user?.id ?? "demo"),
    getDiscoverPets(user?.id ?? "demo"),
    getServiceOffers(user?.id ?? "demo"),
    getReviewSummary(),
    getBookingTimeline(user?.id ?? "demo"),
    getNotifications(user?.id ?? "demo"),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={`${copy.titlePrefix}${profile.display_name}`}
        description={copy.description}
        action={<ButtonLink href="/app/match?tab=community">{copy.action}</ButtonLink>}
      />

      <MetricStrip
        items={[
          { label: copy.metrics[0].label, value: data.petCount, hint: copy.metrics[0].hint },
          { label: copy.metrics[1].label, value: data.pendingBookingCount, hint: copy.metrics[1].hint },
          { label: copy.metrics[2].label, value: data.unreadNotificationCount, hint: copy.metrics[2].hint },
        ]}
      />

      <Panel className="overflow-hidden border-[#f06f4f]/16 bg-[linear-gradient(135deg,#fff7ef_0%,#f1f7ee_100%)]">
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-[#1f1916] text-[#f6c07b]">
            <TreePine className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">Interactive Tree</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{copy.treeTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-black/58">{copy.treeDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <ButtonLink href="/app/tree/interactive">{copy.treeCta}</ButtonLink>
            <ButtonLink href="/app/tree" variant="secondary">
              {copy.treeManage}
            </ButtonLink>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="overflow-hidden bg-[#1f1916] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">{copy.todayKicker}</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">{copy.todayTitle}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {copy.todayCards.map((item, index) => {
              const Icon = [UsersRound, CalendarClock, PawPrint][index] ?? Sparkles;
              return (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                  <Icon className="size-5 text-[#f6c07b]" />
                  <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </Panel>
        <ReviewHighlight locale={locale} summary={reviewSummary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.recommendKicker}</p>
              <h2 className="mt-2 text-2xl font-semibold">{copy.recommendTitle}</h2>
            </div>
            <ButtonLink href="/app/match?tab=services" variant="secondary">
              {getDictionary(locale).common.viewAll}
            </ButtonLink>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {discoverPets.slice(0, 2).map((pet) => (
              <PetCard
                key={pet.id}
                locale={locale}
                pet={pet}
                href={`/app/match/pets/${pet.id}`}
                ctaLabel={copy.petCta}
                actionSlot={<span className="text-xs text-black/42">{copy.continueChat}</span>}
              />
            ))}
          </div>
          <div className="grid gap-4">
            {offers.slice(0, 1).map((offer) => (
              <ServiceCard key={offer.id} locale={locale} offer={offer} href="/app/match?tab=services" />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.bookingKicker}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.bookingTitle}</h2>
              </div>
              <Sparkles className="size-5 text-[#b14e31]" />
            </div>
            <div className="mt-5">
              <BookingTimeline locale={locale} items={bookings} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.notificationKicker}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.notificationTitle}</h2>
              </div>
              <ButtonLink href="/app/chats" variant="ghost" className="px-0">
                {copy.goMessages}
                <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.map((item) => (
                <NotificationItem key={item.id} item={item} locale={locale} />
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
