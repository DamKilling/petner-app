import { CalendarClock, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { sendMessage } from "@/app/actions";
import { BookingTimeline, TrustBadge } from "@/components/product-ui";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getBookingDetail, getBookingTimeline, getChatThread, getCurrentUser } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const user = await getCurrentUser();
  const data = await getChatThread(threadId);
  const linkedBooking = data?.thread.booking_id ? await getBookingDetail(data.thread.booking_id) : null;
  const bookings = linkedBooking ? [linkedBooking] : await getBookingTimeline(user?.id ?? "demo");

  if (!data) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <RealtimeRefresh filter={`thread_id=eq.${threadId}`} table="chat_messages" />
      <PageHeader
        action={<ButtonLink href="/app/chats?tab=conversations" variant="secondary">返回消息列表</ButtonLink>}
        eyebrow="Conversation"
        title={data.thread.title}
        description={data.thread.subtitle}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.36fr]">
        <div className="grid gap-4">
          <Panel className="overflow-hidden bg-[#1f1916] text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge label="可继续预约确认" tone="trust" />
                  <TrustBadge label="宠物档案可查看" tone="verified" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{data.thread.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{data.thread.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/app/match?tab=services" variant="secondary">
                  查看服务卡
                </ButtonLink>
                <ButtonLink href="/app/profile?tab=account" variant="ghost" className="text-white hover:text-white/76">
                  查看我的主页
                </ButtonLink>
              </div>
            </div>
          </Panel>

          <section className="grid gap-3 rounded-[2rem] border border-black/10 bg-white/70 p-4 md:p-6">
            {data.messages.length ? (
              data.messages.map((message) => {
                const mine = message.sender_id === user?.id;
                return (
                  <div className={cn("flex", mine ? "justify-end" : "justify-start")} key={message.id}>
                    <div
                      className={cn(
                        "max-w-[82%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-[0_8px_22px_rgba(47,35,22,0.04)]",
                        mine ? "bg-[#f06f4f] text-white" : "border border-black/8 bg-white text-black/72",
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
              <p className="py-16 text-center text-sm text-black/45">还没有消息，先发一句问候，让关系开始流动。</p>
            )}
          </section>

          <form action={sendMessage} className="flex gap-3 rounded-[1.8rem] border border-black/10 bg-white/85 p-3">
            <input name="thread_id" type="hidden" value={threadId} />
            <input
              className="min-w-0 flex-1 rounded-full border border-black/10 px-5 text-base"
              name="text"
              placeholder="输入消息，也可以先确认时间、地点或注意事项"
              required
            />
            <SubmitButton>发送</SubmitButton>
          </form>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#fff0d2] p-2 text-[#b97a13]">
                <Star className="size-4 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">聊天里的信任线索</h2>
                <p className="mt-1 text-sm text-black/56">不要让用户离开消息页，才能知道下一步该做什么。</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <TrustBadge label="身份信息可见" tone="verified" />
              <TrustBadge label="预约状态可追踪" tone="trust" />
              <TrustBadge label="建议核对安全信息" tone="warm" />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-[#b14e31]" />
              <div>
                <h2 className="text-lg font-semibold">最近预约进度</h2>
                <p className="mt-1 text-sm text-black/56">聊天中的关键动作应和预约流程同步。</p>
              </div>
            </div>
            <div className="mt-5">
              <BookingTimeline items={bookings.slice(0, 1)} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#4b7b5b]" />
              <div>
                <h2 className="text-lg font-semibold">安全提醒</h2>
                <p className="mt-1 text-sm text-black/56">确认时间地点前，建议先核对宠物健康信息与应急联系人。</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
