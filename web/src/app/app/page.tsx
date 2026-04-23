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

export default async function AppHomePage() {
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
        eyebrow="Overview"
        title={`欢迎回来，${profile.display_name}`}
        description="这里不再只是功能入口，而是你今天继续使用 PetLife 的工作面：看看社区有什么新内容、哪些预约待确认、以及哪些宠物值得继续认识。"
        action={<ButtonLink href="/app/match?tab=community">进入社区</ButtonLink>}
      />

      <MetricStrip
        items={[
          { label: "我的宠物资产", value: data.petCount, hint: "宠物档案与成长记录" },
          { label: "待处理预约", value: data.pendingBookingCount, hint: "需要继续确认的服务关系" },
          { label: "新消息 / 提醒", value: data.unreadNotificationCount, hint: "聊天与预约状态更新" },
        ]}
      />

      <Panel className="overflow-hidden border-[#f06f4f]/16 bg-[linear-gradient(135deg,#fff7ef_0%,#f1f7ee_100%)]">
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-[#1f1916] text-[#f6c07b]">
            <TreePine className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">Interactive Tree</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">你的沉浸式互动圣诞树还在这里</h2>
            <p className="mt-2 text-sm leading-6 text-black/58">
              进入成长树可以继续新增记忆；进入互动圣诞树可以查看照片挂饰、播放音乐和使用按钮/手势互动。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <ButtonLink href="/app/tree/interactive">进入互动圣诞树</ButtonLink>
            <ButtonLink href="/app/tree" variant="secondary">管理成长记录</ButtonLink>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="overflow-hidden bg-[#1f1916] text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">Today</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">把社区活跃度、服务推进和宠物资产放在同一屏，下一步就更清楚。</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { icon: UsersRound, title: "社区里有新互动", detail: "先看看哪些内容值得继续联系。" },
              { icon: CalendarClock, title: "预约正在推进", detail: "从消息页继续确认时间地点。" },
              { icon: PawPrint, title: "宠物档案要更完整", detail: "补全性格、健康与成长信息。" },
            ].map((item) => {
              const Icon = item.icon;
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
        <ReviewHighlight summary={reviewSummary} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">推荐继续浏览</p>
              <h2 className="mt-2 text-2xl font-semibold">今天可以继续认识的宠物与服务</h2>
            </div>
            <ButtonLink href="/app/match?tab=services" variant="secondary">
              查看全部
            </ButtonLink>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {discoverPets.slice(0, 2).map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                href={`/app/match/pets/${pet.id}`}
                ctaLabel="查看宠物档案"
                actionSlot={<span className="text-xs text-black/42">适合继续聊天</span>}
              />
            ))}
          </div>
          <div className="grid gap-4">
            {offers.slice(0, 1).map((offer) => (
              <ServiceCard key={offer.id} offer={offer} href="/app/match?tab=services" />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">预约进度</p>
                <h2 className="mt-2 text-2xl font-semibold">下一步该确认什么</h2>
              </div>
              <Sparkles className="size-5 text-[#b14e31]" />
            </div>
            <div className="mt-5">
              <BookingTimeline items={bookings} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">提醒中心</p>
                <h2 className="mt-2 text-2xl font-semibold">最近更新</h2>
              </div>
              <ButtonLink href="/app/chats" variant="ghost" className="px-0">
                去消息页
                <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
