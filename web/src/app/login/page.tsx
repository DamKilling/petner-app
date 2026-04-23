import { KeyRound } from "lucide-react";
import Link from "next/link";

import { signInWithPassword, signUpWithPassword } from "@/app/actions";
import { Panel, SubmitButton } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const message = params.message;
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_20%_20%,#ffd9b9,transparent_30rem),linear-gradient(135deg,#fffaf1,#f5eadb)] px-6 py-10 lg:grid-cols-[1fr_0.8fr]">
      <section className="flex items-center">
        <div className="max-w-3xl">
          <Link className="text-sm font-semibold text-black/55" href="/">
            PetLife Web
          </Link>
          <h1 className="mt-10 text-6xl font-semibold tracking-tight md:text-8xl">
            用邮箱和密码进入你的宠物宇宙。
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-black/58">
            关闭 Supabase 的 Confirm email 后，注册成功即可直接进入应用，不需要再点邮箱验证链接。
          </p>
        </div>
      </section>

      <section className="flex items-center">
        <Panel className="w-full">
          <div className="mb-8 flex size-14 items-center justify-center rounded-3xl bg-[#f06f4f] text-white">
            <KeyRound className="size-6" />
          </div>
          <h2 className="text-2xl font-semibold">账号登录</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            使用邮箱 + 密码登录。首次使用请先注册；注册后会自动创建 PetLife 资料。
          </p>

          {message ? (
            <p className="mt-5 rounded-2xl bg-[#f06f4f]/10 px-4 py-3 text-sm text-[#9b321c]">
              {message === "check-email"
                ? "登录链接已发送，请检查邮箱。"
                : message === "missing-supabase"
                  ? "请先配置 Supabase 环境变量。"
                  : message === "confirm-email-disabled-required"
                    ? "注册已创建，但 Supabase 仍要求邮箱确认。请在 Authentication > Providers > Email 关闭 Confirm email。"
                  : decodeURIComponent(message)}
            </p>
          ) : null}

          <form action={signInWithPassword} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-black/70">
              邮箱
              <input
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base"
                disabled={!configured}
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-black/70">
              密码
              <input
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base"
                disabled={!configured}
                minLength={6}
                name="password"
                placeholder="至少 6 位"
                required
                type="password"
              />
            </label>
            <SubmitButton>{configured ? "登录" : "等待 Supabase 配置"}</SubmitButton>
          </form>

          <form action={signUpWithPassword} className="mt-4 grid gap-4 rounded-3xl bg-black/5 p-4">
            <p className="text-sm font-semibold">快速注册</p>
            <input
              className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-base"
              disabled={!configured}
              name="email"
              placeholder="new@example.com"
              required
              type="email"
            />
            <input
              className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-base"
              disabled={!configured}
              minLength={6}
              name="password"
              placeholder="设置密码，至少 6 位"
              required
              type="password"
            />
            <SubmitButton>{configured ? "注册并进入" : "等待 Supabase 配置"}</SubmitButton>
          </form>

          {!configured ? (
            <p className="mt-6 text-xs leading-5 text-black/45">
              本地先复制 <code>.env.example</code> 为 <code>.env.local</code> 并填入 Supabase 项目参数。
            </p>
          ) : null}
        </Panel>
      </section>
    </main>
  );
}
