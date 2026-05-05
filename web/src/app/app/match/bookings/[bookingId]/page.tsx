import { notFound } from "next/navigation";

import { submitServiceReview, updateBookingStatus } from "@/app/actions";
import { BookingTimeline, TrustBadge } from "@/components/product-ui";
import { ButtonLink, Field, PageHeader, Panel, SubmitButton, TextArea } from "@/components/ui";
import { getBookingDetail, getCurrentUser } from "@/lib/data";
import { getRequestLocale } from "@/lib/i18n-server";
import type { BookingStatus } from "@/lib/types";

function bookingDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        eyebrow: "Booking",
        description: "Confirm time, place, cost, safety notes, and booking status in one place.",
        back: "Back to services",
        currentStatus: "Current status",
        fromRequest: "From request",
        fromOffer: "From service",
        time: "Time",
        place: "Place",
        cost: "Cost",
        advanceStatus: "Update status",
        reviewTitle: "Service review",
        rating: "Rating",
        tags: "Tags",
        tagsDefault: "Clear communication stable process",
        reviewBody: "Review",
        submitReview: "Submit review",
        statuses: [
          { value: "pending", label: "Submit for confirmation" },
          { value: "confirmed", label: "Confirm booking" },
          { value: "completed", label: "Mark completed" },
          { value: "cancelled", label: "Cancel booking" },
        ] satisfies Array<{ value: BookingStatus; label: string }>,
      }
    : {
        eyebrow: "预约",
        description: "在这里确认时间、地点、费用、安全提示和预约状态。",
        back: "返回服务广场",
        currentStatus: "当前状态",
        fromRequest: "来自需求",
        fromOffer: "来自服务",
        time: "时间",
        place: "地点",
        cost: "费用",
        advanceStatus: "推进状态",
        reviewTitle: "服务评价",
        rating: "评分",
        tags: "标签",
        tagsDefault: "沟通清楚 过程稳定",
        reviewBody: "评价内容",
        submitReview: "提交评价",
        statuses: [
          { value: "pending", label: "提交待确认" },
          { value: "confirmed", label: "确认预约" },
          { value: "completed", label: "标记完成" },
          { value: "cancelled", label: "取消预约" },
        ] satisfies Array<{ value: BookingStatus; label: string }>,
      };
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const locale = await getRequestLocale();
  const copy = bookingDetailCopy(locale);
  const [booking, user] = await Promise.all([getBookingDetail(bookingId), getCurrentUser()]);

  if (!booking) {
    notFound();
  }

  const revieweeID = user?.id === booking.requester_id ? booking.provider_id : booking.requester_id;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={booking.service_type}
        description={copy.description}
        action={<ButtonLink href="/app/match?tab=services" variant="secondary">{copy.back}</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="grid gap-6">
          <BookingTimeline items={[booking]} locale={locale} />
          <Panel>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={`${copy.currentStatus}: ${booking.status}`} tone="trust" />
              <TrustBadge label={booking.source_kind === "request" ? copy.fromRequest : copy.fromOffer} tone="neutral" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-black/42">{copy.time}</p>
                <p className="mt-1 font-semibold">{booking.scheduled_time}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.place}</p>
                <p className="mt-1 font-semibold">{booking.location_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.cost}</p>
                <p className="mt-1 font-semibold">{booking.price_summary}</p>
              </div>
            </div>
            {booking.notes ? <p className="mt-5 text-sm leading-6 text-black/58">{booking.notes}</p> : null}
          </Panel>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.advanceStatus}</p>
            <div className="mt-4 grid gap-2">
              {copy.statuses.map((status) => (
                <form action={updateBookingStatus} key={status.value}>
                  <input name="booking_id" type="hidden" value={booking.id} />
                  <input name="status" type="hidden" value={status.value} />
                  <SubmitButton variant={status.value === "cancelled" ? "danger" : "secondary"} className="w-full">
                    {status.label}
                  </SubmitButton>
                </form>
              ))}
            </div>
          </Panel>

          {booking.status === "completed" && revieweeID ? (
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.reviewTitle}</p>
              <form action={submitServiceReview} className="mt-4 grid gap-3">
                <input name="booking_id" type="hidden" value={booking.id} />
                <input name="reviewee_id" type="hidden" value={revieweeID} />
                <Field label={copy.rating} name="rating" type="number" defaultValue={5} required />
                <Field label={copy.tags} name="tags" defaultValue={copy.tagsDefault} />
                <TextArea label={copy.reviewBody} name="body" required />
                <SubmitButton>{copy.submitReview}</SubmitButton>
              </form>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
