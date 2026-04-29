import { notFound } from "next/navigation";

import { submitServiceReview, updateBookingStatus } from "@/app/actions";
import { ButtonLink, Field, PageHeader, Panel, SubmitButton, TextArea } from "@/components/ui";
import { BookingTimeline, TrustBadge } from "@/components/product-ui";
import { getBookingDetail, getCurrentUser } from "@/lib/data";

const nextStatuses = [
  { value: "pending", label: "提交待确认" },
  { value: "confirmed", label: "确认预约" },
  { value: "completed", label: "标记完成" },
  { value: "cancelled", label: "取消预约" },
];

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const [booking, user] = await Promise.all([getBookingDetail(bookingId), getCurrentUser()]);

  if (!booking) {
    notFound();
  }

  const revieweeID = user?.id === booking.requester_id ? booking.provider_id : booking.requester_id;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Booking"
        title={booking.service_type}
        description="预约页负责把时间、地点、费用、安全提示和状态推进集中在一起。"
        action={<ButtonLink href="/app/match?tab=services" variant="secondary">返回服务广场</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="grid gap-6">
          <BookingTimeline items={[booking]} />
          <Panel>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={`当前状态：${booking.status}`} tone="trust" />
              <TrustBadge label={booking.source_kind === "request" ? "来自需求" : "来自服务"} tone="neutral" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-black/42">时间</p>
                <p className="mt-1 font-semibold">{booking.scheduled_time}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">地点</p>
                <p className="mt-1 font-semibold">{booking.location_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">费用</p>
                <p className="mt-1 font-semibold">{booking.price_summary}</p>
              </div>
            </div>
            {booking.notes ? <p className="mt-5 text-sm leading-6 text-black/58">{booking.notes}</p> : null}
          </Panel>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">推进状态</p>
            <div className="mt-4 grid gap-2">
              {nextStatuses.map((status) => (
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">服务评价</p>
              <form action={submitServiceReview} className="mt-4 grid gap-3">
                <input name="booking_id" type="hidden" value={booking.id} />
                <input name="reviewee_id" type="hidden" value={revieweeID} />
                <Field label="评分" name="rating" type="number" defaultValue={5} required />
                <Field label="标签" name="tags" defaultValue="沟通清楚 过程稳定" />
                <TextArea label="评价内容" name="body" required />
                <SubmitButton>提交评价</SubmitButton>
              </form>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
