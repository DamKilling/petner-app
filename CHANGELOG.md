# Changelog

本日志记录 PetLife 当前仓库中已经落地的主要产品与工程改动。未完成或仅规划中的内容不会写入“已完成”条目。

## 2026-04-30 - 服务广场布局稳定性修复

### 改动内容

- 修复 `/app/match?tab=services` 在中等桌面宽度下服务卡片被挤压成竖排的问题。
- 调整服务广场响应式布局：`xl` 使用“左筛选 + 主内容”两栏，`2xl` 以上恢复“左筛选 + 主列表 + 右信息栏”三栏。
- 调整服务卡内部布局，让“查看详情 / 预约”按钮在空间不足时移动到正文下方，避免挤压标题、标签和简介。
- 修复服务页向下滚动时左侧模块 sticky 导致的视觉堆叠问题。
- 调整右侧评分、平台保障、继续操作模块在两栏宽度下的位置，避免横跨并遮挡左侧栏。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 中英语言切换

### 改动内容

- 新增轻量 i18n 层，支持中文 / English 两种 UI 文案。
- 新增 `petlife-locale` cookie 作为语言偏好存储，不改变现有路由结构。
- 新增语言切换组件，切换后刷新当前路由的 Server Components 文案。
- 覆盖公共页、登录页、App 工作区导航、主要页面标题、按钮、空状态和系统提示。
- 明确边界：用户生成内容、宠物名、聊天消息、服务介绍不自动翻译。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 公共首页滚动浮现动效

### 改动内容

- 新增 `RevealOnScroll` 客户端组件，使用 `IntersectionObserver` 实现模块进入视口后的温和上浮动效。
- 在公开首页 `/` 的 Hero、核心能力入口、社区精选、服务流程、信任安全和最终 CTA 区块应用滚动浮现。
- 支持同一区块内轻微错峰显示。
- 尊重 `prefers-reduced-motion: reduce`，减少动效用户会直接看到内容。
- 调整动效节奏，让浮现速度更慢、更柔和。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-29 - 互动圣诞树移动端折叠控制

### 改动内容

- 在 `/app/tree/interactive` 增加移动端一键折叠功能。
- 展开时保留完整顶部标题栏和底部控制面板。
- 收起时顶部切换为轻量胶囊条，底部控制面板隐藏，让画布获得更多可视空间。
- 保留返回入口、当前模式、照片数量和展开按钮。
- 桌面端布局保持不变，右侧控制面板不受移动端折叠状态影响。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地访问 `http://127.0.0.1:3000/app/tree/interactive` 返回 `200`。

## 2026-04-29 - 服务板块交互闭环

### 改动内容

- 将 `/app/match?tab=services` 从静态展示升级为可交互的服务工作区。
- 新增 Supabase migration：`web/supabase/migrations/202604290001_services_bookings.sql`。
- 新增服务供给、服务需求、预约、服务评价相关表结构与 RLS 策略。
- 新增服务详情、需求详情、发布服务、发布需求、预约详情页面。
- 服务板块支持供给 / 需求切换、类型筛选、详情查看、发起联系、创建预约草稿、推进预约状态和完成后评价。
- 聊天线程支持服务上下文，避免服务联系入口进入后缺少来源信息。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地访问 `http://127.0.0.1:3000/app/match?tab=services` 返回 `200`。

### 后续注意

- 生产 Supabase 项目需要手动执行或通过 CLI 应用 migration。
- 本轮不包含支付、地图选点、复杂日历、自动撮合算法。

## 2026-04-29 - Web UI/UX 产品化重设计

### 改动内容

- 将 PetLife Web 的产品表达从功能原型集合调整为社区优先的宠物陪伴与服务平台。
- 重做 Landing、App Shell、社区 / 服务入口和产品化组件表达。
- 引入更清晰的社区、服务、宠物档案、消息、个人中心结构。
- 补充 `PetCard`、`FeedCard`、`ServiceCard`、`TrustBadge`、`ReviewHighlight`、`BookingTimeline` 等产品型组件。
- 强化信任信号、预约路径、宠物档案和移动端导航表达。

## 2026-04-29 - 互动圣诞树与成长记录

### 改动内容

- 新增 `/app/tree/interactive` 沉浸式互动圣诞树入口。
- 支持读取成长记录照片、临时上传照片、TREE / SCATTER / FOCUS 三态、背景音乐播放 / 暂停和手势入口。
- 将圣诞树视觉从单一粒子锥升级为拟真松树、灯串、星星、雪花和魔法光尘的混合效果。
- 修复照片过曝 / 过暗问题，降低 Bloom 对照片材质的影响。
- 增加移动端适配和控制面板折叠能力。

## 2026-04-29 - Supabase 自动保活机制

### 改动内容

- 新增 GitHub Actions 工作流 `.github/workflows/supabase-heartbeat.yml`。
- 新增说明文档 `docs/supabase-heartbeat.md`。
- 工作流会定期访问 Supabase REST API：`GET $SUPABASE_URL/rest/v1/heartbeat?select=id&limit=1`。
- 支持 `workflow_dispatch` 手动触发，并计划每周一、周四 UTC 02:00 自动运行。

### 安全与配置

- `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 通过 GitHub Repository Secrets 管理。
- 未将真实 Supabase key 写入仓库。
- 未使用 `service_role` key，避免扩大权限风险。

## 2026-04-09 - iOS 原型主流程修复

- 修复退出登录后 session 未清空的问题，避免一个用户的本地宠物、动态、视频、记忆和聊天状态泄漏到另一个 session。
- 将聊天线程复用逻辑从标题模糊匹配改为基于稳定宠物 ID。
- 为动态和聊天线程补充稳定的 `relatedPetID` 关联字段。
- 修复社交 feed context menu 的“进入详情”动作，使其进入已有动态详情页。
- 保持改动聚焦于正确性和导航修复，没有扩展产品范围。
