import Link from "next/link";

import { addMemory } from "@/app/actions";
import { ButtonLink, EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getMemories } from "@/lib/data";
import { accentSoftClasses } from "@/lib/theme";

export default async function TreePage() {
  const user = await getCurrentUser();
  const memories = await getMemories(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Tree"
        title="宠物成长树"
        description="把重要照片、音频和成长故事挂在一条可以回看的时间线上。"
        action={<ButtonLink href="/app/tree/interactive">进入互动圣诞树</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="grid gap-4">
          {memories.length ? (
            memories.map((memory) => (
              <Link
                className="group rounded-[2rem] border border-black/10 bg-white/78 p-6 hover:-translate-y-0.5 hover:bg-white"
                href={`/app/tree/${memory.id}`}
                key={memory.id}
              >
                <span className={accentSoftClasses[memory.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
                  {memory.date_text}
                </span>
                <h2 className="mt-5 text-2xl font-semibold">{memory.title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/55">{memory.subtitle}</p>
              </Link>
            ))
          ) : (
            <EmptyState title="还没有成长记忆" detail="新增第一条记录，上传照片或音频，让成长树亮起来。" />
          )}
        </section>

        <Panel>
          <h2 className="text-2xl font-semibold">新增记忆</h2>
          <form action={addMemory} className="mt-6 grid gap-4">
            <Field label="标题" name="title" required />
            <Field label="副标题" name="subtitle" required />
            <Field defaultValue="2026.04.23" label="日期" name="date_text" required />
            <TextArea label="完整故事" name="story" required />
            <div className="grid gap-4 md:grid-cols-2">
              <Field defaultValue="star" label="装饰图标" name="ornament" />
              <SelectField defaultValue="pine" label="主题色" name="accent">
                <option value="pine">Pine</option>
                <option value="ember">Ember</option>
                <option value="peach">Peach</option>
                <option value="mint">Mint</option>
              </SelectField>
            </div>
            <Field label="照片" name="photo" type="file" />
            <Field label="音频" name="audio" type="file" />
            <SubmitButton>保存并查看详情</SubmitButton>
          </form>
        </Panel>
      </div>
    </div>
  );
}
