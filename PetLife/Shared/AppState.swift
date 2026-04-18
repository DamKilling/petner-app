import CloudKit
import Foundation
import Observation

enum MemoryAssetStore {
    private static let folderName = "MemoryAssets"

    static func url(for relativePath: String?) -> URL? {
        guard let relativePath, let directory = try? directoryURL() else {
            return nil
        }

        return directory.appendingPathComponent(relativePath)
    }

    static func saveImageData(_ data: Data, preferredExtension: String = "jpg") throws -> String {
        let sanitizedExtension = preferredExtension.isEmpty ? "jpg" : preferredExtension
        let relativePath = "\(UUID().uuidString.lowercased()).\(sanitizedExtension)"
        let destinationURL = try directoryURL().appendingPathComponent(relativePath)
        try data.write(to: destinationURL, options: .atomic)
        return relativePath
    }

    static func copyImportedFile(
        from sourceURL: URL,
        preferredExtension: String? = nil
    ) throws -> String {
        let ext = preferredExtension ?? sourceURL.pathExtension
        let sanitizedExtension = ext.isEmpty ? "bin" : ext
        let relativePath = "\(UUID().uuidString.lowercased()).\(sanitizedExtension)"
        let destinationURL = try directoryURL().appendingPathComponent(relativePath)

        if FileManager.default.fileExists(atPath: destinationURL.path) {
            try FileManager.default.removeItem(at: destinationURL)
        }

        try FileManager.default.copyItem(at: sourceURL, to: destinationURL)
        return relativePath
    }

    static func importCloudAsset(_ asset: CKAsset?, fallbackExtension: String) -> String? {
        guard let sourceURL = asset?.fileURL else {
            return nil
        }

        return try? copyImportedFile(
            from: sourceURL,
            preferredExtension: sourceURL.pathExtension.isEmpty ? fallbackExtension : nil
        )
    }

    private static func directoryURL() throws -> URL {
        let fileManager = FileManager.default
        let baseURL = try fileManager.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let directoryURL = baseURL.appendingPathComponent(folderName, isDirectory: true)

        if !fileManager.fileExists(atPath: directoryURL.path) {
            try fileManager.createDirectory(at: directoryURL, withIntermediateDirectories: true)
        }

        return directoryURL
    }
}

protocol PetBackend: Sendable {
    func bootstrap() async -> BootstrapPayload
    func signIn(with draft: SignInDraft) async -> BootstrapPayload
    func signOut() async -> BootstrapPayload
    func addPet(_ draft: PetDraft, owner: UserAccount) async -> BootstrapPayload
    func addMemory(_ draft: MemoryDraft) async -> BootstrapPayload
    func createVideo(_ draft: VideoDraft, selectedAssetCount: Int) async -> BootstrapPayload
    func createPost(_ draft: PostDraft, user: UserAccount, petName: String) async -> BootstrapPayload
    func toggleLike(postID: UUID) async -> BootstrapPayload
    func addComment(postID: UUID, text: String, userName: String) async -> BootstrapPayload
    func openChat(for pet: PetProfile) async -> (BootstrapPayload, UUID)
    func sendMessage(threadID: UUID, text: String) async -> BootstrapPayload
}

enum PetBackendFactory {
    static func makeDefaultBackend() -> any PetBackend {
        if ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1" {
            return InMemoryPetBackend()
        }

        if ProcessInfo.processInfo.environment["PETLIFE_BACKEND"]?.lowercased() == "memory" {
            return InMemoryPetBackend()
        }

        let containerID = Bundle.main.object(forInfoDictionaryKey: "CLOUDKIT_CONTAINER_ID") as? String
        return CloudKitPetBackend(containerIdentifier: containerID)
    }
}

