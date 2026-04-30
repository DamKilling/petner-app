import { ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";

import { addPet, signOut, updateProfile } from "@/app/actions";
import { BookingTimeline, MetricStrip, PetCard, ReviewHighlight, SectionTabs, TrustBadge } from "@/components/product-ui";
import { ButtonLink, EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getBookingTimeline, getChatThreads, getCurrentUser, getOwnedPets, getReviewSummary } from "@/lib/data";
import { demoProfile } from "@/lib/demo-data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const copy = dict.profile;
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
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={
          <SectionTabs
            active={`/app/profile?tab=${activeTab}`}
            tabs={[
              { href: "/app/profile?tab=account", label: copy.accountTab, meta: copy.accountMeta },
              { href: "/app/profile?tab=pets", label: copy.petsTab, meta: copy.petsMeta },
            ]}
          />
        }
      />

      <MetricStrip
        items={[
          { label: copy.myPets, value: pets.length, hint: copy.myPetsHint },
          { label: copy.activeRelations, value: bookings.length, hint: copy.activeRelationsHint },
          { label: copy.pendingMessages, value: chats.length, hint: copy.pendingMessagesHint },
        ]}
      />

      {!editable ? (
        <Panel className="border border-dashed border-black/12 bg-white/60">
          <p className="text-sm leading-7 text-black/58">{copy.demoNotice}</p>
        </Panel>
      ) : null}

      {activeTab === "account" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.5fr]">
          <div className="grid gap-6">
            <Panel className="overflow-hidden bg-[#1f1916] text-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6c07b]">{copy.profileKicker}</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">{profile.display_name}</h2>
                  <p className="mt-2 text-sm text-white/62">{profile.city}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{profile.bio}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TrustBadge label={profile.verification_status === "verified" ? copy.identityVerified : copy.profileComplete} tone="verified" />
                  <TrustBadge label={profile.response_time_label ?? dict.common.usuallyReplies} tone="trust" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">{copy.averageRating}</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.rating_avg?.toFixed(1) ?? "4.8"}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">{copy.completedServices}</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.completed_booking_count ?? 8}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xs text-white/44">{copy.repeatBookings}</p>
                  <p className="mt-2 text-2xl font-semibold">{profile.repeat_booking_count ?? 3}</p>
                </div>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Panel>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.editKicker}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{copy.editTitle}</h2>
                  </div>
                  <ShieldCheck className="size-5 text-[#b14e31]" />
                </div>
                {editable ? (
                  <form action={updateProfile} className="mt-6 grid gap-4">
                    <Field defaultValue={profile.display_name} label={copy.displayName} name="display_name" required />
                    <Field defaultValue={profile.phone} label={copy.phone} name="phone" />
                    <Field defaultValue={profile.city} label={copy.city} name="city" required />
                    <TextArea defaultValue={profile.bio} label={copy.bio} name="bio" required />
                    <SubmitButton>{copy.saveProfile}</SubmitButton>
                  </form>
                ) : (
                  <div className="mt-6 rounded-[1.35rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-black/58">
                    {copy.editLocked}
                  </div>
                )}
                {editable ? (
                  <form action={signOut} className="mt-3">
                    <SubmitButton variant="danger">{dict.common.signOut}</SubmitButton>
                  </form>
                ) : null}
              </Panel>

              <div className="grid gap-6">
                <ReviewHighlight summary={reviewSummary} locale={locale} />
                <Panel>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.recentChatsKicker}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{copy.recentChatsTitle}</h2>
                    </div>
                    <ButtonLink href="/app/chats" variant="ghost" className="px-0">
                      {copy.goMessages}
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
                      <EmptyState title={copy.emptyChatsTitle} detail={copy.emptyChatsDetail} />
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          </div>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.bookingsKicker}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.bookingsTitle}</h2>
              </div>
              <Star className="size-5 text-[#b14e31]" />
            </div>
            <div className="mt-5">
              <BookingTimeline items={bookings} locale={locale} />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
          <div className="grid gap-6">
            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.petAssetsKicker}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{copy.petAssetsTitle}</h2>
                </div>
                <div className="flex gap-2">
                  <ButtonLink href="/app/tree" variant="secondary">
                    {copy.enterTree}
                  </ButtonLink>
                  <ButtonLink href="/app/tree/interactive" variant="secondary">
                    {copy.interactiveTree}
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
                    ctaLabel={copy.petDetailCta}
                    locale={locale}
                    actionSlot={<span className="text-xs text-black/42">{pet.health_summary}</span>}
                  />
                ))
              ) : (
                <EmptyState title={copy.emptyPetsTitle} detail={copy.emptyPetsDetail} />
              )}
            </section>
          </div>

          <div className="grid gap-6">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b14e31]">{copy.addPetKicker}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{copy.addPetTitle}</h2>
                </div>
                <Sparkles className="size-5 text-[#b14e31]" />
              </div>
              {editable ? (
                <form action={addPet} className="mt-6 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={copy.petName} name="name" required />
                    <Field defaultValue={locale === "en" ? "Dog" : "狗狗"} label={copy.species} name="species" required />
                    <Field label={copy.breed} name="breed" required />
                    <Field label={copy.age} name="age_text" placeholder={locale === "en" ? "10 months" : "10个月"} required />
                    <SelectField defaultValue="unknown" label={copy.sex} name="sex">
                      <option value="unknown">{copy.unknownSex}</option>
                      <option value="male">{copy.male}</option>
                      <option value="female">{copy.female}</option>
                    </SelectField>
                    <Field defaultValue={profile.city ?? (locale === "en" ? "Shanghai" : "上海")} label={copy.city} name="city" required />
                    <SelectField defaultValue="public" label={copy.visibility} name="visibility">
                      <option value="public">{copy.publicVisibility}</option>
                      <option value="private">{copy.privateVisibility}</option>
                    </SelectField>
                  </div>
                  <TextArea label={copy.petBio} name="bio" required />
                  <Field label={copy.interests} name="interests" placeholder={locale === "en" ? "Frisbee outdoors friendly" : "飞盘 户外 黏人"} />
                  <Field
                    label={copy.lookingFor}
                    name="looking_for"
                    placeholder={locale === "en" ? "Walks, local playmates, slow introductions" : "一起散步、同城玩伴、慢慢认识"}
                  />
                  <SelectField defaultValue="ember" label={copy.accent} name="accent">
                    <option value="ember">Ember</option>
                    <option value="pine">Pine</option>
                    <option value="sky">Sky</option>
                    <option value="peach">Peach</option>
                    <option value="plum">Plum</option>
                    <option value="mint">Mint</option>
                  </SelectField>
                  <label className="flex items-center gap-2 text-sm text-black/70">
                    <input defaultChecked name="vaccinated" type="checkbox" />
                    {copy.vaccinated}
                  </label>
                  <SubmitButton>{copy.savePet}</SubmitButton>
                </form>
              ) : (
                <div className="mt-6 rounded-[1.35rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-black/58">
                  {copy.addPetLocked}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
