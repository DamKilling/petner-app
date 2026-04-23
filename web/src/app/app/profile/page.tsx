import { addPet, signOut, updateProfile } from "@/app/actions";
import { EmptyState, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getChatThreads, getCurrentUser, getOwnedPets } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { accentSoftClasses } from "@/lib/theme";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const pets = await getOwnedPets(user?.id ?? "demo");
  const chats = user ? await getChatThreads(user.id) : [];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Profile"
        title="我的 PetLife"
        description="管理当前账号资料、宠物档案和聊天入口。"
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <h2 className="text-2xl font-semibold">账号资料</h2>
          <form action={updateProfile} className="mt-6 grid gap-4">
            <Field
              defaultValue={user?.profile.display_name}
              label="昵称"
              name="display_name"
              required
            />
            <Field defaultValue={user?.profile.phone} label="手机号" name="phone" />
            <Field defaultValue={user?.profile.city} label="城市" name="city" required />
            <TextArea defaultValue={user?.profile.bio} label="简介" name="bio" required />
            <SubmitButton>保存资料</SubmitButton>
          </form>
          {isSupabaseConfigured() ? (
            <form action={signOut} className="mt-3">
              <SubmitButton variant="danger">退出登录</SubmitButton>
            </form>
          ) : null}
        </Panel>

        <Panel>
          <h2 className="text-2xl font-semibold">新增宠物档案</h2>
          <form action={addPet} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="名字" name="name" required />
              <Field defaultValue="狗狗" label="物种" name="species" required />
              <Field label="品种" name="breed" required />
              <Field label="年龄" name="age_text" placeholder="10个月" required />
              <Field defaultValue={user?.profile.city ?? "上海"} label="城市" name="city" required />
              <SelectField defaultValue="public" label="可见性" name="visibility">
                <option value="public">公开到社交广场</option>
                <option value="private">仅自己可见</option>
              </SelectField>
            </div>
            <TextArea label="简介" name="bio" required />
            <Field label="兴趣标签" name="interests" placeholder="训练 户外 握手" />
            <Field label="想找怎样的伙伴" name="looking_for" placeholder="一起散步和玩耍" />
            <SelectField defaultValue="ember" label="主题色" name="accent">
              <option value="ember">Ember</option>
              <option value="pine">Pine</option>
              <option value="sky">Sky</option>
              <option value="peach">Peach</option>
              <option value="plum">Plum</option>
              <option value="mint">Mint</option>
            </SelectField>
            <label className="flex items-center gap-2 text-sm text-black/70">
              <input defaultChecked name="vaccinated" type="checkbox" />
              已完成基础疫苗
            </label>
            <SubmitButton>保存宠物</SubmitButton>
          </form>
        </Panel>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-5 text-2xl font-semibold">我的宠物档案</h2>
          {pets.length ? (
            <div className="grid gap-3">
              {pets.map((pet) => (
                <div className="rounded-3xl border border-black/10 bg-white p-5" key={pet.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{pet.name}</h3>
                      <p className="mt-1 text-sm text-black/52">
                        {pet.species} · {pet.breed} · {pet.city}
                      </p>
                    </div>
                    <span className={accentSoftClasses[pet.accent] + " rounded-full px-3 py-1 text-xs font-semibold"}>
                      {pet.visibility === "public" ? "公开" : "私密"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-black/58">{pet.bio}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="还没有宠物档案" detail="先新增一个宠物，后续发布动态和发起聊天会关联它。" />
          )}
        </Panel>

        <Panel>
          <h2 className="mb-5 text-2xl font-semibold">聊天入口</h2>
          {chats.length ? (
            <div className="grid gap-3">
              {chats.map((thread) => (
                <a className="rounded-3xl border border-black/10 bg-white p-5 hover:bg-[#fff7ef]" href={`/app/chats/${thread.id}`} key={thread.id}>
                  <p className="font-semibold">{thread.title}</p>
                  <p className="mt-1 text-sm text-black/52">{thread.subtitle}</p>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState title="还没有聊天" detail="从社交广场的宠物档案或动态进入聊天。" />
          )}
        </Panel>
      </section>
    </div>
  );
}