actor InMemoryPetBackend: PetBackend {
    private var currentUser: UserAccount?
    private var ownedPets: [PetProfile]
    private var discoverPets: [PetProfile]
    private var memories: [HolidayMemory]
    private var uploadVideos: [UploadVideo]
    private var feedPosts: [FeedPost]
    private var chatThreads: [ChatThread]

    init() {
        self.currentUser = nil
        self.ownedPets = []
        self.discoverPets = Self.makeDiscoverPets()
        self.memories = []
        self.uploadVideos = []
        self.feedPosts = []
        self.chatThreads = []
    }

    func bootstrap() async -> BootstrapPayload {
        BootstrapPayload(
            currentUser: currentUser,
            ownedPets: ownedPets,
            discoverPets: discoverPets,
            memories: memories,
            uploadVideos: uploadVideos,
            feedPosts: feedPosts,
            chatThreads: chatThreads
        )
    }

    func signIn(with draft: SignInDraft) async -> BootstrapPayload {
        let user = UserAccount(
            id: UUID(),
            displayName: draft.displayName.isEmpty ? "新用户" : draft.displayName,
            phone: draft.phone,
            city: draft.city,
            bio: "在 PetLife 记录宠物成长，也希望认识更多同频家庭。",
            avatarSymbol: "person.crop.circle.fill"
        )
        resetSessionState(for: user)

        return await bootstrap()
    }

    func signOut() async -> BootstrapPayload {
        resetSessionState(for: nil)
        return await bootstrap()
    }

    func addPet(_ draft: PetDraft, owner: UserAccount) async -> BootstrapPayload {
        let pet = PetProfile(
            id: UUID(),
            name: draft.name,
            species: draft.species,
            breed: draft.breed,
            ageText: draft.ageText,
            city: draft.city,
            bio: draft.bio,
            interests: draft.interests,
            lookingFor: draft.lookingFor,
            accent: draft.accent,
            ownerName: owner.displayName,
            vaccinated: draft.vaccinated
        )
        ownedPets.insert(pet, at: 0)
        return await bootstrap()
    }

    func addMemory(_ draft: MemoryDraft) async -> BootstrapPayload {
        let memory = HolidayMemory(
            id: UUID(),
            title: draft.title,
            subtitle: draft.subtitle,
            dateText: draft.dateText,
            ornament: draft.ornament,
            accent: draft.accent,
            story: draft.story,
            photoAssetPath: draft.photoAssetPath,
            audioAssetPath: draft.audioAssetPath,
            audioDisplayName: draft.audioDisplayName
        )
        memories.insert(memory, at: 0)
        return await bootstrap()
    }

    func createVideo(_ draft: VideoDraft, selectedAssetCount: Int) async -> BootstrapPayload {
        let video = UploadVideo(
            id: UUID(),
            title: draft.title,
            duration: draft.duration,
            caption: draft.caption,
            tags: draft.tags,
            status: selectedAssetCount == 0 ? .draft : .uploading,
            selectedAssetCount: selectedAssetCount,
            accent: draft.accent,
            publishDateText: selectedAssetCount == 0 ? "草稿" : "刚刚"
        )
        uploadVideos.insert(video, at: 0)
        return await bootstrap()
    }

    func createPost(_ draft: PostDraft, user: UserAccount, petName: String) async -> BootstrapPayload {
        let relatedPetID = ownedPets.first(where: { $0.name == petName })?.id
        let post = FeedPost(
            id: UUID(),
            relatedPetID: relatedPetID,
            authorName: user.displayName,
            petName: petName,
            topic: draft.topic,
            city: draft.city,
            content: draft.content,
            tags: draft.tags,
            likes: 0,
            comments: [],
            likedByCurrentUser: false,
            createdAtText: "刚刚"
        )
        feedPosts.insert(post, at: 0)
        return await bootstrap()
    }

    func toggleLike(postID: UUID) async -> BootstrapPayload {
        guard let index = feedPosts.firstIndex(where: { $0.id == postID }) else {
            return await bootstrap()
        }

        feedPosts[index].likedByCurrentUser.toggle()
        feedPosts[index].likes += feedPosts[index].likedByCurrentUser ? 1 : -1
        return await bootstrap()
    }

    func addComment(postID: UUID, text: String, userName: String) async -> BootstrapPayload {
        guard let index = feedPosts.firstIndex(where: { $0.id == postID }) else {
            return await bootstrap()
        }

        let comment = PostComment(
            id: UUID(),
            authorName: userName,
            body: text,
            createdAtText: "刚刚"
        )
        feedPosts[index].comments.append(comment)
        return await bootstrap()
    }

    func openChat(for pet: PetProfile) async -> (BootstrapPayload, UUID) {
        if let existing = chatThreads.first(where: { $0.relatedPetID == pet.id }) {
            return (await bootstrap(), existing.id)
        }

        let thread = ChatThread(
            id: UUID(),
            relatedPetID: pet.id,
            title: "\(pet.ownerName) · \(pet.name)",
            subtitle: "新的聊天已开启",
            unreadCount: 0,
            accent: pet.accent,
            messages: [
                ChatMessage(id: UUID(), text: "你好，我想进一步了解 \(pet.name) 的档案和相处习惯。", isFromCurrentUser: true, sentAtText: "刚刚")
            ]
        )
        chatThreads.insert(thread, at: 0)
        return (await bootstrap(), thread.id)
    }

    func sendMessage(threadID: UUID, text: String) async -> BootstrapPayload {
        guard let index = chatThreads.firstIndex(where: { $0.id == threadID }) else {
            return await bootstrap()
        }

        chatThreads[index].messages.append(
            ChatMessage(id: UUID(), text: text, isFromCurrentUser: true, sentAtText: "刚刚")
        )
        chatThreads[index].subtitle = text
        chatThreads[index].unreadCount = 0
        return await bootstrap()
    }

    private func resetSessionState(for user: UserAccount?) {
        currentUser = user

        guard let user else {
            ownedPets = []
            memories = []
            uploadVideos = []
            feedPosts = []
            chatThreads = []
            return
        }

        ownedPets = Self.makeDefaultOwnedPets(for: user)
        memories = Self.makeDefaultMemories()
        uploadVideos = Self.makeDefaultUploadVideos()
        feedPosts = Self.makeDefaultFeedPosts(from: discoverPets)
        chatThreads = Self.makeDefaultChatThreads(from: discoverPets)
    }

    static func makeDiscoverPets() -> [PetProfile] {
        [
            PetProfile(
                id: UUID(uuidString: "A0000000-0000-0000-0000-000000000001") ?? UUID(),
                name: "Bobo",
                species: "狗狗",
                breed: "柯基",
                ageText: "2岁",
                city: "上海",
                bio: "情绪稳定，喜欢飞盘和草地社交，见面会先闻闻再摇尾巴。",
                interests: ["飞盘", "露营", "亲人"],
                lookingFor: "周末能一起跑起来的玩伴",
                accent: .peach,
                ownerName: "林夏",
                vaccinated: true
            ),
            PetProfile(
                id: UUID(uuidString: "A0000000-0000-0000-0000-000000000002") ?? UUID(),
                name: "Mochi",
                species: "猫咪",
                breed: "布偶猫",
                ageText: "1岁半",
                city: "杭州",
                bio: "慢热但很黏人，适合安静家庭，也愿意先从线上视频认识。",
                interests: ["晒太阳", "陪伴", "安静"],
                lookingFor: "性格温柔的长期陪伴对象",
                accent: .sky,
                ownerName: "Qiao",
                vaccinated: true
            ),
            PetProfile(
                id: UUID(uuidString: "A0000000-0000-0000-0000-000000000003") ?? UUID(),
                name: "Dumpling",
                species: "狗狗",
                breed: "比熊",
                ageText: "3岁",
                city: "苏州",
                bio: "社交感很强，喜欢拍照，出门散步时会主动跟别的狗狗打招呼。",
                interests: ["拍照", "社交", "散步"],
                lookingFor: "一起拍写真、一起遛街的朋友",
                accent: .mint,
                ownerName: "周周",
                vaccinated: true
            )
        ]
    }

    static func makeDefaultOwnedPets(for user: UserAccount) -> [PetProfile] {
        [
            PetProfile(
                id: UUID(),
                name: "Lucky",
                species: "狗狗",
                breed: "金毛",
                ageText: "10个月",
                city: user.city,
                bio: "爱出门、爱训练、也爱和人互动，最近开始学会在镜头前看镜头。",
                interests: ["训练", "户外", "握手"],
                lookingFor: "一起玩球、也能一起拍日常视频的朋友",
                accent: .ember,
                ownerName: user.displayName,
                vaccinated: true
            )
        ]
    }

    static func makeDefaultMemories() -> [HolidayMemory] {
        [
            HolidayMemory(
                id: UUID(),
                title: "初雪见面",
                subtitle: "把领养那天的照片挂上树尖，像点亮了新的家庭故事。",
                dateText: "2025.12.03",
                ornament: "sparkles",
                accent: .ember,
                story: "我们第一次见面是在下雪天。它从航空箱里探出头时很安静，但那一瞬间我知道它要成为家里的一员。",
                photoAssetPath: nil,
                audioAssetPath: nil,
                audioDisplayName: nil
            ),
            HolidayMemory(
                id: UUID(),
                title: "第一件圣诞毛衣",
                subtitle: "记录宠物成长节点，每一张都能挂成一个节日愿望。",
                dateText: "2025.12.10",
                ornament: "gift.fill",
                accent: .pine,
                story: "第一次试穿圣诞毛衣，它居然没有挣扎，还会自己走到圣诞树前找镜头。",
                photoAssetPath: nil,
                audioAssetPath: nil,
                audioDisplayName: nil
            ),
            HolidayMemory(
                id: UUID(),
                title: "全家福夜灯",
                subtitle: "把视频、语音和照片组合成会发光的树枝故事线。",
                dateText: "2025.12.24",
                ornament: "star.fill",
                accent: .peach,
                story: "那一晚我们录了视频、留下了语音祝福，也第一次把宠物成长故事整理成了一个完整相册。",
                photoAssetPath: nil,
                audioAssetPath: nil,
                audioDisplayName: nil
            )
        ]
    }

    static func makeDefaultUploadVideos() -> [UploadVideo] {
        [
            UploadVideo(
                id: UUID(),
                title: "Lucky第一次学会握手",
                duration: "00:34",
                caption: "训练第三天终于学会握手，奖励了两颗冻干。",
                tags: ["训练", "成长", "高互动"],
                status: .published,
                selectedAssetCount: 1,
                accent: .ember,
                publishDateText: "今天"
            ),
            UploadVideo(
                id: UUID(),
                title: "Milo雪地撒欢",
                duration: "01:12",
                caption: "第一次见雪，冲出去之后根本停不下来。",
                tags: ["冬天", "户外", "萌宠"],
                status: .reviewing,
                selectedAssetCount: 2,
                accent: .sky,
                publishDateText: "待审核"
            ),
            UploadVideo(
                id: UUID(),
                title: "Nana洗澡挑战",
                duration: "00:48",
                caption: "洗澡前后判若两狗，但还是很可爱。",
                tags: ["日常", "搞笑"],
                status: .draft,
                selectedAssetCount: 1,
                accent: .mint,
                publishDateText: "草稿"
            )
        ]
    }

    static func makeDefaultFeedPosts(from discoverPets: [PetProfile]) -> [FeedPost] {
        let bobo = discoverPets.first(where: { $0.name == "Bobo" })
        let mochi = discoverPets.first(where: { $0.name == "Mochi" })
        let dumpling = discoverPets.first(where: { $0.name == "Dumpling" })

        return [
            FeedPost(
                id: UUID(),
                relatedPetID: mochi?.id,
                authorName: "阿青",
                petName: "Mochi",
                topic: "同城交友",
                city: "上海",
                content: "想给我家猫咪找固定玩伴，周末徐汇滨江可以一起遛猫背包，也欢迎先交换宠物档案。",
                tags: ["猫咪", "徐汇", "周末"],
                likes: 128,
                comments: [
                    PostComment(id: UUID(), authorName: "小暖", body: "我家蓝猫也在附近，可以约一个安静场地先见面。", createdAtText: "1小时前")
                ],
                likedByCurrentUser: false,
                createdAtText: "今天 09:20"
            ),
            FeedPost(
                id: UUID(),
                relatedPetID: bobo?.id,
                authorName: "林夏",
                petName: "Bobo",
                topic: "宠物相亲",
                city: "上海",
                content: "春天到了，想给狗狗找一个脾气温和、疫苗齐全的相亲对象，也欢迎先线上视频见面。",
                tags: ["相亲", "疫苗齐全", "视频初聊"],
                likes: 203,
                comments: [
                    PostComment(id: UUID(), authorName: "森森", body: "我家比熊三岁，性格很稳，可以先视频互相看看。", createdAtText: "2小时前")
                ],
                likedByCurrentUser: true,
                createdAtText: "今天 11:40"
            ),
            FeedPost(
                id: UUID(),
                relatedPetID: dumpling?.id,
                authorName: "周周",
                petName: "Dumpling",
                topic: "活动组队",
                city: "苏州",
                content: "有没有家庭想一起拍圣诞树主题写真和短视频？可以组个小型宠物节日局。",
                tags: ["写真", "短视频", "节日"],
                likes: 87,
                comments: [],
                likedByCurrentUser: false,
                createdAtText: "昨天"
            )
        ]
    }

    static func makeDefaultChatThreads(from discoverPets: [PetProfile]) -> [ChatThread] {
        guard let bobo = discoverPets.first(where: { $0.name == "Bobo" }) else {
            return []
        }

        return [
            ChatThread(
                id: UUID(),
                relatedPetID: bobo.id,
                title: "\(bobo.ownerName) · \(bobo.name)",
                subtitle: "已约好本周先视频见面",
                unreadCount: 1,
                accent: .plum,
                messages: [
                    ChatMessage(id: UUID(), text: "你好呀，我看到了你发的相亲动态。", isFromCurrentUser: false, sentAtText: "昨天 21:10"),
                    ChatMessage(id: UUID(), text: "可以，我们先交换宠物档案和疫苗信息。", isFromCurrentUser: true, sentAtText: "昨天 21:16"),
                    ChatMessage(id: UUID(), text: "太好了，我今晚把 \(bobo.name) 的档案卡发你。", isFromCurrentUser: false, sentAtText: "今天 08:05")
                ]
            )
        ]
    }
}

