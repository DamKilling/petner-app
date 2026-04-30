import Link from "next/link";

import { markAllNotificationsRead } from "@/app/actions";
import { NotificationItem, SectionTabs, TrustBadge } from "@/components/product-ui";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ButtonLink, EmptyState, PageHeader, Panel } from "@/components/ui";
import { getChatThreads, getCurrentUser, getNotifications } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import type { AppNotificationType } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const notificationTypes: Array<AppNotificationType | "all"> = ["all", "chat", "booking", "service", "community"];

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; type?: string }>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).messages;
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab = resolvedSearchParams.tab === "updates" ? "updates" : "conversations";
  const activeType = notificationTypes.includes(resolvedSearchParams.type as AppNotificationType)
    ? (resolvedSearchParams.type as AppNotificationType | "all")
    : "all";
  const user = await getCurrentUser();
  const [threads, notifications] = await Promise.all([
    user ? getChatThreads(user.id) : Promise.resolve([]),
    getNotifications(user?.id ?? "demo"),
  ]);
  const filteredNotifications =
    activeType === "all" ? notifications : notifications.filter((item) => item.type === activeType);
  const unreadCount = filteredNotifications.filter((item) => !item.read).length;
  const notificationTypeLabels = {
    all: copy.filterAll,
    ...copy.notificationTypes,
  };

  return (
    <div className="grid gap-8">
      {user ? <RealtimeRefresh filter={`recipient_id=eq.${user.id}`} table="notifications" /> : null}
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <SectionTabs
              active={`/app/chats?tab=${activeTab}`}
              tabs={[
                { href: "/app/chats?tab=conversations", label: copy.conversations, meta: `${threads.length}` },
                { href: "/app/chats?tab=updates", label: copy.updates, meta: `${notifications.filter((item) => !item.read).length}` },
              ]}
            />
            {activeTab === "updates" && unreadCount ? (
              <form action={markAllNotificationsRead}>
                <input name="type" type="hidden" value={activeType} />
                <button className="rounded-full border border-black/10 bg-white/78 px-4 py-2 text-sm font-semibold text-black/62 shadow-[0_10px_28px_rgba(47,35,22,0.05)]" type="submit">
                  {copy.markAllRead}
                </button>
              </form>
            ) : null}
          </div>
        }
      />

      {activeTab === "conversations" ? (
        <section className="grid gap-4">
          {threads.length ? (
            threads.map((thread) => (
              <Link key={thread.id} href={`/app/chats/${thread.id}`}>
                <Panel className="hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <TrustBadge
                          label={
                            thread.service_offer_id
                              ? copy.serviceThread
                              : thread.service_request_id
                                ? copy.requestThread
                                : copy.petThread
                          }
                          tone={thread.service_offer_id || thread.service_request_id ? "trust" : "neutral"}
                        />
                        {thread.booking_id ? <TrustBadge label={copy.bookingInProgress} tone="trust" /> : null}
                        {!thread.booking_id ? <TrustBadge label={copy.canContinueChat} tone="verified" /> : null}
                        <TrustBadge label={copy.petProfileAvailable} tone="verified" />
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold">{thread.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-black/56">{thread.subtitle}</p>
                    </div>
                    <p className="text-xs text-black/38">{formatDate(thread.updated_at)}</p>
                  </div>
                </Panel>
              </Link>
            ))
          ) : (
            <EmptyState
              title={copy.emptyConversationsTitle}
              detail={copy.emptyConversationsDetail}
              action={<ButtonLink href="/app/match?tab=community" variant="secondary">{copy.browseCommunity}</ButtonLink>}
            />
          )}
        </section>
      ) : (
        <section className="grid gap-4">
          <SectionTabs
            active={`/app/chats?tab=updates&type=${activeType}`}
            tabs={notificationTypes.map((type) => ({
              href: `/app/chats?tab=updates&type=${type}`,
              label: notificationTypeLabels[type],
              meta: `${type === "all" ? notifications.length : notifications.filter((item) => item.type === type).length}`,
            }))}
          />
          {filteredNotifications.length ? (
            filteredNotifications.map((item) => (
              <NotificationItem interactive key={item.id} item={item} locale={locale} />
            ))
          ) : (
            <EmptyState title={copy.emptyUpdatesTitle} detail={copy.emptyUpdatesDetail} />
          )}
        </section>
      )}
    </div>
  );
}
