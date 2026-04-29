import { createServiceRequest } from "@/app/actions";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getOwnedPets } from "@/lib/data";

export default async function NewServiceRequestPage() {
  const user = await getCurrentUser();
  const pets = await getOwnedPets(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="New Request"
        title="发布我的陪伴或服务需求。"
        description="需求可以绑定宠物，也可以不绑定宠物。先把时间、城市和预算说清楚，再让合适的人联系你。"
        action={<ButtonLink href="/app/match?tab=services&surface=requests" variant="secondary">返回需求广场</ButtonLink>}
      />

      <Panel>
        <form action={createServiceRequest} className="grid gap-4">
          <Field label="需求标题" name="title" placeholder="例如：想找周末一起遛宠的同城家庭" required />
          <SelectField label="关联宠物（可选）" name="related_pet_id">
            <option value="">不绑定宠物</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="需求类型" name="request_type" defaultValue="宠物陪伴">
            <option value="宠物陪伴">宠物陪伴</option>
            <option value="玩伴匹配">玩伴匹配</option>
            <option value="临时照看">临时照看</option>
            <option value="附近活动">附近活动</option>
          </SelectField>
          <Field label="城市" name="city" defaultValue={user?.profile.city ?? "上海"} required />
          <Field label="期望时间" name="preferred_time_summary" placeholder="例如：周末下午 / 工作日晚间" required />
          <Field label="预算或方式" name="budget_summary" defaultValue="先聊后定" required />
          <TextArea label="需求详情" name="detail" placeholder="说清你的宠物状态、希望对方具备什么条件、是否需要先视频沟通。" required />
          <SubmitButton>发布需求并查看详情</SubmitButton>
        </form>
      </Panel>
    </div>
  );
}