private func queryAllRecords(in database: CKDatabase, recordType: String) async throws -> [CKRecord] {
    try await withCheckedThrowingContinuation { continuation in
        let query = CKQuery(recordType: recordType, predicate: NSPredicate(value: true))
        var records: [CKRecord] = []
        var didResume = false

        func resumeOnce(_ result: Result<[CKRecord], Error>) {
            guard !didResume else { return }
            didResume = true
            continuation.resume(with: result)
        }

        func run(cursor: CKQueryOperation.Cursor?) {
            let operation = cursor.map(CKQueryOperation.init(cursor:)) ?? CKQueryOperation(query: query)
            operation.resultsLimit = CKQueryOperation.maximumResults
            operation.recordFetchedBlock = { record in
                records.append(record)
            }
            operation.queryCompletionBlock = { nextCursor, error in
                if let error {
                    resumeOnce(.failure(error))
                    return
                }

                if let nextCursor {
                    run(cursor: nextCursor)
                } else {
                    resumeOnce(.success(records))
                }
            }
            database.add(operation)
        }

        run(cursor: nil)
    }
}

private func applyRecordChanges(
    in database: CKDatabase,
    saving records: [CKRecord],
    deleting recordIDs: [CKRecord.ID]
) async throws {
    guard !records.isEmpty || !recordIDs.isEmpty else { return }

    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
        let operation = CKModifyRecordsOperation(
            recordsToSave: records.isEmpty ? nil : records,
            recordIDsToDelete: recordIDs.isEmpty ? nil : recordIDs
        )
        operation.savePolicy = .allKeys
        operation.isAtomic = false
        operation.modifyRecordsCompletionBlock = { _, _, error in
            if let error {
                continuation.resume(throwing: error)
            } else {
                continuation.resume(returning: ())
            }
        }
        database.add(operation)
    }
}

private func chunked<T>(_ values: [T], size: Int) -> [[T]] {
    guard size > 0, !values.isEmpty else { return [] }

    var result: [[T]] = []
    result.reserveCapacity((values.count + size - 1) / size)

    var index = 0
    while index < values.count {
        let nextIndex = min(index + size, values.count)
        result.append(Array(values[index..<nextIndex]))
        index = nextIndex
    }

    return result
}

