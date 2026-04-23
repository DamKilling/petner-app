import { notFound } from "next/navigation";

import { sendMessage } from "@/app/actions";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ButtonLink, PageHeader, SubmitButton } from "@/components/ui";
import { getChatThread, getCurrentUser } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const user = await getCurrentUser();
  const data = await getChatThread(threadId);

  if (!data) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <RealtimeRefresh filter={`thread_id=eq.${threadId}`} table="chat_messages" />
      <PageHeader
        action={<ButtonLink href="/app/chats" variant="secondary">返回聊天列表</ButtonLink>}
        eyebrow="Conversation"
        title={data.thread.title}
        description={data.thread.subtitle}
      />

      <section className="grid gap-3 rounded-[2rem] border border-black/10 bg-white/70 p-4 md:p-6">
        {data.messages.length ? (
          data.messages.map((message) => {
            const mine = message.sender_id === user?.id;
            return (
              <div className={cn("flex", mine ? "justify-end" : "justify-start")} key={message.id}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-[1.4rem] px-4 py-3 text-sm leading-6",
                    mine ? "bg-[#f06f4f] text-white" : "bg-[#fff4ec] text-black/72",
                  )}
                >
                  {message.text}
                  <p className={cn("mt-2 text-[11px]", mine ? "text-white/60" : "text-black/38")}>
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-16 text-center text-sm text-black/45">还没有消息，发送第一句问候。</p>
        )}
      </section>

      <form action={sendMessage} className="flex gap-3 rounded-[2rem] border border-black/10 bg-white/85 p-3">
        <input name="thread_id" type="hidden" value={threadId} />
        <input
          className="min-w-0 flex-1 rounded-full border border-black/10 px-5 text-base"
          name="text"
          placeholder="输入消息"
          required
        />
        <SubmitButton>发送</SubmitButton>
      </form>
    </div>
  );
}
