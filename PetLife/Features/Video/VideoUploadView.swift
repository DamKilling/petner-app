import PhotosUI
import SwiftUI

struct VideoUploadView: View {
    let appModel: AppModel

    @State private var selectedItems: [PhotosPickerItem] = []

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

                UploadQueueCard(videos: appModel.uploadedVideos)

                VStack(alignment: .leading, spacing: 12) {
                    Text("未来能力")
                        .font(.headline)
                    Text("下一步可以接入真实上传进度、封面抽帧、AI 标签、审核状态和分享链接。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("宠物视频上传")
    }
}

private struct UploadHeader: View {
    let selectedCount: Int

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.black.opacity(0.88), PetTheme.accent, Color(red: 0.95, green: 0.58, blue: 0.25)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)

            VStack(alignment: .leading, spacing: 10) {
                Text("记录日常，也能积累社交内容")
                    .font(.system(size: 29, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("已选 \(selectedCount) 条本地视频。首版支持系统相册选择，后续可补拍摄、草稿箱和云端同步。")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.84))
            }
            .padding(24)
        }
    }
}

private struct UploadQueueCard: View {
    let videos: [UploadVideo]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("上传队列")
                .font(.title3.weight(.semibold))

            ForEach(videos) { video in
                HStack(spacing: 14) {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(statusColor(video.status).opacity(0.15))
                        .frame(width: 76, height: 76)
                        .overlay(
                            Image(systemName: "play.circle.fill")
                                .font(.system(size: 24))
                                .foregroundStyle(statusColor(video.status))
                        )

                    VStack(alignment: .leading, spacing: 6) {
                        Text(video.title)
                            .font(.headline)
                        Text(video.duration)
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(video.tags, id: \.self) { tag in
                                    Text("#\(tag)")
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Color.secondary.opacity(0.08), in: Capsule())
                                }
                            }
                        }
                    }

                    Spacer()

                    Text(video.status.rawValue)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(statusColor(video.status))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(statusColor(video.status).opacity(0.12), in: Capsule())
                }
            }
        }
        .padding(20)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func statusColor(_ status: UploadVideo.Status) -> Color {
        switch status {
        case .draft:
            return .gray
        case .uploading:
            return .orange
        case .ready:
            return .green
        }
    }
}

#Preview {
    NavigationStack {
        VideoUploadView(appModel: AppModel())
    }
}
