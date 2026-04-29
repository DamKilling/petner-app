import { KeyRound } from "lucide-react";
import Link from "next/link";

import { signInWithPassword, signUpWithPassword } from "@/app/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Panel, SubmitButton } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function resolveMessage(message: string | undefined, copy: ReturnType<typeof getDictionary>["login"]) {
  if (!message) {
    return null;
  }

  if (message === "check-email") {
    return copy.messages.checkEmail;
  }

  if (message === "missing-supabase") {
    return copy.messages.missingSupabase;
  }

  if (message === "confirm-email-disabled-required") {
    return copy.messages.confirmEmail;
  }

  return decodeURIComponent(message);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const locale = await getRequestLocale();
  const copy = getDictionary(locale).login;
  const params = await searchParams;
  const message = resolveMessage(params.message, copy);
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-screen bg-[radial-gradient(circle_at_20%_20%,#ffd9b9,transparent_30rem),linear-gradient(135deg,#fffaf1,#f5eadb)] px-6 py-10 lg:grid-cols-[1fr_0.8fr]">
      <section className="flex items-center">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-black/55" href="/">
              PetLife Web
            </Link>
            <LanguageSwitcher locale={locale} compact />
          </div>
          <h1 className="mt-10 text-6xl font-semibold tracking-tight md:text-8xl">{copy.title}</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-black/58">{copy.description}</p>
        </div>
      </section>

      <section className="flex items-center">
        <Panel className="w-full">
          <div className="mb-8 flex size-14 items-center justify-center rounded-3xl bg-[#f06f4f] text-white">
            <KeyRound className="size-6" />
          </div>
          <h2 className="text-2xl font-semibold">{copy.panelTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">{copy.panelDescription}</p>

          {message ? (
            <p className="mt-5 rounded-2xl bg-[#f06f4f]/10 px-4 py-3 text-sm text-[#9b321c]">
              {message}
            </p>
          ) : null}

          <form action={signInWithPassword} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-black/70">
              {copy.email}
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
              {copy.password}
              <input
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-base"
                disabled={!configured}
                minLength={6}
                name="password"
                placeholder={copy.passwordPlaceholder}
                required
                type="password"
              />
            </label>
            <SubmitButton>{configured ? copy.signIn : copy.waitingConfig}</SubmitButton>
          </form>

          <form action={signUpWithPassword} className="mt-4 grid gap-4 rounded-3xl bg-black/5 p-4">
            <p className="text-sm font-semibold">{copy.quickSignUp}</p>
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
              placeholder={copy.setPassword}
              required
              type="password"
            />
            <SubmitButton>{configured ? copy.signUp : copy.waitingConfig}</SubmitButton>
          </form>

          {!configured ? <p className="mt-6 text-xs leading-5 text-black/45">{copy.setupHint}</p> : null}
        </Panel>
      </section>
    </main>
  );
}
