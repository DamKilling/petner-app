import Link from "next/link";

import { NotificationItem, SectionTabs, TrustBadge } from "@/components/product-ui";
import { ButtonLink, EmptyState, PageHeader, Panel } from "@/components/ui";
import { getChatThreads, getCurrentUser, getNotifications } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDate } from "@/lib/utils";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).messages;
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab = resolvedSearchParams.tab === "updates" ? "updates" : "conversations";
  const user = await getCurrentUser();
  const [threads, notifications] = await Promise.all([
    user ? getChatThreads(user.id) : Promise.resolve([]),
    getNotifications(user?.id ?? "demo"),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          <SectionTabs
            active={`/app/chats?tab=${activeTab}`}
            tabs={[
              { href: "/app/chats?tab=conversations", label: copy.conversations, meta: `${threads.length}` },
              { href: "/app/chats?tab=updates", label: copy.updates, meta: `${notifications.filter((item) => !item.read).length}` },
            ]}
          />
        }
      />

      {activeTab === "conversations" ? (
        <section className="grid gap-4">
          {threads.length ? (
            threads.map((thread, index) => (
              <Link key={thread.id} href={`/app/chats/${thread.id}`}>
                <Panel className="hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <TrustBadge label={index === 0 ? copy.bookingInProgress : copy.canContinueChat} tone={index === 0 ? "trust" : "neutral"} />
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
          {notifications.length ? (
            notifications.map((item) => <NotificationItem key={item.id} item={item} />)
          ) : (
            <EmptyState title={copy.emptyUpdatesTitle} detail={copy.emptyUpdatesDetail} />
          )}
        </section>
      )}
    </div>
  );
}
