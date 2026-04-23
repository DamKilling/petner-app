import Link from "next/link";

import { createPost, openChat, toggleLike } from "@/app/actions";
import { EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { PetCard, ReviewHighlight, SectionTabs, ServiceCard, TrustBadge } from "@/components/product-ui";
import { getCurrentUser, getDiscoverPets, getFeedPosts, getOwnedPets, getReviewSummary, getServiceOffers } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function MatchPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab = resolvedSearchParams.tab === "services" ? "services" : "community";
  const user = await getCurrentUser();
  const [discoverPets, ownedPets, posts, offers, reviewSummary] = await Promise.all([
    getDiscoverPets(user?.id ?? "demo"),
    getOwnedPets(user?.id ?? "demo"),
    getFeedPosts(user?.id ?? "demo"),
    getServiceOffers(user?.id ?? "demo"),
    getReviewSummary(),
  ]);
  const visiblePets = [...ownedPets, ...discoverPets];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Community & Services"
        title="先通过内容和档案建立判断，再继续联系与预约。"
        description="PetLife 把社区内容流和服务匹配放在同一个工作区里：社区负责活跃与发现，服务负责清晰转化。"
        action={
          <SectionTabs
            active={`/app/match?tab=${activeTab}`}
            tabs={[
              { href: "/app/match?tab=community", label: "社区", meta: "内容流" },
              { href: "/app/match?tab=services", label: "服务", meta: "匹配与预约" },
            ]}
          />
        }
      />

      {activeTab === "community" ? (
        <div className="grid gap-6 xl:grid-cols-[0.74fr_1fr_0.38fr]">
          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">发布动态</p>
              <h2 className="mt-3 text-2xl font-semibold">让别人先看到你的宠物状态，再决定要不要继续联系。</h2>
              <form action={createPost} className="mt-6 grid gap-4">
                <SelectField label="关联宠物" name="related_pet_id">
                  <option value="">不关联宠物</option>
                  {ownedPets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </SelectField>
                <Field label="备用宠物名称" name="pet_name" placeholder="我的宠物" />
                <Field defaultValue="找玩伴" label="内容类型" name="topic" required />
                <Field defaultValue={user?.profile.city ?? "上海"} label="城市" name="city" required />
                <TextArea label="正文" name="content" required placeholder="比如：想找同城玩伴、想请教经验、想记录日常..." />
                <Field defaultValue="找玩伴 宠物日常" label="标签" name="tags" />
                <SubmitButton>发布并进入详情</SubmitButton>
              </form>
            </Panel>

            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">高频分类</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["推荐", "找玩伴", "宠物日常", "求助问答", "经验分享"].map((item, index) => (
                  <span
                    key={item}
                    className={index === 0 ? "rounded-full bg-[#f06f4f] px-3 py-1.5 text-xs font-semibold text-white" : "rounded-full bg-black/[0.04] px-3 py-1.5 text-xs text-black/58"}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Panel>
          </div>

          <section className="grid gap-4">
            {posts.length ? (
              posts.map(({ post, likes, comments, liked }) => {
                const relatedPet = visiblePets.find((pet) => pet.id === post.related_pet_id);

                return (
                  <article key={post.id} className="rounded-[1.9rem] border border-black/8 bg-white/82 p-6 shadow-[0_18px_50px_rgba(47,35,22,0.06)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <TrustBadge label="宠物信息可见" tone="verified" />
                      <TrustBadge label="支持继续聊天" tone="trust" />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">{post.pet_name} · {post.topic}</h2>
                        <p className="mt-2 text-sm text-black/52">
                          {post.city} · {formatDate(post.created_at)}
                        </p>
                      </div>
                      <form action={toggleLike}>
                        <input name="post_id" type="hidden" value={post.id} />
                        <button className="rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-semibold text-[#9b321c]" type="submit">
                          {liked ? "已喜欢" : "喜欢"} · {likes}
                        </button>
                      </form>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-black/66">{post.content}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-black/58">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-black/8 pt-4 text-sm font-semibold">
                      <Link href={`/app/match/posts/${post.id}`} className="text-[#b54a2f]">
                        进入详情 · {comments} 条评论
                      </Link>
                      {post.related_pet_id ? (
                        <Link href={`/app/match/pets/${post.related_pet_id}`} className="text-black/58">
                          查看宠物档案
                        </Link>
                      ) : null}
                      {relatedPet ? (
                        <form action={openChat}>
                          <input name="pet_id" type="hidden" value={relatedPet.id} />
                          <button className="text-black/58" type="submit">
                            发起聊天
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState
                title="还没有社区动态"
                detail="先发布第一条宠物日常、找玩伴或经验分享，系统会直接把你带入详情页继续互动。"
              />
            )}
          </section>

          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <ReviewHighlight summary={reviewSummary} />
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">值得继续认识</p>
              <div className="mt-4 grid gap-3">
                {discoverPets.slice(0, 2).map((pet) => (
                  <PetCard key={pet.id} pet={pet} href={`/app/match/pets/${pet.id}`} compact />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.3fr_1fr_0.36fr]">
          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">快速筛选</p>
              <div className="mt-4 grid gap-2">
                {["宠物陪伴", "玩伴匹配", "临时照看", "附近活动"].map((item, index) => (
                  <div
                    key={item}
                    className={index === 0 ? "rounded-[1rem] bg-[#f06f4f] px-4 py-3 text-sm font-semibold text-white" : "rounded-[1rem] bg-black/[0.04] px-4 py-3 text-sm text-black/62"}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-5 text-black/46">更多筛选可在移动端底部抽屉或桌面右侧扩展面板中继续添加。</p>
            </Panel>
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">服务流程</p>
              <div className="mt-4 grid gap-3 text-sm text-black/62">
                {["看资料与评价", "发起联系", "确认时间地点", "进入预约", "服务后评价"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#f06f4f]/12 text-xs font-semibold text-[#b14e31]">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <section className="grid gap-4">
            {offers.length ? (
              offers.map((offer) => (
                <ServiceCard key={offer.id} offer={offer} href={offer.related_pet_id ? `/app/match/pets/${offer.related_pet_id}` : "/app/chats"} />
              ))
            ) : (
              <EmptyState
                title="还没有可展示的服务项"
                detail="接入更多用户和服务资料后，这里会成为陪伴、玩伴与预约的发现入口。"
              />
            )}
          </section>

          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <ReviewHighlight summary={reviewSummary} />
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">先看这些宠物档案</p>
              <div className="mt-4 grid gap-3">
                {discoverPets.slice(0, 2).map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    href={`/app/match/pets/${pet.id}`}
                    ctaLabel="查看可预约信息"
                    compact
                  />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
