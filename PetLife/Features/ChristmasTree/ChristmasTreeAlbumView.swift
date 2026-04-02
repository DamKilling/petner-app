import SwiftUI

struct ChristmasTreeAlbumView: View {
    let memories: [HolidayMemory]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                TreeHeroHeader()

                ForEach(Array(memories.enumerated()), id: \.element.id) { index, memory in
                    OrnamentMemoryCard(memory: memory, level: index, showsStem: index < memories.count - 1)
                }
            }
            .padding(20)
        }
        .background(
            LinearGradient(
                colors: [PetTheme.cream, Color.white, PetTheme.cream.opacity(0.7)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .navigationTitle("圣诞树相册集")
    }
}

private struct TreeHeroHeader: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.12, green: 0.38, blue: 0.25),
                            Color(red: 0.08, green: 0.20, blue: 0.14)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 280)

            VStack(spacing: 18) {
                Image(systemName: "tree.circle.fill")
                    .font(.system(size: 58))
                    .foregroundStyle(PetTheme.gold)

                Text("把宠物的重要时刻挂上树")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("参考节日树形叙事，把照片、短视频、语音祝福和时间节点组合成可分享的成长圣诞树。")
                    .font(.subheadline)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white.opacity(0.86))
                    .padding(.horizontal, 24)
            }
        }
    }
}

private struct OrnamentMemoryCard: View {
    let memory: HolidayMemory
    let level: Int
    let showsStem: Bool

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(spacing: 0) {
                Circle()
                    .fill(memory.color)
                    .frame(width: 18, height: 18)
                    .overlay(
                        Image(systemName: memory.ornament)
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                    )

                if showsStem {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(memory.color.opacity(0.35))
                        .frame(width: 4, height: 84)
                        .padding(.top, 4)
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(memory.dateText)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(memory.color)

                Text(memory.title)
                    .font(.title3.weight(.semibold))

                Text(memory.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                HStack(spacing: 10) {
                    MiniBadge(label: "照片故事")
                    MiniBadge(label: "视频剪影")
                    MiniBadge(label: "成长节点")
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(memory.color.opacity(0.15), lineWidth: 1)
            )
        }
    }
}

private struct MiniBadge: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(PetTheme.pine.opacity(0.08), in: Capsule())
    }
}

#Preview {
    NavigationStack {
        ChristmasTreeAlbumView(memories: AppModel().holidayMemories)
    }
}