actor CloudKitPetBackend: PetBackend {
    private enum RecordType {
        static let session = "PLSession"
        static let userAccount = "PLUserAccount"
        static let ownedPet = "PLOwnedPet"
        static let holidayMemory = "PLHolidayMemory"
        static let uploadVideo = "PLUploadVideo"
        static let feedPost = "PLFeedPost"
        static let postComment = "PLPostComment"
        static let chatThread = "PLChatThread"
        static let chatMessage = "PLChatMessage"
    }

    private enum Prefix {
        static let userAccount = "user"
        static let ownedPet = "pet"
        static let holidayMemory = "memory"
        static let uploadVideo = "video"
        static let feedPost = "post"
        static let postComment = "comment"
        static let chatThread = "thread"
        static let chatMessage = "message"
    }

    private enum Field {
        static let activeUserID = "activeUserID"
        static let userID = "userID"
        static let createdAt = "createdAt"
        static let updatedAt = "updatedAt"

        static let accountID = "accountID"
        static let name = "name"
        static let displayName = "displayName"
        static let phone = "phone"
        static let city = "city"
        static let bio = "bio"
        static let avatarSymbol = "avatarSymbol"

        static let petID = "petID"
        static let species = "species"
        static let breed = "breed"
        static let ageText = "ageText"
        static let interests = "interests"
        static let lookingFor = "lookingFor"
        static let accent = "accent"
        static let ownerName = "ownerName"
        static let vaccinated = "vaccinated"

        static let memoryID = "memoryID"
        static let title = "title"
        static let subtitle = "subtitle"
        static let dateText = "dateText"
        static let ornament = "ornament"
        static let story = "story"
        static let photoAsset = "photoAsset"
        static let audioAsset = "audioAsset"
        static let audioDisplayName = "audioDisplayName"

        static let videoID = "videoID"
        static let duration = "duration"
        static let caption = "caption"
        static let tags = "tags"
        static let status = "status"
        static let selectedAssetCount = "selectedAssetCount"
        static let publishDateText = "publishDateText"

        static let postID = "postID"
        static let relatedPetID = "relatedPetID"
        static let authorName = "authorName"
        static let petName = "petName"
        static let topic = "topic"
        static let content = "content"
        static let likes = "likes"
        static let likedByCurrentUser = "likedByCurrentUser"
        static let createdAtText = "createdAtText"

        static let commentID = "commentID"
        static let body = "body"

        static let threadID = "threadID"
        static let unreadCount = "unreadCount"

        static let messageID = "messageID"
        static let text = "text"
        static let isFromCurrentUser = "isFromCurrentUser"
        static let sentAtText = "sentAtText"
    }

    private enum Limits {
        static let mutationBatchSize = 200
    }

    private enum LegacyStorage {
        static let recordName = "current"
        static let payloadField = "payload"
    }

    private let container: CKContainer
    private let database: CKDatabase
    private let fallback = InMemoryPetBackend()

    private var useFallbackOnly = false
    private var hasLoggedFallback = false

    init(containerIdentifier: String?) {
        if let containerIdentifier, !containerIdentifier.isEmpty {
            container = CKContainer(identifier: containerIdentifier)
        } else {
            container = CKContainer.default()
        }

        database = container.privateCloudDatabase
    }

    func bootstrap() async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.bootstrap()
            }
        )
    }

    func signIn(with draft: SignInDraft) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                if let activeUserID = try await loadSessionUserID(),
                   var activeUser = try await loadUser(userID: activeUserID) {
                    if !draft.displayName.isEmpty {
                        activeUser.displayName = draft.displayName
                    }
                    if !draft.phone.isEmpty {
                        activeUser.phone = draft.phone
                    }
                    activeUser.city = draft.city
                    try await saveUser(activeUser)

                    var payload = try await loadBootstrapPayload(for: activeUser)
                    try await seedDefaultStateIfNeeded(for: activeUser, payload: payload)
                    payload = try await loadBootstrapPayload(for: activeUser)
                    try await saveSessionUserID(activeUser.id)
                    return payload
                }

                try await saveSessionUserID(nil)

                let user = UserAccount(
                    id: UUID(),
                    displayName: draft.displayName.isEmpty ? "新用户" : draft.displayName,
                    phone: draft.phone,
                    city: draft.city,
                    bio: "在 PetLife 记录宠物成长，也希望认识更多同频家庭。",
                    avatarSymbol: "person.crop.circle.fill"
                )
                try await saveUser(user)
                try await seedAllDefaultState(for: user)
                try await saveSessionUserID(user.id)
                return try await loadBootstrapPayload(for: user)
            },
            fallbackAction: {
                await fallback.signIn(with: draft)
            }
        )
    }

    func signOut() async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                if let activeUserID = try await loadSessionUserID() {
                    try await deleteAllUserRecords(for: activeUserID)
                }
                try await saveSessionUserID(nil)
                return makeSignedOutPayload()
            },
            fallbackAction: {
                await fallback.signOut()
            }
        )
    }

    func addPet(_ draft: PetDraft, owner: UserAccount) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let pet = PetProfile(
                    id: UUID(),
                    name: draft.name,
                    species: draft.species,
                    breed: draft.breed,
                    ageText: draft.ageText,
                    city: draft.city,
                    bio: draft.bio,
                    interests: draft.interests,
                    lookingFor: draft.lookingFor,
                    accent: draft.accent,
                    ownerName: owner.displayName,
                    vaccinated: draft.vaccinated
                )
                _ = try await database.save(makeOwnedPetRecord(pet, userID: userID, createdAt: Date()))
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.addPet(draft, owner: owner)
            }
        )
    }

    func addMemory(_ draft: MemoryDraft) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let memory = HolidayMemory(
                    id: UUID(),
                    title: draft.title,
                    subtitle: draft.subtitle,
                    dateText: draft.dateText,
                    ornament: draft.ornament,
                    accent: draft.accent,
                    story: draft.story,
                    photoAssetPath: draft.photoAssetPath,
                    audioAssetPath: draft.audioAssetPath,
                    audioDisplayName: draft.audioDisplayName
                )
                _ = try await database.save(makeMemoryRecord(memory, userID: userID, createdAt: Date()))
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.addMemory(draft)
            }
        )
    }

    func createVideo(_ draft: VideoDraft, selectedAssetCount: Int) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let video = UploadVideo(
                    id: UUID(),
                    title: draft.title,
                    duration: draft.duration,
                    caption: draft.caption,
                    tags: draft.tags,
                    status: selectedAssetCount == 0 ? .draft : .uploading,
                    selectedAssetCount: selectedAssetCount,
                    accent: draft.accent,
                    publishDateText: selectedAssetCount == 0 ? "草稿" : "刚刚"
                )
                _ = try await database.save(makeVideoRecord(video, userID: userID, createdAt: Date()))
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.createVideo(draft, selectedAssetCount: selectedAssetCount)
            }
        )
    }

    func createPost(_ draft: PostDraft, user: UserAccount, petName: String) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard try await loadSessionUserID() != nil else {
                    return makeSignedOutPayload()
                }

                let payload = try await loadBootstrapPayload()
                guard let currentUser = payload.currentUser else { return payload }

                let relatedPetID = payload.ownedPets.first(where: { $0.name == petName })?.id
                let post = FeedPost(
                    id: UUID(),
                    relatedPetID: relatedPetID,
                    authorName: user.displayName,
                    petName: petName,
                    topic: draft.topic,
                    city: draft.city,
                    content: draft.content,
                    tags: draft.tags,
                    likes: 0,
                    comments: [],
                    likedByCurrentUser: false,
                    createdAtText: "刚刚"
                )
                _ = try await database.save(makeFeedPostRecord(post, userID: currentUser.id, createdAt: Date()))
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.createPost(draft, user: user, petName: petName)
            }
        )
    }

    func toggleLike(postID: UUID) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let postRecordID = recordID(prefix: Prefix.feedPost, uuid: postID)
                guard let postRecord = try await fetchRecordIfExists(postRecordID) else {
                    return try await loadBootstrapPayload()
                }

                guard belongsToUser(postRecord, userID: userID) else {
                    return try await loadBootstrapPayload()
                }

                let wasLiked = boolValue(postRecord[Field.likedByCurrentUser])
                let previousLikes = intValue(postRecord[Field.likes])
                postRecord[Field.likedByCurrentUser] = NSNumber(value: !wasLiked)
                postRecord[Field.likes] = NSNumber(value: max(0, previousLikes + (wasLiked ? -1 : 1)))
                postRecord[Field.updatedAt] = Date() as NSDate
                _ = try await database.save(postRecord)
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.toggleLike(postID: postID)
            }
        )
    }

    func addComment(postID: UUID, text: String, userName: String) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let postRecordID = recordID(prefix: Prefix.feedPost, uuid: postID)
                guard let postRecord = try await fetchRecordIfExists(postRecordID) else {
                    return try await loadBootstrapPayload()
                }

                guard belongsToUser(postRecord, userID: userID) else {
                    return try await loadBootstrapPayload()
                }

                let comment = PostComment(
                    id: UUID(),
                    authorName: userName,
                    body: text,
                    createdAtText: "刚刚"
                )
                _ = try await database.save(
                    makePostCommentRecord(comment, postID: postID, userID: userID, createdAt: Date())
                )
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.addComment(postID: postID, text: text, userName: userName)
            }
        )
    }

    func openChat(for pet: PetProfile) async -> (BootstrapPayload, UUID) {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return (makeSignedOutPayload(), UUID())
                }

                let threadRecords = try await queryAllRecords(in: database, recordType: RecordType.chatThread)
                let existingThread = records(for: userID, in: threadRecords)
                    .compactMap(decodeChatThreadEntry)
                    .first(where: { $0.thread.relatedPetID == pet.id })?.thread

                if let existingThread {
                    return (try await loadBootstrapPayload(), existingThread.id)
                }

                let thread = ChatThread(
                    id: UUID(),
                    relatedPetID: pet.id,
                    title: "\(pet.ownerName) · \(pet.name)",
                    subtitle: "新的聊天已开启",
                    unreadCount: 0,
                    accent: pet.accent,
                    messages: [
                        ChatMessage(
                            id: UUID(),
                            text: "你好，我想进一步了解 \(pet.name) 的档案和相处习惯。",
                            isFromCurrentUser: true,
                            sentAtText: "刚刚"
                        )
                    ]
                )

                let now = Date()
                let threadRecord = makeChatThreadRecord(thread, userID: userID, createdAt: now)
                let messageRecord = makeChatMessageRecord(
                    thread.messages[0],
                    threadID: thread.id,
                    userID: userID,
                    createdAt: now
                )
                try await applyRecordChanges(in: database, saving: [threadRecord, messageRecord], deleting: [])
                return (try await loadBootstrapPayload(), thread.id)
            },
            fallbackAction: {
                await fallback.openChat(for: pet)
            }
        )
    }

    func sendMessage(threadID: UUID, text: String) async -> BootstrapPayload {
        await runOrFallback(
            primary: {
                guard let userID = try await loadSessionUserID() else {
                    return makeSignedOutPayload()
                }

                let threadRecordID = recordID(prefix: Prefix.chatThread, uuid: threadID)
                guard let threadRecord = try await fetchRecordIfExists(threadRecordID) else {
                    return try await loadBootstrapPayload()
                }

                guard belongsToUser(threadRecord, userID: userID) else {
                    return try await loadBootstrapPayload()
                }

                threadRecord[Field.subtitle] = text as NSString
                threadRecord[Field.unreadCount] = NSNumber(value: 0)
                threadRecord[Field.updatedAt] = Date() as NSDate

                let message = ChatMessage(
                    id: UUID(),
                    text: text,
                    isFromCurrentUser: true,
                    sentAtText: "刚刚"
                )
                let messageRecord = makeChatMessageRecord(
                    message,
                    threadID: threadID,
                    userID: userID,
                    createdAt: Date()
                )
                try await applyRecordChanges(in: database, saving: [threadRecord, messageRecord], deleting: [])
                return try await loadBootstrapPayload()
            },
            fallbackAction: {
                await fallback.sendMessage(threadID: threadID, text: text)
            }
        )
    }

    private func runOrFallback<T>(
        primary: () async throws -> T,
        fallbackAction: () async -> T
    ) async -> T {
        if useFallbackOnly {
            return await fallbackAction()
        }

        do {
            return try await primary()
        } catch {
            useFallbackOnly = true

            if !hasLoggedFallback {
                hasLoggedFallback = true
                print("[PetLife] CloudKit backend failed, switched to InMemory fallback: \(error)")
            }

            return await fallbackAction()
        }
    }

    private func loadBootstrapPayload() async throws -> BootstrapPayload {
        var activeUserID = try await loadSessionUserID()
        if activeUserID == nil {
            try await migrateLegacyPayloadIfNeeded()
            activeUserID = try await loadSessionUserID()
        }

        guard let activeUserID else {
            return makeSignedOutPayload()
        }

        guard let user = try await loadUser(userID: activeUserID) else {
            try await saveSessionUserID(nil)
            return makeSignedOutPayload()
        }

        return try await loadBootstrapPayload(for: user)
    }

    private func migrateLegacyPayloadIfNeeded() async throws {
        let legacyRecordID = CKRecord.ID(recordName: LegacyStorage.recordName)
        guard let legacyRecord = try await fetchRecordIfExists(legacyRecordID) else {
            return
        }

        guard let rawPayload = legacyRecord[LegacyStorage.payloadField] as? NSData else {
            try await applyRecordChanges(in: database, saving: [], deleting: [legacyRecordID])
            return
        }

        let decoder = JSONDecoder()
        let payload = try decoder.decode(BootstrapPayload.self, from: rawPayload as Data)

        guard let user = payload.currentUser else {
            try await saveSessionUserID(nil)
            try await applyRecordChanges(in: database, saving: [], deleting: [legacyRecordID])
            return
        }

        try await deleteAllUserRecords(for: user.id)
        try await saveUser(user)
        try await persistOwnedPets(payload.ownedPets, userID: user.id)
        try await persistMemories(payload.memories, userID: user.id)
        try await persistVideos(payload.uploadVideos, userID: user.id)
        try await persistPosts(payload.feedPosts, userID: user.id)
        try await persistThreads(payload.chatThreads, userID: user.id)
        try await saveSessionUserID(user.id)
        try await applyRecordChanges(in: database, saving: [], deleting: [legacyRecordID])
    }

    private func loadBootstrapPayload(for user: UserAccount) async throws -> BootstrapPayload {
        async let ownedPetRecords = queryAllRecords(in: database, recordType: RecordType.ownedPet)
        async let memoryRecords = queryAllRecords(in: database, recordType: RecordType.holidayMemory)
        async let videoRecords = queryAllRecords(in: database, recordType: RecordType.uploadVideo)
        async let postRecords = queryAllRecords(in: database, recordType: RecordType.feedPost)
        async let commentRecords = queryAllRecords(in: database, recordType: RecordType.postComment)
        async let threadRecords = queryAllRecords(in: database, recordType: RecordType.chatThread)
        async let messageRecords = queryAllRecords(in: database, recordType: RecordType.chatMessage)

        let userID = user.id

        let ownedPetRecordsValue = try await ownedPetRecords
        let memoryRecordsValue = try await memoryRecords
        let videoRecordsValue = try await videoRecords
        let postRecordsValue = try await postRecords
        let commentRecordsValue = try await commentRecords
        let threadRecordsValue = try await threadRecords
        let messageRecordsValue = try await messageRecords

        let pets = records(for: userID, in: ownedPetRecordsValue)
            .compactMap(decodeOwnedPetEntry)
            .sorted(by: { $0.createdAt > $1.createdAt })
            .map(\.pet)

        let memories = records(for: userID, in: memoryRecordsValue)
            .compactMap(decodeMemoryEntry)
            .sorted(by: { $0.createdAt > $1.createdAt })
            .map(\.memory)

        let videos = records(for: userID, in: videoRecordsValue)
            .compactMap(decodeVideoEntry)
            .sorted(by: { $0.createdAt > $1.createdAt })
            .map(\.video)

        let commentEntries = records(for: userID, in: commentRecordsValue)
            .compactMap(decodePostCommentEntry)
            .sorted(by: { $0.createdAt < $1.createdAt })
        var commentsByPost: [UUID: [PostComment]] = [:]
        for entry in commentEntries {
            commentsByPost[entry.postID, default: []].append(entry.comment)
        }

        let posts = records(for: userID, in: postRecordsValue)
            .compactMap(decodeFeedPostEntry)
            .sorted(by: { $0.createdAt > $1.createdAt })
            .map { entry in
                var post = entry.post
                post.comments = commentsByPost[post.id] ?? []
                return post
            }

        let messageEntries = records(for: userID, in: messageRecordsValue)
            .compactMap(decodeChatMessageEntry)
            .sorted(by: { $0.createdAt < $1.createdAt })
        var messagesByThread: [UUID: [ChatMessage]] = [:]
        for entry in messageEntries {
            messagesByThread[entry.threadID, default: []].append(entry.message)
        }

        let threads = records(for: userID, in: threadRecordsValue)
            .compactMap(decodeChatThreadEntry)
            .sorted(by: { $0.createdAt > $1.createdAt })
            .map { entry in
                var thread = entry.thread
                thread.messages = messagesByThread[thread.id] ?? []
                return thread
            }

        return BootstrapPayload(
            currentUser: user,
            ownedPets: pets,
            discoverPets: InMemoryPetBackend.makeDiscoverPets(),
            memories: memories,
            uploadVideos: videos,
            feedPosts: posts,
            chatThreads: threads
        )
    }

    private func seedAllDefaultState(for user: UserAccount) async throws {
        let discoverPets = InMemoryPetBackend.makeDiscoverPets()
        try await persistOwnedPets(InMemoryPetBackend.makeDefaultOwnedPets(for: user), userID: user.id)
        try await persistMemories(InMemoryPetBackend.makeDefaultMemories(), userID: user.id)
        try await persistVideos(InMemoryPetBackend.makeDefaultUploadVideos(), userID: user.id)
        try await persistPosts(InMemoryPetBackend.makeDefaultFeedPosts(from: discoverPets), userID: user.id)
        try await persistThreads(InMemoryPetBackend.makeDefaultChatThreads(from: discoverPets), userID: user.id)
    }

    private func seedDefaultStateIfNeeded(for user: UserAccount, payload: BootstrapPayload) async throws {
        let discoverPets = payload.discoverPets

        if payload.ownedPets.isEmpty {
            try await persistOwnedPets(InMemoryPetBackend.makeDefaultOwnedPets(for: user), userID: user.id)
        }
        if payload.memories.isEmpty {
            try await persistMemories(InMemoryPetBackend.makeDefaultMemories(), userID: user.id)
        }
        if payload.uploadVideos.isEmpty {
            try await persistVideos(InMemoryPetBackend.makeDefaultUploadVideos(), userID: user.id)
        }
        if payload.feedPosts.isEmpty {
            try await persistPosts(InMemoryPetBackend.makeDefaultFeedPosts(from: discoverPets), userID: user.id)
        }
        if payload.chatThreads.isEmpty {
            try await persistThreads(InMemoryPetBackend.makeDefaultChatThreads(from: discoverPets), userID: user.id)
        }
    }

    private func persistOwnedPets(_ pets: [PetProfile], userID: UUID) async throws {
        let baseDate = Date()
        let records = pets.enumerated().map { index, pet in
            makeOwnedPetRecord(
                pet,
                userID: userID,
                createdAt: baseDate.addingTimeInterval(-Double(index))
            )
        }
        try await saveRecordsInBatches(records)
    }

    private func persistMemories(_ memories: [HolidayMemory], userID: UUID) async throws {
        let baseDate = Date()
        let records = memories.enumerated().map { index, memory in
            makeMemoryRecord(
                memory,
                userID: userID,
                createdAt: baseDate.addingTimeInterval(-Double(index))
            )
        }
        try await saveRecordsInBatches(records)
    }

    private func persistVideos(_ videos: [UploadVideo], userID: UUID) async throws {
        let baseDate = Date()
        let records = videos.enumerated().map { index, video in
            makeVideoRecord(
                video,
                userID: userID,
                createdAt: baseDate.addingTimeInterval(-Double(index))
            )
        }
        try await saveRecordsInBatches(records)
    }

    private func persistPosts(_ posts: [FeedPost], userID: UUID) async throws {
        let baseDate = Date()
        var records: [CKRecord] = []

        for (postIndex, post) in posts.enumerated() {
            let postDate = baseDate.addingTimeInterval(-Double(postIndex))
            records.append(makeFeedPostRecord(post, userID: userID, createdAt: postDate))

            for (commentIndex, comment) in post.comments.enumerated() {
                let commentDate = postDate.addingTimeInterval(Double(commentIndex) * 0.001)
                records.append(
                    makePostCommentRecord(comment, postID: post.id, userID: userID, createdAt: commentDate)
                )
            }
        }

        try await saveRecordsInBatches(records)
    }

    private func persistThreads(_ threads: [ChatThread], userID: UUID) async throws {
        let baseDate = Date()
        var records: [CKRecord] = []

        for (threadIndex, thread) in threads.enumerated() {
            let threadDate = baseDate.addingTimeInterval(-Double(threadIndex))
            records.append(makeChatThreadRecord(thread, userID: userID, createdAt: threadDate))

            for (messageIndex, message) in thread.messages.enumerated() {
                let messageDate = threadDate.addingTimeInterval(Double(messageIndex) * 0.001)
                records.append(
                    makeChatMessageRecord(message, threadID: thread.id, userID: userID, createdAt: messageDate)
                )
            }
        }

        try await saveRecordsInBatches(records)
    }

    private func saveRecordsInBatches(_ records: [CKRecord]) async throws {
        for batch in chunked(records, size: Limits.mutationBatchSize) {
            try await applyRecordChanges(in: database, saving: batch, deleting: [])
        }
    }

    private func deleteAllUserRecords(for userID: UUID) async throws {
        let recordTypes = [
            RecordType.ownedPet,
            RecordType.holidayMemory,
            RecordType.uploadVideo,
            RecordType.feedPost,
            RecordType.postComment,
            RecordType.chatThread,
            RecordType.chatMessage
        ]

        var recordIDs: [CKRecord.ID] = []
        for recordType in recordTypes {
            let allRecords = try await queryAllRecords(in: database, recordType: recordType)
            recordIDs.append(contentsOf: records(for: userID, in: allRecords).map(\.recordID))
        }

        recordIDs.append(recordID(prefix: Prefix.userAccount, uuid: userID))
        for batch in chunked(recordIDs, size: Limits.mutationBatchSize) {
            try await applyRecordChanges(in: database, saving: [], deleting: batch)
        }
    }

    private func loadUser(userID: UUID) async throws -> UserAccount? {
        guard let record = try await fetchRecordIfExists(recordID(prefix: Prefix.userAccount, uuid: userID)) else {
            return nil
        }
        return decodeUser(record)
    }

    private func saveUser(_ user: UserAccount) async throws {
        _ = try await database.save(makeUserRecord(user))
    }

    private func loadSessionUserID() async throws -> UUID? {
        do {
            let record = try await database.record(for: sessionRecordID)
            guard let rawUserID = record[Field.activeUserID] as? String else {
                return nil
            }
            return UUID(uuidString: rawUserID)
        } catch {
            if isUnknownItem(error) {
                return nil
            }
            throw error
        }
    }

    private func saveSessionUserID(_ userID: UUID?) async throws {
        let record = try await loadOrCreateSessionRecord()
        record[Field.activeUserID] = userID?.uuidString as NSString?
        record[Field.updatedAt] = Date() as NSDate
        _ = try await database.save(record)
    }

    private func loadOrCreateSessionRecord() async throws -> CKRecord {
        do {
            return try await database.record(for: sessionRecordID)
        } catch {
            if isUnknownItem(error) {
                return CKRecord(recordType: RecordType.session, recordID: sessionRecordID)
            }
            throw error
        }
    }

    private func fetchRecordIfExists(_ recordID: CKRecord.ID) async throws -> CKRecord? {
        do {
            return try await database.record(for: recordID)
        } catch {
            if isUnknownItem(error) {
                return nil
            }
            throw error
        }
    }

    private var sessionRecordID: CKRecord.ID {
        CKRecord.ID(recordName: "session_current")
    }

    private func recordID(prefix: String, uuid: UUID) -> CKRecord.ID {
        CKRecord.ID(recordName: "\(prefix)_\(uuid.uuidString.lowercased())")
    }

    private func records(for userID: UUID, in records: [CKRecord]) -> [CKRecord] {
        let userIDString = userID.uuidString
        return records.filter { ($0[Field.userID] as? String) == userIDString }
    }

    private func belongsToUser(_ record: CKRecord, userID: UUID) -> Bool {
        (record[Field.userID] as? String) == userID.uuidString
    }

    private func decodeUser(_ record: CKRecord) -> UserAccount? {
        guard
            let idString = record[Field.accountID] as? String,
            let id = UUID(uuidString: idString),
            let displayName = record[Field.displayName] as? String,
            let phone = record[Field.phone] as? String,
            let city = record[Field.city] as? String,
            let bio = record[Field.bio] as? String,
            let avatarSymbol = record[Field.avatarSymbol] as? String
        else {
            return nil
        }

        return UserAccount(
            id: id,
            displayName: displayName,
            phone: phone,
            city: city,
            bio: bio,
            avatarSymbol: avatarSymbol
        )
    }

    private func decodeOwnedPetEntry(_ record: CKRecord) -> (pet: PetProfile, createdAt: Date)? {
        guard
            let id = uuid(from: record[Field.petID]),
            let name = record[Field.name] as? String,
            let species = record[Field.species] as? String,
            let breed = record[Field.breed] as? String,
            let ageText = record[Field.ageText] as? String,
            let city = record[Field.city] as? String,
            let bio = record[Field.bio] as? String,
            let interests = record[Field.interests] as? [String],
            let lookingFor = record[Field.lookingFor] as? String,
            let accentRaw = record[Field.accent] as? String,
            let ownerName = record[Field.ownerName] as? String
        else {
            return nil
        }

        let pet = PetProfile(
            id: id,
            name: name,
            species: species,
            breed: breed,
            ageText: ageText,
            city: city,
            bio: bio,
            interests: interests,
            lookingFor: lookingFor,
            accent: AccentToken(rawValue: accentRaw) ?? .ember,
            ownerName: ownerName,
            vaccinated: boolValue(record[Field.vaccinated])
        )
        return (pet, createdAt(for: record))
    }

    private func decodeMemoryEntry(_ record: CKRecord) -> (memory: HolidayMemory, createdAt: Date)? {
        guard
            let id = uuid(from: record[Field.memoryID]),
            let title = record[Field.title] as? String,
            let subtitle = record[Field.subtitle] as? String,
            let dateText = record[Field.dateText] as? String,
            let ornament = record[Field.ornament] as? String,
            let accentRaw = record[Field.accent] as? String,
            let story = record[Field.story] as? String
        else {
            return nil
        }

        let memory = HolidayMemory(
            id: id,
            title: title,
            subtitle: subtitle,
            dateText: dateText,
            ornament: ornament,
            accent: AccentToken(rawValue: accentRaw) ?? .pine,
            story: story,
            photoAssetPath: MemoryAssetStore.importCloudAsset(record[Field.photoAsset] as? CKAsset, fallbackExtension: "jpg"),
            audioAssetPath: MemoryAssetStore.importCloudAsset(record[Field.audioAsset] as? CKAsset, fallbackExtension: "m4a"),
            audioDisplayName: record[Field.audioDisplayName] as? String
        )
        return (memory, createdAt(for: record))
    }

    private func decodeVideoEntry(_ record: CKRecord) -> (video: UploadVideo, createdAt: Date)? {
        guard
            let id = uuid(from: record[Field.videoID]),
            let title = record[Field.title] as? String,
            let duration = record[Field.duration] as? String,
            let caption = record[Field.caption] as? String,
            let tags = record[Field.tags] as? [String],
            let statusRaw = record[Field.status] as? String,
            let accentRaw = record[Field.accent] as? String,
            let publishDateText = record[Field.publishDateText] as? String
        else {
            return nil
        }

        let video = UploadVideo(
            id: id,
            title: title,
            duration: duration,
            caption: caption,
            tags: tags,
            status: UploadStatus(rawValue: statusRaw) ?? .draft,
            selectedAssetCount: intValue(record[Field.selectedAssetCount]),
            accent: AccentToken(rawValue: accentRaw) ?? .peach,
            publishDateText: publishDateText
        )
        return (video, createdAt(for: record))
    }

    private func decodeFeedPostEntry(_ record: CKRecord) -> (post: FeedPost, createdAt: Date)? {
        guard
            let id = uuid(from: record[Field.postID]),
            let authorName = record[Field.authorName] as? String,
            let petName = record[Field.petName] as? String,
            let topic = record[Field.topic] as? String,
            let city = record[Field.city] as? String,
            let content = record[Field.content] as? String,
            let tags = record[Field.tags] as? [String],
            let createdAtText = record[Field.createdAtText] as? String
        else {
            return nil
        }

        let post = FeedPost(
            id: id,
            relatedPetID: uuid(from: record[Field.relatedPetID]),
            authorName: authorName,
            petName: petName,
            topic: topic,
            city: city,
            content: content,
            tags: tags,
            likes: intValue(record[Field.likes]),
            comments: [],
            likedByCurrentUser: boolValue(record[Field.likedByCurrentUser]),
            createdAtText: createdAtText
        )
        return (post, createdAt(for: record))
    }

    private func decodePostCommentEntry(_ record: CKRecord) -> (postID: UUID, comment: PostComment, createdAt: Date)? {
        guard
            let postID = uuid(from: record[Field.postID]),
            let id = uuid(from: record[Field.commentID]),
            let authorName = record[Field.authorName] as? String,
            let body = record[Field.body] as? String,
            let createdAtText = record[Field.createdAtText] as? String
        else {
            return nil
        }

        let comment = PostComment(
            id: id,
            authorName: authorName,
            body: body,
            createdAtText: createdAtText
        )
        return (postID, comment, createdAt(for: record))
    }

    private func decodeChatThreadEntry(_ record: CKRecord) -> (thread: ChatThread, createdAt: Date)? {
        guard
            let id = uuid(from: record[Field.threadID]),
            let relatedPetID = uuid(from: record[Field.relatedPetID]),
            let title = record[Field.title] as? String,
            let subtitle = record[Field.subtitle] as? String,
            let accentRaw = record[Field.accent] as? String
        else {
            return nil
        }

        let thread = ChatThread(
            id: id,
            relatedPetID: relatedPetID,
            title: title,
            subtitle: subtitle,
            unreadCount: intValue(record[Field.unreadCount]),
            accent: AccentToken(rawValue: accentRaw) ?? .plum,
            messages: []
        )
        return (thread, createdAt(for: record))
    }

    private func decodeChatMessageEntry(_ record: CKRecord) -> (threadID: UUID, message: ChatMessage, createdAt: Date)? {
        guard
            let threadID = uuid(from: record[Field.threadID]),
            let id = uuid(from: record[Field.messageID]),
            let text = record[Field.text] as? String,
            let sentAtText = record[Field.sentAtText] as? String
        else {
            return nil
        }

        let message = ChatMessage(
            id: id,
            text: text,
            isFromCurrentUser: boolValue(record[Field.isFromCurrentUser]),
            sentAtText: sentAtText
        )
        return (threadID, message, createdAt(for: record))
    }

    private func makeUserRecord(_ user: UserAccount) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.userAccount,
            recordID: recordID(prefix: Prefix.userAccount, uuid: user.id)
        )
        record[Field.accountID] = user.id.uuidString as NSString
        record[Field.displayName] = user.displayName as NSString
        record[Field.phone] = user.phone as NSString
        record[Field.city] = user.city as NSString
        record[Field.bio] = user.bio as NSString
        record[Field.avatarSymbol] = user.avatarSymbol as NSString
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeOwnedPetRecord(_ pet: PetProfile, userID: UUID, createdAt: Date) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.ownedPet,
            recordID: recordID(prefix: Prefix.ownedPet, uuid: pet.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.petID] = pet.id.uuidString as NSString
        record[Field.name] = pet.name as NSString
        record[Field.species] = pet.species as NSString
        record[Field.breed] = pet.breed as NSString
        record[Field.ageText] = pet.ageText as NSString
        record[Field.city] = pet.city as NSString
        record[Field.bio] = pet.bio as NSString
        record[Field.interests] = pet.interests as NSArray
        record[Field.lookingFor] = pet.lookingFor as NSString
        record[Field.accent] = pet.accent.rawValue as NSString
        record[Field.ownerName] = pet.ownerName as NSString
        record[Field.vaccinated] = NSNumber(value: pet.vaccinated)
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeMemoryRecord(_ memory: HolidayMemory, userID: UUID, createdAt: Date) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.holidayMemory,
            recordID: recordID(prefix: Prefix.holidayMemory, uuid: memory.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.memoryID] = memory.id.uuidString as NSString
        record[Field.title] = memory.title as NSString
        record[Field.subtitle] = memory.subtitle as NSString
        record[Field.dateText] = memory.dateText as NSString
        record[Field.ornament] = memory.ornament as NSString
        record[Field.accent] = memory.accent.rawValue as NSString
        record[Field.story] = memory.story as NSString
        record[Field.photoAsset] = MemoryAssetStore.url(for: memory.photoAssetPath).map { CKAsset(fileURL: $0) }
        record[Field.audioAsset] = MemoryAssetStore.url(for: memory.audioAssetPath).map { CKAsset(fileURL: $0) }
        record[Field.audioDisplayName] = memory.audioDisplayName as NSString?
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeVideoRecord(_ video: UploadVideo, userID: UUID, createdAt: Date) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.uploadVideo,
            recordID: recordID(prefix: Prefix.uploadVideo, uuid: video.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.videoID] = video.id.uuidString as NSString
        record[Field.title] = video.title as NSString
        record[Field.duration] = video.duration as NSString
        record[Field.caption] = video.caption as NSString
        record[Field.tags] = video.tags as NSArray
        record[Field.status] = video.status.rawValue as NSString
        record[Field.selectedAssetCount] = NSNumber(value: video.selectedAssetCount)
        record[Field.accent] = video.accent.rawValue as NSString
        record[Field.publishDateText] = video.publishDateText as NSString
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeFeedPostRecord(_ post: FeedPost, userID: UUID, createdAt: Date) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.feedPost,
            recordID: recordID(prefix: Prefix.feedPost, uuid: post.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.postID] = post.id.uuidString as NSString
        record[Field.relatedPetID] = post.relatedPetID?.uuidString as NSString?
        record[Field.authorName] = post.authorName as NSString
        record[Field.petName] = post.petName as NSString
        record[Field.topic] = post.topic as NSString
        record[Field.city] = post.city as NSString
        record[Field.content] = post.content as NSString
        record[Field.tags] = post.tags as NSArray
        record[Field.likes] = NSNumber(value: post.likes)
        record[Field.likedByCurrentUser] = NSNumber(value: post.likedByCurrentUser)
        record[Field.createdAtText] = post.createdAtText as NSString
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makePostCommentRecord(
        _ comment: PostComment,
        postID: UUID,
        userID: UUID,
        createdAt: Date
    ) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.postComment,
            recordID: recordID(prefix: Prefix.postComment, uuid: comment.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.commentID] = comment.id.uuidString as NSString
        record[Field.postID] = postID.uuidString as NSString
        record[Field.authorName] = comment.authorName as NSString
        record[Field.body] = comment.body as NSString
        record[Field.createdAtText] = comment.createdAtText as NSString
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeChatThreadRecord(_ thread: ChatThread, userID: UUID, createdAt: Date) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.chatThread,
            recordID: recordID(prefix: Prefix.chatThread, uuid: thread.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.threadID] = thread.id.uuidString as NSString
        record[Field.relatedPetID] = thread.relatedPetID.uuidString as NSString
        record[Field.title] = thread.title as NSString
        record[Field.subtitle] = thread.subtitle as NSString
        record[Field.unreadCount] = NSNumber(value: thread.unreadCount)
        record[Field.accent] = thread.accent.rawValue as NSString
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeChatMessageRecord(
        _ message: ChatMessage,
        threadID: UUID,
        userID: UUID,
        createdAt: Date
    ) -> CKRecord {
        let record = CKRecord(
            recordType: RecordType.chatMessage,
            recordID: recordID(prefix: Prefix.chatMessage, uuid: message.id)
        )
        record[Field.userID] = userID.uuidString as NSString
        record[Field.messageID] = message.id.uuidString as NSString
        record[Field.threadID] = threadID.uuidString as NSString
        record[Field.text] = message.text as NSString
        record[Field.isFromCurrentUser] = NSNumber(value: message.isFromCurrentUser)
        record[Field.sentAtText] = message.sentAtText as NSString
        record[Field.createdAt] = createdAt as NSDate
        record[Field.updatedAt] = Date() as NSDate
        return record
    }

    private func makeSignedOutPayload() -> BootstrapPayload {
        BootstrapPayload(
            currentUser: nil,
            ownedPets: [],
            discoverPets: InMemoryPetBackend.makeDiscoverPets(),
            memories: [],
            uploadVideos: [],
            feedPosts: [],
            chatThreads: []
        )
    }

    private func createdAt(for record: CKRecord) -> Date {
        (record[Field.createdAt] as? Date) ?? record.creationDate ?? Date.distantPast
    }

    private func uuid(from value: Any?) -> UUID? {
        guard let value = value as? String else { return nil }
        return UUID(uuidString: value)
    }

    private func intValue(_ value: Any?) -> Int {
        if let number = value as? NSNumber {
            return number.intValue
        }
        if let value = value as? Int {
            return value
        }
        return 0
    }

    private func boolValue(_ value: Any?) -> Bool {
        if let number = value as? NSNumber {
            return number.boolValue
        }
        if let value = value as? Bool {
            return value
        }
        return false
    }

    private func isUnknownItem(_ error: Error) -> Bool {
        guard let ckError = error as? CKError else {
            return false
        }

        return ckError.code == .unknownItem
    }
}

