import { MessageCircleMore, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { addComment, deletePost, openChat, toggleLike } from "@/app/actions";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ProfileSummary, TrustBadge } from "@/components/product-ui";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ButtonLink, PageHeader, Panel, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getPet, getPost } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDate } from "@/lib/utils";

function postDetailCopy(locale: "zh" | "en") {
  return locale === "en"
    ? {
        back: "Back to community",
        eyebrow: "Post Detail",
        description: "Continue reading, commenting, or moving into chat from this post.",
        author: "Posted by",
        fallbackUser: "PetLife user",
        petVisible: "Pet profile available",
        chatSupported: "Chat supported",
        unlike: "Unlike",
        like: "Like",
        startChat: "Start chat",
        commentsTitle: "Comments",
        commentsDetail: "Keep the conversation going before starting a higher-intent chat.",
        noComments: "No comments yet. Be the first to reply.",
        continueTitle: "Continue interaction",
        continueDetail: "Move from this post into pet profiles, services, or chat.",
        viewPet: "View pet profile",
        viewServices: "View services",
        commentFormTitle: "Add a comment",
        commentBody: "Comment",
        publishComment: "Publish comment",
      }
    : {
        back: "返回社区广场",
        eyebrow: "动态详情",
        description: "在详情页继续阅读、评论，或自然转入聊天。",
        author: "发帖人",
        fallbackUser: "PetLife 用户",
        petVisible: "宠物档案可查看",
        chatSupported: "支持继续聊天",
        unlike: "取消喜欢",
        like: "喜欢",
        startChat: "发起聊天",
        commentsTitle: "评论区",
        commentsDetail: "让社区互动继续发生，也让高意图关系自然转入聊天。",
        noComments: "还没有评论，成为第一个回应的人。",
        continueTitle: "继续互动",
        continueDetail: "高意图关系可以直接从详情页走向档案与聊天。",
        viewPet: "查看宠物档案",
        viewServices: "看服务匹配",
        commentFormTitle: "发表评论",
        commentBody: "评论内容",
        publishComment: "发布评论",
      };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const locale = await getRequestLocale();
  const copy = postDetailCopy(locale);
  const editorCopy = getDictionary(locale).editor;
  const user = await getCurrentUser();
  const data = await getPost(postId, user?.id ?? "demo");

  if (!data) {
    notFound();
  }

  const relatedPet = data.post.related_pet_id ? await getPet(data.post.related_pet_id) : null;
  const canEdit = Boolean(user && data.post.author_id === user.id);

  return (
    <div className="grid gap-8">
      <RealtimeRefresh filter={`post_id=eq.${postId}`} table="post_comments" />
      {canEdit ? (
        <div className="flex justify-end gap-2">
          <ButtonLink href={`/app/match/posts/${data.post.id}/edit`}>{editorCopy.edit}</ButtonLink>
          <form action={deletePost}>
            <input name="post_id" type="hidden" value={data.post.id} />
            <ConfirmSubmitButton message={editorCopy.confirmDelete}>{editorCopy.deletePost}</ConfirmSubmitButton>
          </form>
        </div>
      ) : null}
      <PageHeader
        action={<ButtonLink href="/app/match?tab=community" variant="secondary">{copy.back}</ButtonLink>}
        eyebrow={copy.eyebrow}
        title={`${data.post.pet_name} · ${data.post.topic}`}
        description={copy.description}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <div className="grid gap-6">
          <Panel className="overflow-hidden bg-[#1f1916] text-white">
            <div className="flex flex-wrap items-center gap-2">
              <TrustBadge label={copy.petVisible} tone="verified" />
              <TrustBadge label={copy.chatSupported} tone="trust" />
            </div>
            <p className="mt-5 text-sm text-white/52">
              {data.post.city} · {formatDate(data.post.created_at)}
            </p>
            <p className="mt-4 text-base leading-8 text-white/78">{data.post.content}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {data.post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/72">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={toggleLike}>
                <input name="post_id" type="hidden" value={data.post.id} />
                <SubmitButton>{data.liked ? copy.unlike : copy.like} · {data.likes}</SubmitButton>
              </form>
              {relatedPet ? (
                <form action={openChat}>
                  <input name="pet_id" type="hidden" value={relatedPet.id} />
                  <SubmitButton variant="secondary">{copy.startChat}</SubmitButton>
                </form>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <MessageCircleMore className="size-5 text-[#b14e31]" />
              <div>
                <h2 className="text-2xl font-semibold">{copy.commentsTitle}</h2>
                <p className="mt-1 text-sm text-black/56">{copy.commentsDetail}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {data.comments.length ? (
                data.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[1.35rem] border border-black/8 bg-white p-5">
                    <p className="text-sm font-semibold text-[#2f241e]">
                      {comment.author_profile?.display_name || copy.fallbackUser}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-black/70">{comment.body}</p>
                    <p className="mt-3 text-xs text-black/42">{formatDate(comment.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/50">{copy.noComments}</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:sticky xl:top-8 xl:self-start">
          <ProfileSummary
            fallbackName={copy.fallbackUser}
            locale={locale}
            profile={data.author_profile}
            roleLabel={copy.author}
          />

          <Panel>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#4b7b5b]" />
              <div>
                <h2 className="text-xl font-semibold">{copy.continueTitle}</h2>
                <p className="mt-1 text-sm text-black/56">{copy.continueDetail}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedPet ? (
                <ButtonLink href={`/app/match/pets/${relatedPet.id}`} variant="secondary">
                  {copy.viewPet}
                </ButtonLink>
              ) : null}
              <ButtonLink href="/app/match?tab=services" variant="secondary">
                {copy.viewServices}
              </ButtonLink>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-2xl font-semibold">{copy.commentFormTitle}</h2>
            <form action={addComment} className="mt-6 grid gap-4">
              <input name="post_id" type="hidden" value={data.post.id} />
              <TextArea label={copy.commentBody} name="body" required />
              <SubmitButton>{copy.publishComment}</SubmitButton>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
