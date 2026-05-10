import AVFoundation
import AVKit
import PhotosUI
import SwiftUI
import UniformTypeIdentifiers
import UIKit

struct AlbumTreeView: View {
    let appModel: AppModel

    @State private var isShowingMemorySheet = false
    @State private var memoryDraft = MemoryDraft()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                TreeHeroHeader(addAction: {
                    isShowingMemorySheet = true
                })

                if appModel.holidayMemories.isEmpty {
                    EmptyTimelineCard(addAction: {
                        isShowingMemorySheet = true
                    })
                } else {
                    ForEach(Array(appModel.holidayMemories.enumerated()), id: \.element.id) { index, memory in
                        NavigationLink {
                            MemoryDetailView(appModel: appModel, memoryID: memory.id)
                        } label: {
                            TimelineMemoryCard(
                                memory: memory,
                                showsStem: index < appModel.holidayMemories.count - 1
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(20)
        }
        .background(
            LinearGradient(
                colors: [PetTheme.cream.opacity(0.85), .white, PetTheme.cream.opacity(0.55)],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .navigationTitle("相册树")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("新增记录") {
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
    let addAction: () -> Void

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [AccentToken.pine.color, AccentToken.sky.color.opacity(0.72), AccentToken.peach.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 310)

            PetHeroArtwork(name: "hero-tree", width: 150)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 236) {
                    PetFeatureIcon(name: "feature-tree", size: 48)

                    Text("记录每一次长大")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.84)

                    Text("用照片、视频和文字，把爱宠的成长历程整理成一条清晰的时间轴。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.86))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)

                    Button(action: addAction) {
                        Label("新增记录", systemImage: "plus")
                            .font(.caption.weight(.semibold))
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.white)
                    .foregroundStyle(PetTheme.pine)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct EmptyTimelineCard: View {
    let addAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("还没有成长记录")
                .font(.headline)
                .foregroundStyle(PetTheme.ink)
            Text("发布第一张照片或第一段视频后，它会出现在这里。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Button("新增记录", action: addAction)
                .buttonStyle(.borderedProminent)
                .tint(PetTheme.pine)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct TimelineMemoryCard: View {
    let memory: HolidayMemory
    let showsStem: Bool

    private var badges: [String] {
        [
            memory.mediaKind.rawValue,
            "\(memory.notes.count) 条补充",
            "成长节点"
        ]
    }

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(spacing: 0) {
                Circle()
                    .fill(memory.accent.color)
                    .frame(width: 18, height: 18)
                    .overlay(
                        Image(systemName: memory.mediaKind == .video ? "play.fill" : "camera.fill")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                    )

                if showsStem {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(memory.accent.color.opacity(0.35))
                        .frame(width: 4, height: 98)
                        .padding(.top, 4)
                }
            }

            HStack(alignment: .top, spacing: 14) {
                MemoryMediaPreview(memory: memory, height: 96)
                    .frame(width: 104)

                VStack(alignment: .leading, spacing: 10) {
                    Text(memory.dateText)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(memory.accent.color)

                    Text(memory.title)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(PetTheme.ink)
                        .lineLimit(2)

                    Text(memory.subtitle.isEmpty ? memory.story : memory.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(2)

                    HStack(spacing: 8) {
                        ForEach(badges, id: \.self) { badge in
                            MiniBadge(label: badge)
                        }
                    }
                }

                Spacer(minLength: 0)
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
    let appModel: AppModel
    let memoryID: UUID

    @State private var noteText = ""

    private var memory: HolidayMemory? {
        appModel.memory(for: memoryID)
    }

    var body: some View {
        ScrollView {
            if let memory {
                VStack(alignment: .leading, spacing: 18) {
                    MemoryMediaPreview(memory: memory, height: 320)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(memory.title)
                            .font(.largeTitle.weight(.bold))
                        Text(memory.dateText)
                            .font(.headline)
                            .foregroundStyle(memory.accent.color)
                        Text(memory.story)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("记录文字")
                            .font(.title3.weight(.semibold))

                        ForEach(memory.notes) { note in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(note.body)
                                    .font(.subheadline)
                                    .foregroundStyle(PetTheme.ink)
                                    .fixedSize(horizontal: false, vertical: true)
                                Text(note.createdAtText)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        }

                        TextField("继续补充这段成长故事", text: $noteText, axis: .vertical)
                            .textFieldStyle(.roundedBorder)

                        Button("新增文字记录", action: handleAddNote)
                            .buttonStyle(.borderedProminent)
                            .tint(PetTheme.pine)
                            .disabled(noteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
                .padding(20)
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("成长详情")
    }

    private func handleAddNote() {
        let text = noteText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else {
            return
        }

        appModel.addMemoryNote(memoryID: memoryID, text: text)
        noteText = ""
    }
}

private struct AddMemorySheet: View {
    @Binding var draft: MemoryDraft
    let isBusy: Bool
    let saveAction: () -> Void

    @State private var selectedMediaItem: PhotosPickerItem?
    @State private var isImportingMedia = false
    @State private var importErrorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("基础信息") {
                    TextField("标题", text: $draft.title)
                    TextField("简短说明", text: $draft.subtitle)
                    TextField("日期", text: $draft.dateText)
                }

                Section("记录内容") {
                    TextField("写下这次成长故事", text: $draft.story, axis: .vertical)
                }

                Section("照片或视频") {
                    Picker("内容形式", selection: $draft.mediaKind) {
                        ForEach(PostMediaKind.allCases, id: \.self) { kind in
                            Text(kind.rawValue).tag(kind)
                        }
                    }
                    .pickerStyle(.segmented)

                    PhotosPicker(
                        selection: $selectedMediaItem,
                        matching: draft.mediaKind == .image ? .images : .videos
                    ) {
                        Label(
                            draft.mediaAssetPath == nil ? "选择\(draft.mediaKind.rawValue)" : "更换\(draft.mediaKind.rawValue)",
                            systemImage: draft.mediaKind == .video ? "video" : "photo"
                        )
                    }

                    if draft.mediaAssetPath != nil {
                        MemoryMediaPreview(memory: previewMemory, height: 180)
                            .padding(.vertical, 4)

                        Button("移除媒体", role: .destructive) {
                            draft.mediaAssetPath = nil
                            draft.mediaDisplayName = nil
                            draft.photoAssetPath = nil
                            selectedMediaItem = nil
                        }
                    }
                }

                if let importErrorMessage {
                    Section("导入提示") {
                        Text(importErrorMessage)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("新增成长记录")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存", action: saveAction)
                        .disabled(
                            draft.title.isEmpty ||
                            draft.story.isEmpty ||
                            draft.mediaAssetPath == nil ||
                            isBusy ||
                            isImportingMedia
                        )
                }
            }
            .task(id: selectedMediaItem) {
                await importSelectedMedia()
            }
            .onChange(of: draft.mediaKind) {
                draft.mediaAssetPath = nil
                draft.mediaDisplayName = nil
                draft.photoAssetPath = nil
                selectedMediaItem = nil
            }
        }
    }

    private var previewMemory: HolidayMemory {
        HolidayMemory(
            id: UUID(),
            title: draft.title,
            subtitle: draft.subtitle,
            dateText: draft.dateText,
            ornament: draft.ornament,
            accent: draft.accent,
            story: draft.story,
            mediaKind: draft.mediaKind,
            mediaAssetPath: draft.mediaAssetPath,
            mediaDisplayName: draft.mediaDisplayName,
            notes: [],
            photoAssetPath: draft.photoAssetPath,
            audioAssetPath: nil,
            audioDisplayName: nil
        )
    }

    private func importSelectedMedia() async {
        guard let selectedMediaItem else {
            return
        }

        isImportingMedia = true
        defer { isImportingMedia = false }

        do {
            guard let data = try await selectedMediaItem.loadTransferable(type: Data.self) else {
                importErrorMessage = "\(draft.mediaKind.rawValue)读取失败，请重新选择。"
                return
            }

            let ext = selectedMediaItem.supportedContentTypes.first?.preferredFilenameExtension ?? (draft.mediaKind == .video ? "mov" : "jpg")
            let relativePath = try MemoryAssetStore.saveBinaryData(data, preferredExtension: ext)
            draft.mediaAssetPath = relativePath
            draft.mediaDisplayName = selectedMediaItem.itemIdentifier ?? "\(draft.mediaKind.rawValue).\(ext)"
            draft.photoAssetPath = draft.mediaKind == .image ? relativePath : nil
            importErrorMessage = nil
        } catch {
            importErrorMessage = "\(draft.mediaKind.rawValue)导入失败：\(error.localizedDescription)"
        }
    }
}

private struct MemoryMediaPreview: View {
    let memory: HolidayMemory
    var height: CGFloat

    private var relativePath: String? {
        memory.mediaAssetPath ?? memory.photoAssetPath
    }

    var body: some View {
        Group {
            if let relativePath, let fileURL = MemoryAssetStore.url(for: relativePath) {
                switch memory.mediaKind {
                case .image:
                    if let image = UIImage(contentsOfFile: fileURL.path) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                    } else {
                        placeholder
                    }
                case .video:
                    if height > 220 {
                        VideoPlayer(player: AVPlayer(url: fileURL))
                    } else if let thumbnail = videoThumbnail(for: fileURL) {
                        Image(uiImage: thumbnail)
                            .resizable()
                            .scaledToFill()
                            .overlay(alignment: .center) {
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 32))
                                    .foregroundStyle(.white)
                                    .shadow(radius: 8)
                            }
                    } else {
                        placeholder
                    }
                }
            } else {
                placeholder
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var placeholder: some View {
        RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(memory.accent.color.opacity(0.12))
            .overlay(
                VStack(spacing: 8) {
                    Image(systemName: memory.mediaKind == .video ? "video" : "photo")
                        .font(.system(size: 26, weight: .semibold))
                    Text(memory.mediaKind == .video ? "视频记录" : "照片记录")
                        .font(.caption.weight(.semibold))
                }
                .foregroundStyle(memory.accent.color)
            )
    }

    private func videoThumbnail(for url: URL) -> UIImage? {
        let asset = AVAsset(url: url)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 800, height: 800)

        do {
            let cgImage = try generator.copyCGImage(at: .zero, actualTime: nil)
            return UIImage(cgImage: cgImage)
        } catch {
            return nil
        }
    }
}

private struct MiniBadge: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption)
            .lineLimit(1)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(PetTheme.pine.opacity(0.08), in: Capsule())
    }
}

#Preview {
    NavigationStack {
        AlbumTreeView(appModel: AppModel())
    }
}
