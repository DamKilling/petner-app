import { createServiceOffer } from "@/app/actions";
import { ButtonLink, Field, PageHeader, Panel, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { getCurrentUser, getOwnedPets } from "@/lib/data";

export default async function NewServiceOfferPage() {
  const user = await getCurrentUser();
  const pets = await getOwnedPets(user?.id ?? "demo");

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="New Service"
        title="发布我能提供的宠物服务。"
        description="把服务类型、时间、区域和信任信息说清楚，别人会先进入详情页，再决定是否联系和预约。"
        action={<ButtonLink href="/app/match?tab=services" variant="secondary">返回服务广场</ButtonLink>}
      />

      <Panel>
        <form action={createServiceOffer} className="grid gap-4">
          <Field label="服务标题" name="title" placeholder="例如：周末草地玩伴与初次陪伴" required />
          <SelectField label="关联宠物（可选）" name="related_pet_id">
            <option value="">不绑定宠物</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </SelectField>
          <Field label="服务类型" name="service_types" defaultValue="宠物陪伴 玩伴匹配" required />
          <Field label="服务区域" name="service_area" defaultValue={user?.profile.city ?? "上海"} required />
          <Field label="可约时间" name="availability_summary" placeholder="例如：周末下午 / 工作日晚间" required />
          <Field label="价格方式" name="price_mode" defaultValue="先聊后定" required />
          <TextArea label="服务介绍" name="intro" placeholder="说清适合什么宠物、见面节奏、注意事项。" required />
          <SubmitButton>发布服务并查看详情</SubmitButton>
        </form>
      </Panel>
    </div>
  );
}
