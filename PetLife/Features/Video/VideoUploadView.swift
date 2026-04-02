import PhotosUI
import SwiftUI

struct VideoUploadView: View {
    let appModel: AppModel

    @State private var selectedItems: [PhotosPickerItem] = []
    @State private var draft = VideoDraft()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                UploadHeader(selectedCount: selectedItems.count)

                PhotosPicker(
                    selection: $selectedItems,
                    maxSelectionCount: 6,
                    matching: .videos
                ) {
                    Label("选择宠物视频", systemImage: "video.badge.plus")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(PetTheme.accent, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .foregroundStyle(.white)
                }

                VideoComposerCard(
                    draft: $draft,
                    isBusy: appModel.isBusy,
                    selectedCount: selectedItems.count,
                    publishAction: handleCreateVideo
                )

                VideoSection(title: "上传队列", videos: appModel.pendingVideos)
                VideoSection(title: "已进入审核/发布", videos: appModel.publishedVideos)
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("宠物视频上传")
    }

    private func handleCreateVideo() {
        let draftToSave = draft
        let selectedCount = selectedItems.count

        Task {
            await appModel.createVideo(draftToSave, selectedAssetCount: selectedCount)
            draft = VideoDraft()
            selectedItems = []
        }
    }
}

private struct UploadHeader: View {
    let selectedCount: Int

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.black.opacity(0.88), PetTheme.accent, AccentToken.peach.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)

            VStack(alignment: .leading, spacing: 10) {
                Text("把日常内容变成可发布资产")
                    .font(.system(size: 29, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("已选 \(selectedCount) 条本地视频。现在页面已经有标题、文案、标签和状态流转，后面可直接接对象存储与审核服务。")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.84))
            }
            .padding(24)
        }
    }
}

private struct VideoComposerCard: View {
    @Binding var draft: VideoDraft
    let isBusy: Bool
    let selectedCount: Int
    let publishAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("发布流程")
                .font(.title3.weight(.semibold))

            TextField("视频标题", text: $draft.title)
                .textFieldStyle(.roundedBorder)
            TextField("视频描述", text: $draft.caption, axis: .vertical)
                .textFieldStyle(.roundedBorder)
            TextField("标签，空格分隔", text: $draft.tagsText)
                .textFieldStyle(.roundedBorder)

            HStack {
                Text("当前会按 \(selectedCount) 个素材进入状态机")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Spacer()
                Button(action: publishAction) {
                    HStack {
                        if isBusy {
                            ProgressView()
                                .tint(.white)
                        }
                        Text("加入上传队列")
                            .fontWeight(.semibold)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                }
                .buttonStyle(.borderedProminent)
                .tint(PetTheme.accent)
                .disabled(draft.title.isEmpty || isBusy)
            }
        }
        .padding(20)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct VideoSection: View {
    let title: String
    let videos: [UploadVideo]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.title3.weight(.semibold))

            if videos.isEmpty {
                Text("这里还没有内容。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }

            ForEach(videos) { video in
                NavigationLink {
                    VideoDetailView(video: video)
                } label: {
                    HStack(spacing: 14) {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(video.accent.color.opacity(0.15))
                            .frame(width: 76, height: 76)
                            .overlay(
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(video.accent.color)
                            )

                        VStack(alignment: .leading, spacing: 6) {
                            Text(video.title)
                                .font(.headline)
                                .foregroundStyle(PetTheme.ink)
                            Text("\(video.duration) · \(video.publishDateText)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(video.caption)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .lineLimit(2)
                        }

                        Spacer()

                        Text(video.status.rawValue)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(video.accent.color)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 8)
                            .background(video.accent.color.opacity(0.12), in: Capsule())
                    }
                    .padding(18)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                }
            }
        }
    }
}

private struct VideoDetailView: View {
    let video: UploadVideo

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                RoundedRectangle(cornerRadius: 32, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [video.accent.color, video.accent.color.opacity(0.45)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 250)
                    .overlay(
                        Image(systemName: "play.rectangle.fill")
                            .font(.system(size: 52))
                            .foregroundStyle(.white.opacity(0.9))
                    )

                Text(video.title)
                    .font(.largeTitle.weight(.bold))
                Text(video.caption)
                    .font(.body)
                    .foregroundStyle(.secondary)

                HStack(spacing: 8) {
                    ForEach(video.tags, id: \.self) { tag in
                        Text("#\(tag)")
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(video.accent.color.opacity(0.12), in: Capsule())
                    }
                }
            }
            .padding(20)
        }
        .navigationTitle("视频详情")
    }
}

#Preview {
    NavigationStack {
        VideoUploadView(appModel: AppModel())
    }
}
