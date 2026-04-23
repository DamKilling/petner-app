import { InteractiveChristmasTree } from "@/components/interactive-christmas-tree";
import { getCurrentUser, getInteractiveMemories } from "@/lib/data";

export default async function InteractiveTreePage() {
  const user = await getCurrentUser();
  const memories = await getInteractiveMemories(user?.id ?? "demo");

  return (
    <InteractiveChristmasTree
      memories={memories}
      musicSrc="/audio/warm-petlife-bgm.wav"
    />
  );
}
