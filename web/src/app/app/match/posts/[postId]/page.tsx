import { notFound } from "next/navigation";

import { addComment, openChat, toggleLike } from "@/app/actions";
import { RealtimeRefresh } from "@/components/realtime-refresh";
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
        action={<ButtonLink href="/app/match" variant="secondary">返回社交广场</ButtonLink>}
        eyebrow="Post"
        title={`${data.post.pet_name} · ${data.post.topic}`}
        description={data.post.content}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Panel>
          <p className="text-sm font-semibold text-[#f06f4f]">
            {data.post.city} · {formatDate(data.post.created_at)}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {data.post.tags.map((tag) => (
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={toggleLike}>
              <input name="post_id" type="hidden" value={data.post.id} />
              <SubmitButton>{data.liked ? "取消喜欢" : "喜欢"} · {data.likes}</SubmitButton>
            </form>
            {relatedPet ? (
              <form action={openChat}>
                <input name="pet_id" type="hidden" value={relatedPet.id} />
                <SubmitButton>发起聊天</SubmitButton>
              </form>
            ) : null}
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

      <Panel>
        <h2 className="mb-6 text-2xl font-semibold">评论</h2>
        {data.comments.length ? (
          <div className="grid gap-3">
            {data.comments.map((comment) => (
              <div className="rounded-3xl bg-white p-5" key={comment.id}>
                <p className="text-sm leading-6 text-black/70">{comment.body}</p>
                <p className="mt-3 text-xs text-black/42">{formatDate(comment.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-black/50">还没有评论，成为第一个回应的人。</p>
        )}
      </Panel>
    </div>
  );
}
