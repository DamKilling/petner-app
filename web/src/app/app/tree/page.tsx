import Link from "next/link";

import { MemoryComposerForm } from "@/components/memory-composer-form";
import { ButtonLink, EmptyState, PageHeader, Panel } from "@/components/ui";
import { getCurrentUser, getMemories } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { accentSoftClasses } from "@/lib/theme";

export default async function TreePage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const copy = dict.tree;
  const user = await getCurrentUser();
  const memories = await getMemories(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        action={<ButtonLink href="/app/tree/interactive">{copy.interactiveCta}</ButtonLink>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section className="grid gap-4">
          {memories.length ? (
            memories.map((memory) => (
              <Link
                className="group rounded-[2rem] border border-black/10 bg-white/78 p-6 transition hover:-translate-y-0.5 hover:bg-white"
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
            <EmptyState title={copy.emptyTitle} detail={copy.emptyDetail} />
          )}
        </section>

        <Panel>
          <MemoryComposerForm copy={dict.memoryComposer} userID={user?.id ?? "demo"} />
        </Panel>
      </div>
    </div>
  );
}
