import SwiftUI

struct HomeDashboardView: View {
    let appModel: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HeroBanner(userName: appModel.currentUser?.displayName ?? "朋友")
                QuickStatsRow(appModel: appModel)
                ShortcutGrid(appModel: appModel)
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
                .frame(height: 320)

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

                    Text("在 PetLife，每一只萌宠都有属于自己的数字家园。从记录成长的温情档案，到捕捉瞬间的萌宠动态，我们为你连接同频的宠友，一起分享爱宠生活的点点滴滴。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.88))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(6)

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
            DashboardStatCard(value: "\(appModel.holidayMemories.count)", label: "成长记录")
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
                PetMatchView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-social",
                    title: "去社交广场",
                    detail: "发动态、看详情、点喜欢、再进入聊天。"
                )
            }

            NavigationLink {
                PetServicesView()
            } label: {
                ShortcutCard(
                    imageName: "feature-profile",
                    title: "预约宠物服务",
                    detail: "找寄养、美容和医院预约，先看服务条件再沟通。"
                )
            }

            NavigationLink {
                AlbumTreeView(appModel: appModel)
            } label: {
                ShortcutCard(
                    imageName: "feature-tree",
                    title: "整理成长相册树",
                    detail: "把照片、视频和文字整理成宠物成长时间轴。"
                )
            }
        }
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
