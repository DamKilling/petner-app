import { MessageCircleMore, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { addComment, openChat, toggleLike } from "@/app/actions";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { TrustBadge } from "@/components/product-ui";
import { ButtonLink, PageHeader, Panel, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getPet, getPost } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await getCurrentUser();
  const data = await getPost(postId, user?.id ?? "demo");

  if (!data) {
    notFound();
  }

  const relatedPet = data.post.related_pet_id ? await getPet(data.post.related_pet_id) : null;

  return (
    <div className="grid gap-8">
      <RealtimeRefresh filter={`post_id=eq.${postId}`} table="post_comments" />
      <PageHeader
        action={<ButtonLink href="/app/match?tab=community" variant="secondary">返回社区广场</ButtonLink>}
        eyebrow="Post Detail"
        title={`${data.post.pet_name} · ${data.post.topic}`}
        description="在详情页继续阅读、评论和转化到聊天，不要让社区互动断在列表卡片上。"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <div className="grid gap-6">
          <Panel className="overflow-hidden bg-[#1f1916] text-white">
            <div className="flex flex-wrap items-center gap-2">
              <TrustBadge label="宠物档案可查看" tone="verified" />
              <TrustBadge label="支持继续聊天" tone="trust" />
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
                <SubmitButton>{data.liked ? "取消喜欢" : "喜欢"} · {data.likes}</SubmitButton>
              </form>
              {relatedPet ? (
                <form action={openChat}>
                  <input name="pet_id" type="hidden" value={relatedPet.id} />
                  <SubmitButton variant="secondary">发起聊天</SubmitButton>
                </form>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <MessageCircleMore className="size-5 text-[#b14e31]" />
              <div>
                <h2 className="text-2xl font-semibold">评论区</h2>
                <p className="mt-1 text-sm text-black/56">让社区互动继续发生，也让高意图关系自然转入聊天。</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {data.comments.length ? (
                data.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[1.35rem] border border-black/8 bg-white p-5">
                    <p className="text-sm leading-7 text-black/70">{comment.body}</p>
                    <p className="mt-3 text-xs text-black/42">{formatDate(comment.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/50">还没有评论，成为第一个回应的人。</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:sticky xl:top-8 xl:self-start">
          <Panel>
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#4b7b5b]" />
              <div>
                <h2 className="text-xl font-semibold">继续互动</h2>
                <p className="mt-1 text-sm text-black/56">高意图关系应能直接从详情页走向档案与聊天。</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedPet ? (
                <ButtonLink href={`/app/match/pets/${relatedPet.id}`} variant="secondary">
                  查看宠物档案
                </ButtonLink>
              ) : null}
              <ButtonLink href="/app/match?tab=services" variant="secondary">
                看服务匹配
              </ButtonLink>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-2xl font-semibold">发表评论</h2>
            <form action={addComment} className="mt-6 grid gap-4">
              <input name="post_id" type="hidden" value={data.post.id} />
              <TextArea label="评论内容" name="body" required />
              <SubmitButton>发布评论</SubmitButton>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
