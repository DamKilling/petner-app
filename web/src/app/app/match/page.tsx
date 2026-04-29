import Link from "next/link";
import { CalendarCheck, Clock3, MapPin, PawPrint, RefreshCw, ShieldCheck, Star, UsersRound } from "lucide-react";

import { createPost, openChat, toggleLike } from "@/app/actions";
import { ButtonLink, EmptyState, Field, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { PetCard, ReviewHighlight, SectionTabs, TrustBadge } from "@/components/product-ui";
import { getCurrentUser, getDiscoverPets, getFeedPosts, getOwnedPets, getReviewSummary, getServiceBoardData } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { formatDate } from "@/lib/utils";

export default async function MatchPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; surface?: string; serviceType?: string; city?: string }>;
}) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const copy = dict.match;
  const resolvedSearchParams = (await searchParams) ?? {};
  const activeTab = resolvedSearchParams.tab === "services" ? "services" : "community";
  const serviceSurface = resolvedSearchParams.surface === "requests" ? "requests" : "offers";
  const serviceType = resolvedSearchParams.serviceType;
  const city = resolvedSearchParams.city;
  const user = await getCurrentUser();
  const [discoverPets, ownedPets, posts, serviceBoard, reviewSummary] = await Promise.all([
    getDiscoverPets(user?.id ?? "demo"),
    getOwnedPets(user?.id ?? "demo"),
    getFeedPosts(user?.id ?? "demo"),
    getServiceBoardData({ userID: user?.id ?? "demo", surface: serviceSurface, serviceType, city }),
    getReviewSummary(),
  ]);
  const visiblePets = [...ownedPets, ...discoverPets];
  const offers = serviceBoard.offers;
  const requests = serviceBoard.requests;

  return (
    <div className="grid gap-8">
      <section className="overflow-hidden rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,#fffaf4_0%,#f7f3ec_54%,#eef6ef_100%)] px-5 py-6 shadow-[0_22px_70px_rgba(47,35,22,0.07)] md:px-8 md:py-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c65f45]">{copy.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#2f241e] md:text-5xl">
              {activeTab === "services" ? copy.servicesTitle : copy.communityTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62 md:text-base">
              {activeTab === "services" ? copy.servicesDescription : copy.communityDescription}
            </p>
          </div>
          <SectionTabs
            active={`/app/match?tab=${activeTab}`}
            tabs={[
              { href: "/app/match?tab=community", label: copy.tabs.community, meta: copy.tabs.communityMeta },
              { href: "/app/match?tab=services", label: copy.tabs.services, meta: copy.tabs.servicesMeta },
            ]}
          />
        </div>
      </section>

      {activeTab === "community" ? (
        <div className="grid gap-6 xl:grid-cols-[0.74fr_1fr_0.38fr]">
          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.postComposerKicker}</p>
              <h2 className="mt-3 text-2xl font-semibold">{copy.postComposerTitle}</h2>
              <form action={createPost} className="mt-6 grid gap-4">
                <SelectField label={copy.relatedPet} name="related_pet_id">
                  <option value="">{copy.noRelatedPet}</option>
                  {ownedPets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </SelectField>
                <Field label={copy.fallbackPetName} name="pet_name" placeholder={locale === "en" ? "My pet" : "我的宠物"} />
                <Field defaultValue={locale === "en" ? "Playmates" : "找玩伴"} label={copy.contentType} name="topic" required />
                <Field defaultValue={user?.profile.city ?? (locale === "en" ? "Shanghai" : "上海")} label={copy.city} name="city" required />
                <TextArea label={copy.body} name="content" required placeholder={copy.bodyPlaceholder} />
                <Field defaultValue={locale === "en" ? "playmates daily-life" : "找玩伴 宠物日常"} label={copy.tags} name="tags" />
                <SubmitButton>{copy.publishPost}</SubmitButton>
              </form>
            </Panel>

            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.categories}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {copy.categoryList.map((item, index) => (
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
                      <TrustBadge label={copy.petVisible} tone="verified" />
                      <TrustBadge label={copy.chatSupported} tone="trust" />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {post.pet_name} · {post.topic}
                        </h2>
                        <p className="mt-2 text-sm text-black/52">
                          {post.city} · {formatDate(post.created_at)}
                        </p>
                      </div>
                      <form action={toggleLike}>
                        <input name="post_id" type="hidden" value={post.id} />
                        <button className="rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-semibold text-[#9b321c]" type="submit">
                          {liked ? copy.liked : copy.like} · {likes}
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
                        {copy.openDetail} · {comments} {copy.comments}
                      </Link>
                      {post.related_pet_id ? (
                        <Link href={`/app/match/pets/${post.related_pet_id}`} className="text-black/58">
                          {copy.viewPet}
                        </Link>
                      ) : null}
                      {relatedPet ? (
                        <form action={openChat}>
                          <input name="pet_id" type="hidden" value={relatedPet.id} />
                          <button className="text-black/58" type="submit">
                            {copy.startChat}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState title={copy.emptyPostsTitle} detail={copy.emptyPostsDetail} />
            )}
          </section>

          <div className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <ReviewHighlight locale={locale} summary={reviewSummary} />
            <Panel>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.worthMeeting}</p>
              <div className="mt-4 grid gap-3">
                {discoverPets.slice(0, 2).map((pet) => (
                  <PetCard key={pet.id} locale={locale} pet={pet} href={`/app/match/pets/${pet.id}`} compact />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)] 2xl:grid-cols-[17rem_minmax(34rem,1fr)_20rem]">
          <aside className="grid gap-4 xl:sticky xl:top-8 xl:self-start">
            <Panel className="rounded-[1.5rem] bg-white/88 p-4 shadow-[0_16px_48px_rgba(47,35,22,0.07)] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#2f241e]">{copy.quickFilter}</p>
                {serviceType ? (
                  <Link href={`/app/match?tab=services&surface=${serviceSurface}`} className="text-xs font-semibold text-[#c45d42]">
                    {dict.common.reset}
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible xl:pb-0">
                <Link
                  href={`/app/match?tab=services&surface=${serviceSurface}`}
                  className={!serviceType ? "shrink-0 rounded-full bg-[#e96a4b] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(233,106,75,0.22)] xl:rounded-2xl" : "shrink-0 rounded-full border border-black/8 bg-[#f7f3ed] px-4 py-2.5 text-sm font-medium text-black/62 transition hover:bg-white xl:rounded-2xl"}
                >
                  {dict.common.all}
                </Link>
                {copy.serviceTypes.map((item) => (
                  <Link
                    key={item}
                    href={`/app/match?tab=services&surface=${serviceSurface}&serviceType=${encodeURIComponent(item)}`}
                    className={serviceType === item ? "shrink-0 rounded-full bg-[#e96a4b] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(233,106,75,0.22)] xl:rounded-2xl" : "shrink-0 rounded-full border border-black/8 bg-[#f7f3ed] px-4 py-2.5 text-sm font-medium text-black/62 transition hover:bg-white xl:rounded-2xl"}
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                <ButtonLink href="/app/match/services/new" variant="secondary" className="w-full">
                  {dict.common.publishService}
                </ButtonLink>
                <ButtonLink href="/app/match/requests/new" variant="ghost" className="w-full justify-center">
                  {dict.common.publishRequest}
                </ButtonLink>
              </div>
            </Panel>

            <Panel className="rounded-[1.5rem] bg-white/72 p-4 shadow-[0_12px_36px_rgba(47,35,22,0.05)] md:p-5">
              <p className="text-sm font-semibold text-[#2f241e]">{copy.serviceFlow}</p>
              <div className="mt-4 grid gap-2.5 text-sm text-black/62">
                {copy.serviceFlowSteps.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#f8f3ec] px-3 py-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#c45d42] shadow-sm">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </aside>

          <section className="grid content-start gap-4">
            <div className="flex flex-col gap-3 rounded-[1.6rem] border border-black/8 bg-white/78 p-3 shadow-[0_16px_52px_rgba(47,35,22,0.06)] 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <SectionTabs
                active={`/app/match?tab=services&surface=${serviceSurface}`}
                tabs={[
                  { href: "/app/match?tab=services&surface=offers", label: copy.offers, meta: `${offers.length}` },
                  { href: "/app/match?tab=services&surface=requests", label: copy.requests, meta: `${requests.length}` },
                ]}
              />
              <div className="flex items-center gap-2 rounded-full bg-[#f7f3ed] px-3 py-2 text-xs font-medium text-black/50">
                <CalendarCheck className="size-4 text-[#c45d42]" />
                {copy.contactFirst}
              </div>
            </div>

            {serviceSurface === "offers" && offers.length ? (
              offers.map((offer) => (
                <article
                  key={offer.id}
                  className="group overflow-hidden rounded-[1.6rem] border border-black/8 bg-white/90 p-5 shadow-[0_18px_54px_rgba(47,35,22,0.08)] transition hover:-translate-y-0.5 hover:border-[#e96a4b]/28 hover:shadow-[0_24px_72px_rgba(47,35,22,0.12)]"
                >
                  <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)] 2xl:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fff0df,#e6f1e7)] text-[#c45d42]">
                      <PawPrint className="size-7" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {offer.service_types.map((item) => (
                          <span key={item} className="rounded-full bg-[#fff0e8] px-3 py-1 text-xs font-semibold leading-relaxed text-[#a94831]">
                            {item}
                          </span>
                        ))}
                      </div>
                      <h2 className="mt-3 break-words text-xl font-semibold leading-snug tracking-tight text-[#2f241e]">{offer.title ?? offer.provider_name}</h2>
                      <p className="mt-1 break-words text-sm leading-6 text-black/50">
                        {offer.provider_name} · {offer.related_pet_name ?? dict.common.noPetRequest}
                      </p>
                      <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-black/62">{offer.intro}</p>
                      <div className="mt-4 grid gap-2 text-sm text-black/58 sm:grid-cols-3">
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="size-4 fill-current text-[#d99735]" />
                          {offer.rating_avg.toFixed(1)} · {offer.rating_count} {dict.product.reviews}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-4 text-black/36" />
                          {offer.service_area}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-4 text-black/36" />
                          {offer.availability_summary}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:col-span-2 md:items-center md:justify-between 2xl:col-span-1 2xl:flex-col 2xl:items-end 2xl:justify-between">
                      <div className="rounded-2xl bg-[#f8f3ec] px-4 py-2 text-sm font-semibold text-[#2f241e]">{offer.price_mode}</div>
                      <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/app/match/services/${offer.id}`} className="h-10 px-4">
                          {dict.common.viewDetails}
                        </ButtonLink>
                        <ButtonLink href={`/app/match/services/${offer.id}`} variant="secondary" className="h-10 px-4">
                          {dict.common.book}
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : serviceSurface === "requests" && requests.length ? (
              requests.map((request) => (
                <article key={request.id} className="rounded-[1.6rem] border border-black/8 bg-white/90 p-5 shadow-[0_18px_54px_rgba(47,35,22,0.08)] transition hover:-translate-y-0.5 hover:border-[#9bb89a]/36">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-[#edf5ed] px-3 py-1 text-xs font-semibold text-[#55715a]">{request.request_type}</span>
                      <h2 className="mt-3 text-xl font-semibold text-[#2f241e]">{request.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-black/60">{request.detail}</p>
                    </div>
                    <ButtonLink href={`/app/match/requests/${request.id}`} className="h-10 px-4">
                      {dict.product.requestDetail}
                    </ButtonLink>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-black/58 sm:grid-cols-3">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-black/36" />
                      {request.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4 text-black/36" />
                      {request.preferred_time_summary}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UsersRound className="size-4 text-black/36" />
                      {request.related_pet_name ?? dict.common.noPetRequest}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-[#e8d8c8] bg-[linear-gradient(135deg,#fffaf5,#f7f1ea)] p-8 text-center shadow-[0_18px_54px_rgba(47,35,22,0.05)] md:p-10">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-[#d06449] shadow-[0_12px_30px_rgba(47,35,22,0.08)]">
                  <PawPrint className="size-7" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-[#2f241e]">{copy.noServiceTitle}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/58">{copy.noServiceDetail}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/app/match?tab=community" variant="secondary">
                    {copy.viewPet}
                  </ButtonLink>
                  <ButtonLink href={`/app/match?tab=services&surface=${serviceSurface}`}>
                    <RefreshCw className="mr-2 size-4" />
                    {dict.common.refresh}
                  </ButtonLink>
                </div>
              </div>
            )}
          </section>

          <aside className="grid gap-4 xl:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-8 2xl:self-start">
            <Panel className="rounded-[1.5rem] bg-white/90 p-5 shadow-[0_18px_54px_rgba(47,35,22,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-[#fff0d8] text-[#b97716]">
                  <Star className="size-5 fill-current" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[#2f241e]">{reviewSummary.rating_avg.toFixed(1)} / 5</p>
                  <p className="text-sm text-black/50">
                    {reviewSummary.rating_count} {dict.product.reviews} · {reviewSummary.repeat_booking_count} {dict.product.repeatBookings}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {reviewSummary.highlight_tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f7f3ed] px-3 py-1 text-xs text-black/62">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 border-l-2 border-[#e96a4b]/30 pl-3 text-sm leading-6 text-black/58">{reviewSummary.quote}</p>
            </Panel>

            <Panel className="rounded-[1.5rem] bg-[#1f1916] p-5 text-white shadow-[0_18px_54px_rgba(47,35,22,0.14)]">
              <p className="text-sm font-semibold text-[#ffd6a7]">{copy.platformSafety}</p>
              <div className="mt-4 grid gap-3 text-sm text-white/70">
                {copy.safetyItems.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-[#ffd6a7]" />
                    {item}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="rounded-[1.5rem] bg-white/82 p-5 shadow-[0_14px_42px_rgba(47,35,22,0.06)]">
              <p className="text-sm font-semibold text-[#2f241e]">{copy.continueActions}</p>
              <div className="mt-4 grid gap-2">
                <ButtonLink href="/app/match/services/new">{dict.common.publishService}</ButtonLink>
                <ButtonLink href="/app/match/requests/new" variant="secondary">
                  {dict.common.publishRequest}
                </ButtonLink>
                <ButtonLink href="/app/profile?tab=account" variant="ghost">
                  {copy.myBookings}
                </ButtonLink>
              </div>
            </Panel>
          </aside>
        </div>
      )}
    </div>
  );
}
