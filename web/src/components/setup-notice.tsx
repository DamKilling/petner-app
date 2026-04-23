import { Panel } from "@/components/ui";

export function SetupNotice() {
  return (
    <Panel className="border-[#f06f4f]/30 bg-[#fff4ec]">
      <p className="text-sm font-semibold text-[#b3482f]">Supabase 尚未配置</p>
      <p className="mt-2 text-sm leading-6 text-black/62">
        当前页面使用演示数据渲染。要启用多人登录、数据库、Storage 和聊天刷新，请复制
        <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">.env.example</code>
        为 <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">.env.local</code>
        ，填入 Supabase 项目的 URL 和 publishable key，并执行
        <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5">supabase/migrations</code>
        里的 SQL。
      </p>
    </Panel>
  );
}
