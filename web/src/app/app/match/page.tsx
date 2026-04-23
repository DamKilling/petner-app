import Link from "next/link";

import { createPost, openChat, toggleLike } from "@/app/actions";
import { EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getDiscoverPets, getFeedPosts, getOwnedPets } from "@/lib/data";
import { accentSoftClasses } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

export default async function MatchPage() {
  const user = await getCurrentUser();
  const [discoverPets, ownedPets, posts] = await Promise.all([
    getDiscoverPets(user?.id ?? "demo"),
    getOwnedPets(user?.id ?? "demo"),
    getFeedPosts(user?.id ?? "demo"),
  ]);

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Match"
        title="宠物社交广场"
        description="浏览公开宠物档案、发布动态、点赞评论，并把意向关系转进聊天。"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {discoverPets.length ? (
          discoverPets.map((pet) => (
            <Panel key={pet.id}>
              <span className={accentSoftClasses[pet.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
                {pet.city}
              </span>
              <h2 className="mt-5 text-2xl font-semibold">
                {pet.name} · {pet.breed}
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/58">{pet.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {pet.interests.map((interest) => (
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link className="text-sm font-semibold text-[#f06f4f]" href={`/app/match/pets/${pet.id}`}>
                  查看档案
                </Link>
                <form action={openChat}>
                  <input name="pet_id" type="hidden" value={pet.id} />
                  <button className="text-sm font-semibold text-black/58" type="submit">
                    发起聊天
                  </button>
                </form>
              </div>
            </Panel>
          ))
        ) : (
          <EmptyState title="还没有公开宠物" detail="当其他用户创建公开宠物档案后，会出现在这里。" />
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1fr]">
        <Panel>
          <h2 className="text-2xl font-semibold">发布动态</h2>
          <form action={createPost} className="mt-6 grid gap-4">
            <SelectField label="关联宠物" name="related_pet_id">
              <option value="">不关联宠物</option>
              {ownedPets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </SelectField>
            <Field label="备用宠物名" name="pet_name" placeholder="我的宠物" />
            <Field defaultValue="同城交友" label="主题" name="topic" required />
            <Field defaultValue={user?.profile.city ?? "上海"} label="城市" name="city" required />
            <TextArea label="正文" name="content" required />
            <Field defaultValue="遛宠 社交" label="标签" name="tags" />
            <SubmitButton>发布并进入详情</SubmitButton>
          </form>
        </Panel>

        <section className="grid gap-4">
          {posts.length ? (
            posts.map(({ post, likes, comments, liked }) => (
              <Panel key={post.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {post.pet_name} · {post.topic}
                    </h2>
                    <p className="mt-1 text-sm text-black/52">
                      {post.city} · {formatDate(post.created_at)}
                    </p>
                  </div>
                  <form action={toggleLike}>
                    <input name="post_id" type="hidden" value={post.id} />
                    <button className="rounded-full bg-[#f06f4f]/10 px-3 py-1 text-xs font-semibold text-[#9b321c]" type="submit">
                      {liked ? "已喜欢" : "喜欢"} {likes}
                    </button>
                  </form>
                </div>
                <p className="mt-5 text-sm leading-6 text-black/62">{post.content}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link className="mt-6 inline-flex text-sm font-semibold text-[#f06f4f]" href={`/app/match/posts/${post.id}`}>
                  进入详情 · {comments} 条评论
                </Link>
              </Panel>
            ))
          ) : (
            <EmptyState title="还没有动态" detail="发布第一条动态后，会直接进入详情页继续评论互动。" />
          )}
        </section>
      </div>
    </div>
  );
}
