import Foundation

enum AppTab: Hashable {
    case home
    case tree
    case videos
    case match
    case profile
}

enum AccentToken: String, CaseIterable, Hashable, Sendable {
    case ember
    case pine
    case sky
    case peach
    case plum
    case mint
}

enum UploadStatus: String, CaseIterable, Hashable, Sendable {
    case draft = "待处理"
    case uploading = "上传中"
    case reviewing = "审核中"
    case published = "已发布"
}

struct UserAccount: Identifiable, Hashable, Sendable {
    let id: UUID
    var displayName: String
    var phone: String
    var city: String
    var bio: String
    var avatarSymbol: String
}

struct HolidayMemory: Identifiable, Hashable, Sendable {
    let id: UUID
    var title: String
    var subtitle: String
    var dateText: String
    var ornament: String
    var accent: AccentToken
    var story: String
}

struct UploadVideo: Identifiable, Hashable, Sendable {
    let id: UUID
    var title: String
    var duration: String
    var caption: String
    var tags: [String]
    var status: UploadStatus
    var selectedAssetCount: Int
    var accent: AccentToken
    var publishDateText: String
}

struct PetProfile: Identifiable, Hashable, Sendable {
    let id: UUID
    var name: String
    var species: String
    var breed: String
    var ageText: String
    var city: String
    var bio: String
    var interests: [String]
    var lookingFor: String
    var accent: AccentToken
    var ownerName: String
    var vaccinated: Bool
}

struct PostComment: Identifiable, Hashable, Sendable {
    let id: UUID
    var authorName: String
    var body: String
    var createdAtText: String
}

struct FeedPost: Identifiable, Hashable, Sendable {
    let id: UUID
    var authorName: String
    var petName: String
    var topic: String
    var city: String
    var content: String
    var tags: [String]
    var likes: Int
    var comments: [PostComment]
    var likedByCurrentUser: Bool
    var createdAtText: String
}

struct ChatMessage: Identifiable, Hashable, Sendable {
    let id: UUID
    var text: String
    var isFromCurrentUser: Bool
    var sentAtText: String
}

struct ChatThread: Identifiable, Hashable, Sendable {
    let id: UUID
    var title: String
    var subtitle: String
    var unreadCount: Int
    var accent: AccentToken
    var messages: [ChatMessage]
}

struct BootstrapPayload: Sendable {
    var currentUser: UserAccount?
    var ownedPets: [PetProfile]
    var discoverPets: [PetProfile]
    var memories: [HolidayMemory]
    var uploadVideos: [UploadVideo]
    var feedPosts: [FeedPost]
    var chatThreads: [ChatThread]
}

struct SignInDraft: Hashable, Sendable {
    var displayName: String = ""
    var phone: String = ""
    var city: String = "上海"
}

struct PetDraft: Hashable, Sendable {
    var name: String = ""
    var species: String = "狗狗"
    var breed: String = ""
    var ageText: String = ""
    var city: String = "上海"
    var bio: String = ""
    var interestsText: String = ""
    var lookingFor: String = "一起散步和玩耍"
    var accent: AccentToken = .ember
    var vaccinated: Bool = true

    var interests: [String] {
        interestsText
            .split(separator: " ")
            .map { String($0) }
            .filter { !$0.isEmpty }
    }
}

struct PostDraft: Hashable, Sendable {
    var topic: String = "同城交友"
    var city: String = "上海"
    var content: String = ""
    var tagsText: String = "遛宠 社交"

    var tags: [String] {
        tagsText
            .split(separator: " ")
            .map { String($0) }
            .filter { !$0.isEmpty }
    }
}

struct VideoDraft: Hashable, Sendable {
    var title: String = ""
    var duration: String = "00:30"
    var caption: String = ""
    var tagsText: String = "成长 日常"
    var accent: AccentToken = .peach

    var tags: [String] {
        tagsText
            .split(separator: " ")
            .map { String($0) }
            .filter { !$0.isEmpty }
    }
}

struct MemoryDraft: Hashable, Sendable {
    var title: String = ""
    var subtitle: String = ""
    var dateText: String = "2026.04.02"
    var story: String = ""
    var ornament: String = "star.fill"
    var accent: AccentToken = .pine
}