@MainActor
@Observable
final class AppModel {
    private let backend: any PetBackend

    var isLoaded = false
    var isBusy = false
    var currentUser: UserAccount?
    var ownedPets: [PetProfile] = []
    var discoverPets: [PetProfile] = []
    var holidayMemories: [HolidayMemory] = []
    var uploadVideos: [UploadVideo] = []
    var feedPosts: [FeedPost] = []
    var chatThreads: [ChatThread] = []

    init(backend: (any PetBackend)? = nil) {
        self.backend = backend ?? PetBackendFactory.makeDefaultBackend()
    }

    var isAuthenticated: Bool {
        currentUser != nil
    }

    var publishedVideos: [UploadVideo] {
        uploadVideos.filter { $0.status == .published || $0.status == .reviewing }
    }

    var pendingVideos: [UploadVideo] {
        uploadVideos.filter { $0.status == .draft || $0.status == .uploading }
    }

    func loadIfNeeded() async {
        guard !isLoaded else { return }
        isBusy = true
        apply(await backend.bootstrap())
        isBusy = false
        isLoaded = true
    }

    func signIn(_ draft: SignInDraft) async {
        isBusy = true
        apply(await backend.signIn(with: draft))
        isBusy = false
    }

    func signOut() async {
        isBusy = true
        apply(await backend.signOut())
        isBusy = false
    }

