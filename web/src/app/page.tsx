import { ArrowRight, HeartHandshake, PawPrint, PlaySquare, TreePine } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#201a16] text-white">
      <section className="relative flex min-h-screen items-center px-6 py-20 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(240,111,79,0.6),transparent_24rem),radial-gradient(circle_at_82%_16%,rgba(141,215,182,0.28),transparent_26rem)]" />
        <div className="relative z-10 grid w-full gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/72">
              <PawPrint className="size-4 text-[#f6b38d]" />
              PetLife Web
            </div>
            <h1 className="text-6xl font-semibold tracking-tight md:text-8xl">
              把宠物成长、发布和关系放进同一个网页工作台。
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/66">
              这是从 SwiftUI 原型迁移来的响应式 Web App，面向多人登录、真实存储和可分享协作。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#f06f4f] px-6 text-sm font-semibold text-white hover:-translate-y-0.5"
                href="/app"
              >
                进入应用
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white/82 hover:-translate-y-0.5 hover:bg-white/10"
                href="/login"
              >
                邮箱登录
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { icon: TreePine, title: "成长树", detail: "照片、音频和故事被整理成时间线" },
              { icon: PlaySquare, title: "视频发布", detail: "真实上传视频文件并进入发布状态流" },
              { icon: HeartHandshake, title: "社交匹配", detail: "动态、评论和聊天承接宠物关系" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="rounded-[2rem] border border-white/12 bg-white/8 p-6 backdrop-blur"
                  key={item.title}
                >
                  <Icon className="mb-8 size-8 text-[#f6b38d]" />
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/58">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
