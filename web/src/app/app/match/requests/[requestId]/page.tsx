import { notFound } from "next/navigation";

import { createBookingDraft, deleteServiceRequest, openServiceChat } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PetCard, ProfileSummary, TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getCurrentUser, getServiceRequestDetail } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

function requestDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        eyebrow: "Request Detail",
        back: "Back to request board",
        requester: "Request owner",
        open: "Open",
        handled: "Handled",
        boundPet: "Pet profile linked",
        noPet: "No pet required",
        city: "City",
        time: "Preferred time",
        budget: "Budget",
        contact: "Contact",
        bookingDraft: "Create booking draft",
        viewPet: "View pet profile",
        noPetTitle: "This request is not linked to a pet profile",
        noPetDetail: "Chat and booking can still continue. Confirm pet details, health info, and meetup boundaries first.",
      }
    : {
        eyebrow: "需求详情",
        back: "返回需求广场",
        requester: "需求发布者",
        open: "开放中",
        handled: "已处理",
        boundPet: "绑定宠物档案",
        noPet: "无宠物需求",
        city: "城市",
        time: "期望时间",
        budget: "预算方式",
        contact: "联系对方",
        bookingDraft: "发起预约草稿",
        viewPet: "查看宠物档案",
        noPetTitle: "这个需求没有绑定宠物档案",
        noPetDetail: "聊天和预约仍然可以继续推进，建议先确认具体宠物、健康信息和见面边界。",
      };
}

export default async function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const locale = await getRequestLocale();
  const copy = requestDetailCopy(locale);
  const editorCopy = getDictionary(locale).editor;
  const [request, user] = await Promise.all([getServiceRequestDetail(requestId), getCurrentUser()]);

  if (!request) {
    notFound();
  }
  const canEdit = Boolean(user && request.requester_id === user.id);

  return (
    <div className="grid gap-8">
      {canEdit ? (
        <div className="flex justify-end gap-2">
          <ButtonLink href={`/app/match/requests/${request.id}/edit`}>{editorCopy.edit}</ButtonLink>
          <form action={deleteServiceRequest}>
            <input name="request_id" type="hidden" value={request.id} />
            <ConfirmSubmitButton message={editorCopy.confirmDelete}>
              {editorCopy.deleteServiceRequest}
            </ConfirmSubmitButton>
          </form>
        </div>
      ) : null}
      <PageHeader
        eyebrow={copy.eyebrow}
        title={request.title}
        description={request.detail}
        action={<ButtonLink href="/app/match?tab=services&surface=requests" variant="secondary">{copy.back}</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.4fr]">
        <div className="grid gap-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={request.request_type} tone="trust" />
              <TrustBadge label={request.status === "open" ? copy.open : copy.handled} tone="neutral" />
              {request.related_pet_id ? <TrustBadge label={copy.boundPet} tone="verified" /> : <TrustBadge label={copy.noPet} tone="warm" />}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-black/42">{copy.city}</p>
                <p className="mt-1 font-semibold">{request.city}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.time}</p>
                <p className="mt-1 font-semibold">{request.preferred_time_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">{copy.budget}</p>
                <p className="mt-1 font-semibold">{request.budget_summary}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={openServiceChat}>
                <input name="source_kind" type="hidden" value="request" />
                <input name="source_id" type="hidden" value={request.id} />
                <SubmitButton>{copy.contact}</SubmitButton>
              </form>
              <form action={createBookingDraft}>
                <input name="source_kind" type="hidden" value="request" />
                <input name="source_id" type="hidden" value={request.id} />
                <SubmitButton variant="secondary">{copy.bookingDraft}</SubmitButton>
              </form>
            </div>
          </Panel>

          {request.related_pet ? (
            <PetCard locale={locale} pet={request.related_pet} href={`/app/match/pets/${request.related_pet.id}`} ctaLabel={copy.viewPet} />
          ) : (
            <Panel>
              <h2 className="text-xl font-semibold">{copy.noPetTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">{copy.noPetDetail}</p>
            </Panel>
          )}
        </div>

        <ProfileSummary
          className="xl:sticky xl:top-8 xl:self-start"
          fallbackName={request.requester_name}
          locale={locale}
          profile={request.requester_profile}
          roleLabel={copy.requester}
        />
      </div>
    </div>
  );
}
