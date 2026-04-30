import { Panel } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n";

export function SetupNotice({ copy }: { copy: Dictionary["setupNotice"] }) {
  return (
    <Panel className="border-[#f06f4f]/30 bg-[#fff4ec]">
      <p className="text-sm font-semibold text-[#b3482f]">{copy.title}</p>
      <p className="mt-2 text-sm leading-6 text-black/62">
        {copy.detailBefore}
        <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">.env.example</code>
        {copy.detailMiddle}
        <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">.env.local</code>
        {copy.detailAfter}
        <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">supabase/migrations</code>
        {copy.detailEnd}
      </p>
    </Panel>
  );
}
