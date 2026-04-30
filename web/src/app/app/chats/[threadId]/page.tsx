import { CalendarClock, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { sendMessage } from "@/app/actions";
import { BookingTimeline, TrustBadge } from "@/components/product-ui";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getBookingDetail, getBookingTimeline, getChatThread, getCurrentUser } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { cn, formatDate } from "@/lib/utils";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const copy = dict.messages;
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
        action={<ButtonLink href="/app/chats?tab=conversations" variant="secondary">{copy.backToMessages}</ButtonLink>}
        eyebrow={copy.conversationEyebrow}
        title={data.thread.title}
        description={data.thread.subtitle}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.36fr]">
        <div className="grid gap-4">
          <Panel className="overflow-hidden bg-[#1f1916] text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge label={copy.continueBooking} tone="trust" />
                  <TrustBadge label={copy.petProfileAvailable} tone="verified" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{data.thread.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{data.thread.subtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/app/match?tab=services" variant="secondary">
                  {copy.viewServiceCard}
                </ButtonLink>
                <ButtonLink href="/app/profile?tab=account" variant="ghost" className="text-white hover:text-white/76">
                  {copy.viewMyProfile}
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
              <p className="py-16 text-center text-sm text-black/45">{copy.noMessages}</p>
            )}
          </section>

          <form action={sendMessage} className="flex gap-3 rounded-[1.8rem] border border-black/10 bg-white/85 p-3">
            <input name="thread_id" type="hidden" value={threadId} />
            <input
              className="min-w-0 flex-1 rounded-full border border-black/10 px-5 text-base"
              name="text"
              placeholder={copy.inputPlaceholder}
              required
            />
            <SubmitButton>{copy.send}</SubmitButton>
          </form>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#fff0d2] p-2 text-[#b97a13]">
                <Star className="size-4 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{copy.trustTitle}</h2>
                <p className="mt-1 text-sm text-black/56">{copy.trustDetail}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <TrustBadge label={copy.identityVisible} tone="verified" />
              <TrustBadge label={copy.bookingTraceable} tone="trust" />
              <TrustBadge label={copy.safetyCheckSuggested} tone="warm" />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <CalendarClock className="size-5 text-[#b14e31]" />
              <div>
                <h2 className="text-lg font-semibold">{copy.recentBooking}</h2>
                <p className="mt-1 text-sm text-black/56">{copy.bookingDetail}</p>
              </div>
            </div>
            <div className="mt-5">
              <BookingTimeline items={bookings.slice(0, 1)} locale={locale} />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#4b7b5b]" />
              <div>
                <h2 className="text-lg font-semibold">{copy.safetyTitle}</h2>
                <p className="mt-1 text-sm text-black/56">{copy.safetyDetail}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
