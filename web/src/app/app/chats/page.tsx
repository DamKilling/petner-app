import Link from "next/link";

import { EmptyState, PageHeader, Panel } from "@/components/ui";
import { getChatThreads, getCurrentUser } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ChatsPage() {
  const user = await getCurrentUser();
  const threads = user ? await getChatThreads(user.id) : [];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Chat"
        title="聊天线程"
        description="从宠物档案或动态发起聊天后，会在这里继续沟通。"
      />

      <section className="grid gap-4">
        {threads.length ? (
          threads.map((thread) => (
            <Link href={`/app/chats/${thread.id}`} key={thread.id}>
              <Panel className="hover:-translate-y-0.5 hover:bg-white">
                <h2 className="text-2xl font-semibold">{thread.title}</h2>
                <p className="mt-2 text-sm text-black/55">{thread.subtitle}</p>
                <p className="mt-6 text-xs text-black/38">{formatDate(thread.updated_at)}</p>
              </Panel>
            </Link>
          ))
        ) : (
          <EmptyState title="还没有聊天线程" detail="先去社交广场打开宠物档案，再发起聊天。" />
        )}
      </section>
    </div>
  );
}
