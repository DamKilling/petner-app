# Changelog

本日志记录 PetLife 仓库中已经落地的主要产品、工程、文档与体验改动。未完成或仅处于规划阶段的内容不会写入“已完成”条目。

## 2026-04-30 - 互动成长树英文界面补齐

### 改动内容

- 修复切换 English 后进入 `/app/tree/interactive` 仍显示中文的问题。
- 为互动成长树补齐中英文 UI 文案，包括标题、模式、照片数量、控制按钮、状态提示、手势说明、空状态和错误提示。
- 互动树页面读取当前 `petlife-locale` cookie，并把对应字典传入客户端 WebGL 组件。
- 保持用户上传图片、成长记录内容、宠物名等用户生成内容不做自动翻译。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 宠物档案表单布局与字段修复

### 改动内容

- 修复个人中心右侧新增宠物表单中输入框横向溢出、遮挡右侧容器的问题。
- 调整共享 `Field`、`TextArea`、`SelectField` 组件，使表单控件在双栏布局中保持 `w-full` 和 `min-w-0`。
- 为宠物档案新增性别字段，支持在新增宠物时填写性别信息。
- 保持现有宠物创建流程、Supabase 写入逻辑和个人中心页面结构不变。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 社交 / 服务 / 成长树编辑与删除

### 改动内容

- 为成长记忆新增编辑页 `/app/tree/[memoryId]/edit`，支持修改文字字段、替换照片和音频。
- 为社交动态新增编辑页 `/app/match/posts/[postId]/edit`，支持作者修改或删除自己的动态。
- 为服务供给新增编辑页 `/app/match/services/[offerId]/edit`，支持提供者修改服务内容。
- 为服务需求新增编辑页 `/app/match/requests/[requestId]/edit`，支持发布者修改需求内容。
- 新增 `updateMemory`、`deleteMemory`、`updatePost`、`deletePost`、`updateServiceOffer`、`deleteServiceOffer`、`updateServiceRequest`、`deleteServiceRequest` 等 Server Actions。
- 详情页仅对记录创建者显示“编辑”和“删除 / 停止展示 / 关闭需求”入口。
- 成长记忆删除或替换媒体时同步清理 Supabase Storage 中旧图片或音频。
- 服务记录若已有预约历史，不直接破坏历史上下文，而是改为暂停或关闭状态。
- 新增 Supabase migration：`web/supabase/migrations/202604300002_edit_delete_policies.sql`，补充编辑删除相关 RLS 策略。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 品牌图标与标签页图标

### 改动内容

- 新增品牌猫咪图标资源：`web/public/brand/petlife-cat-icon.jpg`。
- 将 App Shell 和 Marketing Shell 中的品牌图标替换为新的猫咪图片。
- 更新 Next.js metadata 图标配置，让浏览器标签页 favicon 使用新的品牌图标。
- 保持导航结构、页面功能和登录保护逻辑不变。

## 2026-04-30 - 消息与提醒真实闭环

### 改动内容

- 新增 Supabase migration：`web/supabase/migrations/202604300001_notifications.sql`。
- 新增 `notifications` 表，用于持久化聊天、预约、服务和社区互动提醒。
- 新增真实通知读取、未读数统计、单条已读、全部已读和点击通知跳转逻辑。
- 发送聊天消息、创建服务聊天、推进预约状态、评论他人动态时，会为对方创建对应类型通知。
- `/app/chats` 从派生提醒升级为消息与提醒中心，支持会话 / 提醒 Tab 和通知类型筛选。
- App Shell 与概览页未读提醒改为读取真实通知数据。
- 聊天详情移动端输入框优化为底部吸附，减少键盘或输入栏遮挡。
- 补齐通知中心相关中英文 UI 文案。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - Tree / Messages / Me 语言切换补齐

### 改动内容

- 修复 `/app/tree`、`/app/chats`、`/app/profile` 中部分模块切换 English 后仍显示中文的问题。
- 为成长记录、记忆表单、消息中心、聊天详情、个人中心、资料表单、宠物表单补齐中英文系统文案。
- `MemoryComposerForm`、`SetupNotice` 等局部组件接入 i18n 字典。
- 保持用户生成内容不翻译，例如记忆标题、聊天消息、宠物名、服务介绍。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。

## 2026-04-30 - 项目文档刷新

### 改动内容

- 更新根目录 `README.md`，同步当前项目定位、运行方式、核心模块和部署注意事项。
- 更新 `web/README.md`，补充 Web 版 PetLife 的 Next.js、Supabase、Vercel 相关说明。
- 新增或更新 `docs/technical-documentation-outline.md`，作为技术文档与答辩材料骨架。
- 更新 `CHANGELOG.md`，把此前完成的 Web 迁移、服务闭环、互动成长树等阶段性成果记录进仓库。

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
- 后续对服务广场做了布局打磨，使供给列表、需求广场、筛选和右侧信任区更适合桌面与移动端浏览。

