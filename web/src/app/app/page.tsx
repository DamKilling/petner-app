import { HeartHandshake, MessageCircle, PawPrint, PlaySquare, TreePine } from "lucide-react";

import { ButtonLink, PageHeader, Panel } from "@/components/ui";
import { demoProfile } from "@/lib/demo-data";
import { getCurrentUser, getDashboardData } from "@/lib/data";

const shortcuts = [
  { href: "/app/profile", title: "完善宠物档案", detail: "补全品种、城市、兴趣和疫苗信息。", icon: PawPrint },
  { href: "/app/tree", title: "整理成长记录", detail: "把照片、音频和故事挂到时间线上。", icon: TreePine },
  { href: "/app/videos", title: "发布宠物视频", detail: "上传视频文件并进入发布状态流。", icon: PlaySquare },
  { href: "/app/match", title: "进入社交广场", detail: "发布动态、评论、点赞并发起聊天。", icon: HeartHandshake },
];

export default async function AppHomePage() {
  const user = await getCurrentUser();
  const data = await getDashboardData(user?.id ?? "demo");
  const profile = user?.profile ?? demoProfile;

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Home"
        title={`欢迎回来，${profile.display_name}`}
        description="这里是 PetLife Web 的主工作台。当前版本已经把账号、宠物、成长记录、视频、动态和聊天放进同一个响应式产品壳。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-4xl font-semibold">{data.petCount}</p>
          <p className="mt-2 text-sm text-black/55">我的宠物</p>
        </Panel>
        <Panel>
          <p className="text-4xl font-semibold">{data.pendingVideoCount}</p>
          <p className="mt-2 text-sm text-black/55">待处理视频</p>
        </Panel>
        <Panel>
          <p className="text-4xl font-semibold">{data.chatCount}</p>
          <p className="mt-2 text-sm text-black/55">聊天线程</p>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Panel className="group" key={item.href}>
              <Icon className="mb-8 size-7 text-[#f06f4f]" />
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/55">{item.detail}</p>
              <div className="mt-6">
                <ButtonLink href={item.href} variant="secondary">
                  打开
                </ButtonLink>
              </div>
            </Panel>
          );
        })}
      </section>

      <Panel className="bg-[#201a16] text-white">
        <MessageCircle className="mb-6 size-7 text-[#f6b38d]" />
        <h2 className="text-2xl font-semibold">下一步可直接接入真实用户协作</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
          数据层已经从 iOS 的 AppModel/Backend 思路迁移为 Supabase Auth、RLS、Storage 和准实时消息刷新。
        </p>
      </Panel>
    </div>
  );
}
