import { ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";

import { addPet, signOut, updateProfile } from "@/app/actions";
import { BookingTimeline, MetricStrip, PetCard, ReviewHighlight, SectionTabs, TrustBadge } from "@/components/product-ui";
import { ButtonLink, EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { demoProfile } from "@/lib/demo-data";
import { getBookingTimeline, getChatThreads, getCurrentUser, getOwnedPets, getReviewSummary } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab = resolvedSearchParams.tab === "pets" ? "pets" : "account";
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();
  const profile = user?.profile ?? demoProfile;
  const editable = configured && Boolean(user);
  const pets = await getOwnedPets(user?.id ?? "demo");
  const chats = user ? await getChatThreads(user.id) : [];
  const reviewSummary = await getReviewSummary();
  const bookings = await getBookingTimeline(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="My Space"
        title="把身份、宠物资产、评价与历史记录放在同一个可信的个人工作区。"
        description="个人中心不只是账号表单。它需要同时承载你的身份可信度、宠物档案完整度和服务历史。"
        action={
          <SectionTabs
            active={`/app/profile?tab=${activeTab}`}
            tabs={[
              { href: "/app/profile?tab=account", label: "我的主页", meta: "身份与评价" },
              { href: "/app/profile?tab=pets", label: "宠物资产", meta: "档案与成长" },
            ]}
          />
        }
      />

      <MetricStrip
        items={[
          { label: "我的宠物", value: pets.length, hint: "公开或私密档案" },
          { label: "进行中关系", value: bookings.length, hint: "待确认 / 已确认预约" },
          { label: "待回复消息", value: chats.length, hint: "可从消息页继续处理" },
        ]}
      />

      {!editable ? (
        <Panel className="border border-dashed border-black/12 bg-white/60">
          <p className="text-sm leading-7 text-black/58">
            当前为演示模式。你可以先预览个人主页、宠物资产和服务记录的结构；接入 Supabase 并登录后，再启用真实编辑和提交。
          </p>
        </Panel>
      ) : null}

      {activeTab === "account" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.5fr]">
          <div className="grid gap-6">
            <Panel className="overflow-hidden bg-[#1f1916] text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">Profile</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">{profile.display_name}</h2>
                  <p className="mt-2 text-sm text-white/62">{profile.city}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{profile.bio}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge label={profile.verification_status === "verified" ? "身份已验证" : "资料已完善"} tone="verified" />
                  <TrustBadge label={profile.response_time_label ?? "通常 30 分钟内回复"} tone="trust" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">平均评分</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.rating_avg?.toFixed(1) ?? "4.8"}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">完成服务</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.completed_booking_count ?? 8}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">复约次数</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.repeat_booking_count ?? 3}</p>
                </div>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Panel>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">编辑资料</p>
                    <h2 className="mt-2 text-2xl font-semibold">更新你的介绍和信任信息</h2>
                  </div>
                  <ShieldCheck className="size-5 text-[#b14e31]" />
                </div>
                {editable ? (
                  <form action={updateProfile} className="mt-6 grid gap-4">
                    <Field defaultValue={profile.display_name} label="昵称" name="display_name" required />
                    <Field defaultValue={profile.phone} label="手机号" name="phone" />
                    <Field defaultValue={profile.city} label="城市" name="city" required />
                    <TextArea defaultValue={profile.bio} label="个人简介" name="bio" required />
                    <SubmitButton>保存资料</SubmitButton>
                  </form>
                ) : (
                  <div className="mt-6 rounded-[1.35rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-black/58">
                    接入真实账号后，这里会支持编辑昵称、城市、简介和联系方式。
                  </div>
                )}
                {editable ? (
                  <form action={signOut} className="mt-3">
                    <SubmitButton variant="danger">退出登录</SubmitButton>
                  </form>
                ) : null}
              </Panel>

              <div className="grid gap-6">
                <ReviewHighlight summary={reviewSummary} />
                <Panel>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">最近会话</p>
                      <h2 className="mt-2 text-2xl font-semibold">继续处理中的关系</h2>
                    </div>
                    <ButtonLink href="/app/chats" variant="ghost" className="px-0">
                      去消息页
                    </ButtonLink>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {chats.length ? (
                      chats.slice(0, 3).map((thread) => (
                        <Link
                          key={thread.id}
                          href={`/app/chats/${thread.id}`}
                          className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-4 hover:bg-[#fff7ef]"
                        >
                          <p className="font-semibold">{thread.title}</p>
                          <p className="mt-1 text-sm text-black/54">{thread.subtitle}</p>
                        </Link>
                      ))
                    ) : (
                      <EmptyState
                        title="还没有进行中的聊天"
                        detail="从社区或服务卡进入联系后，会在这里继续承接。"
                      />
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          </div>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">预约与记录</p>
                <h2 className="mt-2 text-2xl font-semibold">最近服务进度</h2>
              </div>
              <Star className="size-5 text-[#b14e31]" />
            </div>
            <div className="mt-5">
              <BookingTimeline items={bookings} />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
          <div className="grid gap-6">
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">Pet Assets</p>
                  <h2 className="mt-2 text-2xl font-semibold">宠物档案和成长入口</h2>
                </div>
                <div className="flex gap-2">
                  <ButtonLink href="/app/tree" variant="secondary">
                    进入成长记录
                  </ButtonLink>
                  <ButtonLink href="/app/tree/interactive" variant="secondary">
                    互动成长树
                  </ButtonLink>
                </div>
              </div>
            </Panel>

            <section className="grid gap-4">
              {pets.length ? (
                pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    href={`/app/match/pets/${pet.id}`}
                    ctaLabel="查看宠物详情"
                    actionSlot={<span className="text-xs text-black/42">{pet.health_summary}</span>}
                  />
                ))
              ) : (
                <EmptyState
                  title="还没有宠物档案"
                  detail="先新增你的第一只宠物，后续社区、服务和聊天都能围绕它展开。"
                />
              )}
            </section>
          </div>

          <div className="grid gap-6">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">新增宠物</p>
                  <h2 className="mt-2 text-2xl font-semibold">把宠物档案做完整</h2>
                </div>
                <Sparkles className="size-5 text-[#b14e31]" />
              </div>
              {editable ? (
                <form action={addPet} className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="名字" name="name" required />
                    <Field defaultValue="狗狗" label="物种" name="species" required />
                    <Field label="品种" name="breed" required />
                    <Field label="年龄" name="age_text" placeholder="10个月" required />
                    <Field defaultValue={profile.city ?? "上海"} label="城市" name="city" required />
                    <SelectField defaultValue="public" label="可见性" name="visibility">
                      <option value="public">公开到社区与服务</option>
                      <option value="private">仅自己可见</option>
                    </SelectField>
                  </div>
                  <TextArea label="简介" name="bio" required />
                  <Field label="兴趣标签" name="interests" placeholder="飞盘 户外 黏人" />
                  <Field label="想找怎样的关系" name="looking_for" placeholder="一起散步、同城玩伴、慢慢认识" />
                  <SelectField defaultValue="ember" label="主题色" name="accent">
                    <option value="ember">Ember</option>
                    <option value="pine">Pine</option>
                    <option value="sky">Sky</option>
                    <option value="peach">Peach</option>
                    <option value="plum">Plum</option>
                    <option value="mint">Mint</option>
                  </SelectField>
                  <label className="flex items-center gap-2 text-sm text-black/70">
                    <input defaultChecked name="vaccinated" type="checkbox" />
                    已完成基础疫苗
                  </label>
                  <SubmitButton>保存宠物档案</SubmitButton>
                </form>
              ) : (
                <div className="mt-6 rounded-[1.35rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-black/58">
                  登录并完成数据配置后，这里会支持新增宠物档案，并把它们接入社区、服务和成长记录。
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
