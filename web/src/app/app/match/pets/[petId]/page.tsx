import { notFound } from "next/navigation";

import { openChat } from "@/app/actions";
import { ButtonLink, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { getPet } from "@/lib/data";
import { accentSoftClasses } from "@/lib/theme";

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await getPet(petId);

  if (!pet) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        action={<ButtonLink href="/app/match" variant="secondary">返回社交广场</ButtonLink>}
        eyebrow="Pet Profile"
        title={`${pet.name} · ${pet.breed}`}
        description={pet.bio}
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr]">
        <div className="flex min-h-80 items-center justify-center rounded-[2.5rem] bg-[linear-gradient(135deg,#f6b38d,#8dd7b6)] text-8xl">
          🐾
        </div>
        <Panel>
          <span className={accentSoftClasses[pet.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
            {pet.city}
          </span>
          <dl className="mt-8 grid gap-4 text-sm">
            <div>
              <dt className="font-semibold text-black/45">物种</dt>
              <dd className="mt-1 text-lg">{pet.species}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/45">年龄</dt>
              <dd className="mt-1 text-lg">{pet.age_text}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/45">想找的关系</dt>
              <dd className="mt-1 text-lg leading-7">{pet.looking_for}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-2">
            {pet.interests.map((interest) => (
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs" key={interest}>
                {interest}
              </span>
            ))}
          </div>
          <form action={openChat} className="mt-8">
            <input name="pet_id" type="hidden" value={pet.id} />
            <SubmitButton>发起聊天</SubmitButton>
          </form>
        </Panel>
      </div>
    </div>
  );
}
