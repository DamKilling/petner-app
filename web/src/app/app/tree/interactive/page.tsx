import { InteractiveChristmasTree } from "@/components/interactive-christmas-tree";
import { getCurrentUser, getInteractiveMemories } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export default async function InteractiveTreePage() {
  const locale = await getRequestLocale();
  const user = await getCurrentUser();
  const memories = await getInteractiveMemories(user?.id ?? "demo");
  const copy = getDictionary(locale).interactiveTree;

  return (
    <InteractiveChristmasTree
      key={locale}
      copy={copy}
      memories={memories}
      musicSrc="/audio/warm-petlife-bgm.wav"
    />
  );
}