### 验证结果

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地访问 `http://127.0.0.1:3000/app/match?tab=services` 返回 `200`。

### 后续注意

- 生产 Supabase 项目需要手动执行或通过 CLI 应用 migration。
- 本轮不包含支付、地图选点、复杂日历、自动撮合算法。

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

## 2026-04-23 - Web UI/UX 产品化重设计

### 改动内容

- 将 PetLife Web 的产品表达从功能原型集合调整为社区优先的宠物陪伴与服务平台。
- 重做 Landing、App Shell、社区 / 服务入口和产品化组件表达。
- 引入更清晰的社区、服务、宠物档案、消息、个人中心结构。
- 补充 `PetCard`、`FeedCard`、`ServiceCard`、`TrustBadge`、`ReviewHighlight`、`BookingTimeline` 等产品型组件。
- 强化信任信号、预约路径、宠物档案和移动端导航表达。
- 新增公开页面 `/community`、`/services`、`/safety`，用于表达社区活跃度、服务能力和平台安全。

## 2026-04-23 - Web 版 PetLife 初始落地

### 改动内容

- 在仓库根目录新增 `web/`，使用 Next.js App Router、TypeScript、Tailwind、ESLint 和 `src/` 目录结构。
- 新增 Supabase 客户端、服务端客户端、Auth callback、登录页和受保护 App 工作区。
- 新增 Web 端主要路由：`/`、`/login`、`/app`、`/app/tree`、`/app/videos`、`/app/match`、`/app/profile`、`/app/chats`。
- 新增 Supabase schema migration：`web/supabase/migrations/202604230001_petlife_web_schema.sql`。
- 用 Supabase Auth、Postgres、Storage、Realtime 作为 Web 版可多人使用的基础能力。
- 补齐 demo 数据、类型定义、共享 UI、媒体展示组件和 Realtime refresh 组件。

## 2026-04-23 - 互动圣诞树与成长记录增强

### 改动内容

- 新增 `/app/tree/interactive` 沉浸式互动圣诞树入口。
- 支持读取成长记录照片、临时上传照片、TREE / SCATTER / FOCUS 三态、背景音乐播放 / 暂停和手势入口。
- 新增本地 MediaPipe 手势识别模型：`web/public/vendor/mediapipe/gesture_recognizer.task`。
- 新增 MediaPipe WASM runtime 资源，支持默认、module 和 fallback runtime。
- 新增温馨背景音乐资源：`web/public/audio/warm-petlife-bgm.wav`。
- 将圣诞树视觉从单一粒子锥升级为拟真松树、灯串、星星、雪花和魔法光尘的混合效果。
- 修复照片过曝 / 过暗问题，降低 Bloom 对照片材质的影响。
- 优化成长记录媒体上传和互动树移动端性能。
- 修复成长树从概览和侧边栏进入的导航路径。

## 2026-04-19 - iOS 原型资源与项目同步

### 改动内容

- 同步 `petner-app` 项目文件和 Xcode 配置。
- 新增 iOS 原型所需图片资源，包括首页、登录、个人中心、社交、成长树、视频等 hero 和 tab 图标资源。
- 新增 `PetArtwork.swift` 和资源生成脚本 `tools/generate_petlife_assets.swift`。
- 更新 `PetLife.entitlements` 与项目配置，使 iOS 原型资源结构更完整。

## 2026-04-09 - iOS 原型主流程修复

### 改动内容

- 修复退出登录后 session 未清空的问题，避免一个用户的本地宠物、动态、视频、记忆和聊天状态泄漏到另一个 session。
- 将聊天线程复用逻辑从标题模糊匹配改为基于稳定宠物 ID。
- 为动态和聊天线程补充稳定的 `relatedPetID` 关联字段。
- 修复社交 feed context menu 的“进入详情”动作，使其进入已有动态详情页。
- 同步 Xcode 改回来的有效源码差异，将 `ActivePostRoute` 补成 `Identifiable, Hashable`。
- 保持改动聚焦于正确性和导航修复，没有扩展产品范围。

## 2026-04-02 - iOS 原型骨架与本地状态层

### 改动内容

- 创建 SwiftUI iOS 原型骨架，包含 `PetLifeApp`、`RootTabView` 和基础主题。
- 新增首页、成长记录 / 圣诞树相册、视频发布、宠物相亲角等主要页面。
- 新增 `Models.swift`，定义宠物、记忆、视频、动态、聊天等原型领域模型。
- 扩展原型主流程，补充登录、个人中心、聊天入口和更真实的本地交互。
- 新增 `AppState.swift`，把核心状态集中到 `AppModel` 与 `InMemoryPetBackend`。
- 更新 README，记录当时的 iOS 原型运行与项目结构说明。
