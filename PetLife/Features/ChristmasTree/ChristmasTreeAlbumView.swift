import SwiftUI

struct ChristmasTreeAlbumView: View {
    let appModel: AppModel

    @State private var isShowingMemorySheet = false
    @State private var memoryDraft = MemoryDraft()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                TreeHeroHeader()

                ForEach(Array(appModel.holidayMemories.enumerated()), id: \.element.id) { index, memory in
                    NavigationLink {
                        MemoryDetailView(memory: memory)
                    } label: {
                        OrnamentMemoryCard(
                            memory: memory,
                            showsStem: index < appModel.holidayMemories.count - 1
                        )
                    }
                }
            }
            .padding(20)
        }
        .background(
            LinearGradient(
                colors: [PetTheme.cream, .white, PetTheme.cream.opacity(0.7)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .navigationTitle("圣诞树相册集")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("新增记忆") {
                    isShowingMemorySheet = true
                }
            }
        }
        .sheet(isPresented: $isShowingMemorySheet) {
            AddMemorySheet(
                draft: $memoryDraft,
                isBusy: appModel.isBusy,
                saveAction: handleAddMemory
            )
        }
    }

    private func handleAddMemory() {
        let draftToSave = memoryDraft
        Task {
            await appModel.addMemory(draftToSave)
            memoryDraft = MemoryDraft()
            isShowingMemorySheet = false
        }
    }
}

private struct TreeHeroHeader: View {
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [AccentToken.pine.color, Color(red: 0.08, green: 0.20, blue: 0.14)],
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

                Text("现在已经支持里程碑详情和新增记忆，后面只要把图片、音频和云端存储接上，这个模块就能真正跑起来。")
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
    let showsStem: Bool

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(spacing: 0) {
                Circle()
                    .fill(memory.accent.color)
                    .frame(width: 18, height: 18)
                    .overlay(
                        Image(systemName: memory.ornament)
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                    )

                if showsStem {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(memory.accent.color.opacity(0.35))
                        .frame(width: 4, height: 84)
                        .padding(.top, 4)
                }
            }

            VStack(alignment: .leading, spacing: 10) {
                Text(memory.dateText)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(memory.accent.color)

                Text(memory.title)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)

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
                    .stroke(memory.accent.color.opacity(0.15), lineWidth: 1)
            )
        }
    }
}

private struct MemoryDetailView: View {
    let memory: HolidayMemory

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                RoundedRectangle(cornerRadius: 32, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [memory.accent.color, memory.accent.color.opacity(0.55)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 240)
                    .overlay(
                        Image(systemName: memory.ornament)
                            .font(.system(size: 52))
                            .foregroundStyle(.white.opacity(0.9))
                    )

                Text(memory.title)
                    .font(.largeTitle.weight(.bold))
                Text(memory.dateText)
                    .font(.headline)
                    .foregroundStyle(memory.accent.color)
                Text(memory.story)
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
            .padding(20)
        }
        .navigationTitle("记忆详情")
    }
}

private struct AddMemorySheet: View {
    @Binding var draft: MemoryDraft
    let isBusy: Bool
    let saveAction: () -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("基础信息") {
                    TextField("标题", text: $draft.title)
                    TextField("副标题", text: $draft.subtitle)
                    TextField("日期", text: $draft.dateText)
                }

                Section("故事内容") {
                    TextField("完整故事", text: $draft.story, axis: .vertical)
                }
            }
            .navigationTitle("新增相册记忆")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存", action: saveAction)
                        .disabled(draft.title.isEmpty || draft.story.isEmpty || isBusy)
                }
            }
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
        ChristmasTreeAlbumView(appModel: AppModel())
    }
}
