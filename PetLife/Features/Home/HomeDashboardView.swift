import SwiftUI

struct HomeDashboardView: View {
    let appModel: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HeroBanner()
                QuickStatsRow(appModel: appModel)

                SectionCard(
                    title: "产品主线",
                    subtitle: "围绕宠物从成长记录到社交连接的一体化体验。"
                ) {
                    VStack(spacing: 12) {
                        CapabilityRow(
                            icon: "tree.fill",
                            title: "圣诞树相册集",
                            detail: "用树形时间轴承载照片、视频和节日记忆。"
                        )
                        CapabilityRow(
                            icon: "video.badge.plus",
                            title: "视频上传",
                            detail: "支持本地选择、标签管理、发布状态追踪。"
                        )
                        CapabilityRow(
                            icon: "person.2.circle.fill",
                            title: "宠物相亲角",
                            detail: "结合匹配卡片与社区动态，打造社交场景。"
                        )
                    }
                }

                SectionCard(
                    title: "下一步研发建议",
                    subtitle: "这个原型已适合继续接后端与真实媒体能力。"
                ) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("1. 接入登录、用户档案、宠物档案。")
                        Text("2. 接入视频上传存储与内容审核。")
                        Text("3. 接入动态流、聊天、匹配推荐算法。")
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
            }
            .padding(20)
        }
        .background(PetTheme.cream.opacity(0.55))
        .navigationTitle("PetLife")
    }
}

private struct HeroBanner: View {
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(PetTheme.dashboardGradient)
                .frame(height: 240)

            VStack(alignment: .leading, spacing: 14) {
                Text("宠物从生到老的一体化陪伴")
                    .font(.system(size: 31, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("记录成长、分享视频、连接同城伙伴，把相册与社交合成一个有温度的苹果 App。")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.88))

                HStack(spacing: 12) {
                    TagPill(label: "iOS SwiftUI")
                    TagPill(label: "社交 + 内容")
                    TagPill(label: "宠物生命周期")
                }
            }
            .padding(24)
        }
    }
}

private struct QuickStatsRow: View {
    let appModel: AppModel

    var body: some View {
        HStack(spacing: 12) {
            DashboardStatCard(value: "\(appModel.holidayMemories.count)", label: "树上记忆")
            DashboardStatCard(value: "\(appModel.uploadedVideos.count)", label: "视频草稿")
            DashboardStatCard(value: "\(appModel.featuredPets.count)", label: "匹配档案")
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
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct SectionCard<Content: View>: View {
    let title: String
    let subtitle: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.title3.weight(.semibold))
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            content
        }
        .padding(20)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct CapabilityRow: View {
    let icon: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(PetTheme.accent)
                .frame(width: 34, height: 34)
                .background(PetTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

private struct TagPill: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white)
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
