import { notFound } from "next/navigation";

import { createBookingDraft, deleteServiceRequest, openServiceChat } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { PetCard, TrustBadge } from "@/components/product-ui";
import { getCurrentUser, getServiceRequestDetail } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const locale = await getRequestLocale();
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
        eyebrow="Request Detail"
        title={request.title}
        description={request.detail}
        action={<ButtonLink href="/app/match?tab=services&surface=requests" variant="secondary">返回需求广场</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.4fr]">
        <div className="grid gap-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              <TrustBadge label={request.request_type} tone="trust" />
              <TrustBadge label={request.status === "open" ? "开放中" : "已处理"} tone="neutral" />
              {request.related_pet_id ? <TrustBadge label="绑定宠物档案" tone="verified" /> : <TrustBadge label="无宠物需求" tone="warm" />}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-black/42">城市</p>
                <p className="mt-1 font-semibold">{request.city}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">期望时间</p>
                <p className="mt-1 font-semibold">{request.preferred_time_summary}</p>
              </div>
              <div>
                <p className="text-xs text-black/42">预算方式</p>
                <p className="mt-1 font-semibold">{request.budget_summary}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={openServiceChat}>
                <input name="source_kind" type="hidden" value="request" />
                <input name="source_id" type="hidden" value={request.id} />
                <SubmitButton>联系对方</SubmitButton>
              </form>
              <form action={createBookingDraft}>
                <input name="source_kind" type="hidden" value="request" />
                <input name="source_id" type="hidden" value={request.id} />
                <SubmitButton variant="secondary">发起预约草稿</SubmitButton>
              </form>
            </div>
          </Panel>

          {request.related_pet ? (
            <PetCard pet={request.related_pet} href={`/app/match/pets/${request.related_pet.id}`} ctaLabel="查看宠物档案" />
          ) : (
            <Panel>
              <h2 className="text-xl font-semibold">这个需求没有绑定宠物档案</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">聊天和预约仍然可以继续推进，建议先确认具体宠物、健康信息和见面边界。</p>
            </Panel>
          )}
        </div>

        <Panel className="xl:sticky xl:top-8 xl:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">发布者</p>
          <h2 className="mt-3 text-2xl font-semibold">{request.requester_name}</h2>
          <p className="mt-2 text-sm text-black/56">{request.requester_profile?.response_time_label ?? "建议先通过聊天确认细节"}</p>
        </Panel>
      </div>
    </div>
  );
}