    func addPet(_ draft: PetDraft) async {
        guard let currentUser else { return }
        isBusy = true
        apply(await backend.addPet(draft, owner: currentUser))
        isBusy = false
    }

    func addMemory(_ draft: MemoryDraft) async {
        isBusy = true
        apply(await backend.addMemory(draft))
        isBusy = false
    }

    func createVideo(_ draft: VideoDraft, selectedAssetCount: Int) async {
        isBusy = true
        apply(await backend.createVideo(draft, selectedAssetCount: selectedAssetCount))
        isBusy = false
    }

    func createPost(_ draft: PostDraft, petName: String) async {
        guard let currentUser else { return }
        isBusy = true
        apply(await backend.createPost(draft, user: currentUser, petName: petName))
        isBusy = false
    }

    func toggleLike(postID: UUID) async {
        apply(await backend.toggleLike(postID: postID))
    }

    func addComment(postID: UUID, text: String) async {
        guard let currentUser else { return }
        apply(await backend.addComment(postID: postID, text: text, userName: currentUser.displayName))
    }

    func openChat(for pet: PetProfile) async -> UUID? {
        let result = await backend.openChat(for: pet)
        apply(result.0)
        return result.1
    }

    func sendMessage(threadID: UUID, text: String) async {
        apply(await backend.sendMessage(threadID: threadID, text: text))
    }

    func thread(for id: UUID) -> ChatThread? {
        chatThreads.first(where: { $0.id == id })
    }

    func post(for id: UUID) -> FeedPost? {
        feedPosts.first(where: { $0.id == id })
    }

    private func apply(_ payload: BootstrapPayload) {
        currentUser = payload.currentUser
        ownedPets = payload.ownedPets
        discoverPets = payload.discoverPets
        holidayMemories = payload.memories
        uploadVideos = payload.uploadVideos
        feedPosts = payload.feedPosts
        chatThreads = payload.chatThreads
    }
}
