import Link from "next/link";

import { NotificationItem, SectionTabs, TrustBadge } from "@/components/product-ui";
import { ButtonLink, EmptyState, PageHeader, Panel } from "@/components/ui";
import { getChatThreads, getCurrentUser, getNotifications } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
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
        eyebrow="Messages"
        title="聊天承接关系，提醒承接下一步动作。"
        description="消息页不只是会话列表，它还需要把预约状态、系统提醒和信任信息一起带上，帮助用户继续推进关系。"
        action={
          <SectionTabs
            active={`/app/chats?tab=${activeTab}`}
            tabs={[
              { href: "/app/chats?tab=conversations", label: "会话", meta: `${threads.length}` },
              { href: "/app/chats?tab=updates", label: "提醒", meta: `${notifications.filter((item) => !item.read).length}` },
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
                        <TrustBadge label={index === 0 ? "预约进行中" : "可继续沟通"} tone={index === 0 ? "trust" : "neutral"} />
                        <TrustBadge label="宠物档案可查看" tone="verified" />
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
              title="还没有聊天会话"
              detail="从社区内容流、宠物档案或服务卡发起联系后，会在这里继续承接。"
              action={<ButtonLink href="/app/match?tab=community" variant="secondary">去看看社区</ButtonLink>}
            />
          )}
        </section>
      ) : (
        <section className="grid gap-4">
          {notifications.length ? (
            notifications.map((item) => <NotificationItem key={item.id} item={item} />)
          ) : (
            <EmptyState
              title="暂时没有新提醒"
              detail="当聊天、预约状态或社区互动有更新时，会在这里集中呈现。"
            />
          )}
        </section>
      )}
    </div>
  );
}
