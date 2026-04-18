import AVFoundation
import Combine
import PhotosUI
import SwiftUI
import UniformTypeIdentifiers
import UIKit

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
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [AccentToken.pine.color, Color(red: 0.08, green: 0.20, blue: 0.14)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 300)

            PetHeroArtwork(name: "hero-tree", width: 150)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 224) {
                    PetFeatureIcon(name: "feature-tree", size: 50)

                    Text("把宠物的重要时刻挂上树")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.86)

                    Text("现在已经支持里程碑详情和新增记忆，后面只要把图片、音频和云端存储接上，这个模块就能真正跑起来。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.86))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct OrnamentMemoryCard: View {
    let memory: HolidayMemory
    let showsStem: Bool

    private var badges: [String] {
        var values: [String] = []
        if memory.photoAssetPath != nil {
            values.append("图片已上传")
        }
        if memory.audioAssetPath != nil {
            values.append("音频已同步")
        }
        values.append("成长节点")
        return values
    }

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

            HStack(alignment: .top, spacing: 14) {
                if let photoPath = memory.photoAssetPath {
                    MemoryPhotoThumbnail(relativePath: photoPath)
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text(memory.dateText)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(memory.accent.color)

                    Text(memory.title)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(PetTheme.ink)
                        .lineLimit(2)

                    Text(memory.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(2)

                    HStack(spacing: 10) {
                        ForEach(badges, id: \.self) { badge in
                            MiniBadge(label: badge)
                        }
                    }
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

    @StateObject private var audioPlayer = MemoryAudioPlayer()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                MemoryHeroMedia(memory: memory)

                Text(memory.title)
                    .font(.largeTitle.weight(.bold))
                Text(memory.dateText)
                    .font(.headline)
                    .foregroundStyle(memory.accent.color)
                Text(memory.story)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                if let audioName = memory.audioDisplayName ?? memory.audioAssetPath?.split(separator: "/").last.map(String.init) {
                    MemoryAudioCard(
                        title: audioName,
                        isPlaying: audioPlayer.isPlaying,
                        playAction: {
                            audioPlayer.togglePlayback(for: memory.audioAssetPath)
                        }
                    )
                }
            }
            .padding(20)
        }
        .navigationTitle("记忆详情")
        .onDisappear {
            audioPlayer.stop()
        }
    }
}

private struct AddMemorySheet: View {
    @Binding var draft: MemoryDraft
    let isBusy: Bool
    let saveAction: () -> Void

    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var isShowingAudioImporter = false
    @State private var isImportingMedia = false
    @State private var importErrorMessage: String?

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

                Section("图片与音频") {
                    PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                        Label(draft.photoAssetPath == nil ? "选择图片" : "更换图片", systemImage: "photo.on.rectangle")
                    }

                    if let photoPath = draft.photoAssetPath {
                        VStack(alignment: .leading, spacing: 12) {
                            MemoryPhotoPreview(relativePath: photoPath)

                            Button("移除图片", role: .destructive) {
                                draft.photoAssetPath = nil
                                selectedPhotoItem = nil
                            }
                        }
                    }

                    Button {
                        isShowingAudioImporter = true
                    } label: {
                        Label(draft.audioAssetPath == nil ? "导入音频" : "更换音频", systemImage: "waveform")
                    }

