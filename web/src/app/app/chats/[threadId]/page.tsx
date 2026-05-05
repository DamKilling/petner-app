import { CalendarClock, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { sendMessage } from "@/app/actions";
import { BookingTimeline, ProfileSummary, TrustBadge } from "@/components/product-ui";
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
  const data = await getChatThread(threadId, user?.id);
  const linkedBooking = data?.thread.booking_id ? await getBookingDetail(data.thread.booking_id) : null;
  const bookings = linkedBooking ? [linkedBooking] : await getBookingTimeline(user?.id ?? "demo");

  if (!data) {
    notFound();
  }
  const identityLabels = locale === "en" ? { chatWith: "Chatting with" } : { chatWith: "聊天对象" };
  const otherDisplayName = data.other_profile?.display_name ?? data.thread.title;

  return (
    <div className="grid gap-8">
      <RealtimeRefresh filter={`thread_id=eq.${threadId}`} table="chat_messages" />
      <PageHeader
        action={<ButtonLink href="/app/chats?tab=conversations" variant="secondary">{copy.backToMessages}</ButtonLink>}
        eyebrow={copy.conversationEyebrow}
        title={otherDisplayName}
        description={data.thread.subtitle}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.36fr]">
        <div className="grid gap-4">
          <Panel className="overflow-hidden bg-[#1f1916] text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge label={copy.continueBooking} tone="trust" />
                  {data.thread.related_pet_id ? <TrustBadge label={copy.petProfileAvailable} tone="verified" /> : null}
                </div>
                <ProfileSummary
                  compact
                  dark
                  className="mt-4"
                  fallbackName={data.thread.title}
                  locale={locale}
                  profile={data.other_profile}
                  roleLabel={identityLabels.chatWith}
                />
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

          <section className="overflow-hidden rounded-[1.7rem] border border-black/8 bg-[linear-gradient(180deg,#fffaf4_0%,#f7f0e7_100%)] p-3 shadow-[0_16px_48px_rgba(47,35,22,0.06)] md:p-5">
            <div className="grid min-h-[18rem] content-start gap-3 rounded-[1.35rem] bg-white/52 p-3 md:p-4">
              {data.messages.length ? (
                data.messages.map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")} key={message.id}>
                      {!mine ? (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff0e6] text-xs font-semibold text-[#b74c30]">
                          {otherDisplayName.trim().slice(0, 1).toUpperCase()}
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "w-fit max-w-[min(76%,34rem)] px-4 py-2.5 text-sm leading-6 shadow-[0_10px_24px_rgba(47,35,22,0.06)]",
                          mine
                            ? "rounded-[1.25rem] rounded-br-md bg-[#f06f4f] text-white"
                            : "rounded-[1.25rem] rounded-bl-md border border-black/8 bg-white text-black/72",
                        )}
                      >
                        {!mine ? <p className="mb-1 text-xs font-semibold text-black/42">{otherDisplayName}</p> : null}
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                        <p className={cn("mt-1.5 text-[11px]", mine ? "text-white/62" : "text-black/38")}>
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                      {mine ? (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2f241e] text-xs font-semibold text-white">
                          {locale === "en" ? "Me" : "我"}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="py-16 text-center text-sm text-black/45">{copy.noMessages}</p>
              )}
            </div>
          </section>

          <form action={sendMessage} className="sticky bottom-24 z-20 flex items-center gap-2 rounded-[1.45rem] border border-black/8 bg-white/92 p-2.5 shadow-[0_18px_48px_rgba(47,35,22,0.12)] backdrop-blur lg:static lg:shadow-[0_12px_32px_rgba(47,35,22,0.05)]">
            <input name="thread_id" type="hidden" value={threadId} />
            <input
              className="h-12 min-w-0 flex-1 rounded-[1.1rem] border border-black/8 bg-[#fbf7f1] px-4 text-sm text-[#2f241e] outline-none transition placeholder:text-black/35 focus:border-[#f06f4f]/45 focus:bg-white"
              name="text"
              placeholder={copy.inputPlaceholder}
              required
            />
            <SubmitButton className="h-12 shrink-0 rounded-[1.1rem] px-5">{copy.send}</SubmitButton>
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
