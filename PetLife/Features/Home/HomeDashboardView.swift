import SwiftUI

struct HomeDashboardView: View {
    let appModel: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HeroBanner(userName: appModel.currentUser?.displayName ?? "朋友")
                QuickStatsRow(appModel: appModel)
                ShortcutGrid(appModel: appModel)
                RoadmapCard()
            }
            .padding(20)
        }
        .background(PetTheme.cream.opacity(0.55))
        .navigationTitle("PetLife")
    }
}

private struct HeroBanner: View {
    let userName: String

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(PetTheme.dashboardGradient)
                .frame(height: 286)

            PetHeroArtwork(name: "hero-home", width: 154)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 222) {
                    Text("欢迎回来，\(userName)")
                        .font(.system(size: 31, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.85)

                    Text("现在我们已经有账号、宠物档案、视频队列、动态流和聊天入口，可以继续往真实产品落地。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.88))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)

                    HStack(spacing: 12) {
                        TagPill(label: "登录可用")
                        TagPill(label: "内容可发")
                        TagPill(label: "社交可聊")
                    }
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct QuickStatsRow: View {
    let appModel: AppModel

    var body: some View {
        HStack(spacing: 12) {
            DashboardStatCard(value: "\(appModel.ownedPets.count)", label: "我的宠物")
            DashboardStatCard(value: "\(appModel.pendingVideos.count)", label: "待处理视频")
            DashboardStatCard(value: "\(appModel.chatThreads.count)", label: "聊天线程")
        }
    }
}

private struct ShortcutGrid: View {
    let appModel: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("快捷入口")
                .font(.title3.weight(.semibold))

            NavigationLink {
                ProfileHubView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-profile",
                    title: "完善宠物档案",
                    detail: "补全关系偏好、城市、兴趣和疫苗信息。"
                )
            }

            NavigationLink {
                VideoUploadView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-video",
                    title: "继续发布视频",
                    detail: "从本地相册选视频，进入上传或审核状态。"
                )
            }

            NavigationLink {
                PetMatchView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-social",
                    title: "去社交广场",
                    detail: "发动态、看详情、点喜欢、再进入聊天。"
                )
            }

            NavigationLink {
                ChristmasTreeAlbumView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-tree",
                    title: "整理成长相册树",
                    detail: "把照片故事和里程碑做成可分享的树形时间线。"
                )
            }
        }
    }
}

private struct RoadmapCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("下一步接真实后端")
                .font(.title3.weight(.semibold))

            Text("当前代码已经把产品状态集中到 `AppModel + backend actor`。后续可替换成 Firebase Auth、Supabase Storage、动态表和消息表，而不需要重写整个 UI。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(20)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct DashboardStatCard: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
            Text(label)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct ShortcutCard: View {
    let imageName: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            PetFeatureIcon(name: imageName, size: 44)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(2)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct TagPill: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.85)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.white.opacity(0.16), in: Capsule())
    }
}

#Preview {
    NavigationStack {
        HomeDashboardView(appModel: AppModel())
    }
}