                    if let audioName = draft.audioDisplayName {
                        HStack {
                            Label(audioName, systemImage: "music.note")
                                .font(.subheadline)
                            Spacer()
                            Button("移除", role: .destructive) {
                                draft.audioAssetPath = nil
                                draft.audioDisplayName = nil
                            }
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
            .navigationTitle("新增相册记忆")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存", action: saveAction)
                        .disabled(draft.title.isEmpty || draft.story.isEmpty || isBusy || isImportingMedia)
                }
            }
            .fileImporter(
                isPresented: $isShowingAudioImporter,
                allowedContentTypes: [.audio],
                allowsMultipleSelection: false,
                onCompletion: handleAudioImport
            )
            .task(id: selectedPhotoItem) {
                await importSelectedPhoto()
            }
        }
    }

    private func importSelectedPhoto() async {
        guard let selectedPhotoItem else {
            return
        }

        isImportingMedia = true
        defer { isImportingMedia = false }

        do {
            guard let imageData = try await selectedPhotoItem.loadTransferable(type: Data.self) else {
                importErrorMessage = "图片读取失败，请重新选择。"
                return
            }

            let ext = selectedPhotoItem.supportedContentTypes.first?.preferredFilenameExtension ?? "jpg"
            draft.photoAssetPath = try MemoryAssetStore.saveImageData(imageData, preferredExtension: ext)
            importErrorMessage = nil
        } catch {
            importErrorMessage = "图片导入失败：\(error.localizedDescription)"
        }
    }

    private func handleAudioImport(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            guard let sourceURL = urls.first else {
                return
            }

            let canAccessSecurityScopedResource = sourceURL.startAccessingSecurityScopedResource()
            defer {
                if canAccessSecurityScopedResource {
                    sourceURL.stopAccessingSecurityScopedResource()
                }
            }

            do {
                draft.audioAssetPath = try MemoryAssetStore.copyImportedFile(from: sourceURL)
                draft.audioDisplayName = sourceURL.lastPathComponent
                importErrorMessage = nil
            } catch {
                importErrorMessage = "音频导入失败：\(error.localizedDescription)"
            }

        case .failure(let error):
            importErrorMessage = "音频导入失败：\(error.localizedDescription)"
        }
    }
}

private struct MemoryHeroMedia: View {
    let memory: HolidayMemory

    var body: some View {
        Group {
            if let photoPath = memory.photoAssetPath {
                MemoryPhotoPreview(relativePath: photoPath, height: 260)
                    .overlay(alignment: .topLeading) {
                        MemoryMediaPill(label: "云端图片")
                            .padding(16)
                    }
            } else {
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
                        PetHeroArtwork(name: "hero-tree", width: 180)
                    )
            }
        }
    }
}

private struct MemoryAudioCard: View {
    let title: String
    let isPlaying: Bool
    let playAction: () -> Void

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(PetTheme.pine.opacity(0.12))
                    .frame(width: 52, height: 52)

                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .foregroundStyle(PetTheme.pine)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("成长语音")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(PetTheme.pine)

                Text(title)
                    .font(.headline)
                    .lineLimit(2)
            }

            Spacer()

            Button(isPlaying ? "暂停" : "播放", action: playAction)
                .buttonStyle(.borderedProminent)
                .tint(PetTheme.pine)
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(PetTheme.pine.opacity(0.15), lineWidth: 1)
        )
    }
}

private struct MemoryPhotoPreview: View {
    let relativePath: String
    var height: CGFloat = 180

    var body: some View {
        Group {
            if let image = UIImage(contentsOfFile: MemoryAssetStore.url(for: relativePath)?.path ?? "") {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(PetTheme.pine.opacity(0.1))
                    .overlay(
                        Image(systemName: "photo")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundStyle(PetTheme.pine.opacity(0.7))
                    )
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct MemoryPhotoThumbnail: View {
    let relativePath: String

    var body: some View {
        MemoryPhotoPreview(relativePath: relativePath, height: 92)
            .frame(width: 92)
    }
}

private struct MemoryMediaPill: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.black.opacity(0.35), in: Capsule())
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

private final class MemoryAudioPlayer: NSObject, ObservableObject, AVAudioPlayerDelegate {
    @Published private(set) var isPlaying = false

    private var player: AVAudioPlayer?

    func togglePlayback(for relativePath: String?) {
        if isPlaying {
            stop()
            return
        }

        guard
            let url = MemoryAssetStore.url(for: relativePath),
            FileManager.default.fileExists(atPath: url.path)
        else {
            return
        }

        do {
            let player = try AVAudioPlayer(contentsOf: url)
            player.delegate = self
            player.prepareToPlay()
            player.play()
            self.player = player
            isPlaying = true
        } catch {
            stop()
        }
    }

    func stop() {
        player?.stop()
        player = nil
        isPlaying = false
    }

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        isPlaying = false
        self.player = nil
    }
}

#Preview {
    NavigationStack {
        ChristmasTreeAlbumView(appModel: AppModel())
    }
}
