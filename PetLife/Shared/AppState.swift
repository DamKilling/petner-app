import Foundation
import Observation

actor InMemoryPetBackend {
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
            story: draft.story
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

    private static func makeDiscoverPets() -> [PetProfile] {
        [
            PetProfile(
                id: UUID(),
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
                id: UUID(),
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
                id: UUID(),
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

    private static func makeDefaultOwnedPets(for user: UserAccount) -> [PetProfile] {
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

    private static func makeDefaultMemories() -> [HolidayMemory] {
        [
            HolidayMemory(
                id: UUID(),
                title: "初雪见面",
                subtitle: "把领养那天的照片挂上树尖，像点亮了新的家庭故事。",
                dateText: "2025.12.03",
                ornament: "sparkles",
                accent: .ember,
                story: "我们第一次见面是在下雪天。它从航空箱里探出头时很安静，但那一瞬间我知道它要成为家里的一员。"
            ),
            HolidayMemory(
                id: UUID(),
                title: "第一件圣诞毛衣",
                subtitle: "记录宠物成长节点，每一张都能挂成一个节日愿望。",
                dateText: "2025.12.10",
                ornament: "gift.fill",
                accent: .pine,
                story: "第一次试穿圣诞毛衣，它居然没有挣扎，还会自己走到圣诞树前找镜头。"
            ),
            HolidayMemory(
                id: UUID(),
                title: "全家福夜灯",
                subtitle: "把视频、语音和照片组合成会发光的树枝故事线。",
                dateText: "2025.12.24",
                ornament: "star.fill",
                accent: .peach,
                story: "那一晚我们录了视频、留下了语音祝福，也第一次把宠物成长故事整理成了一个完整相册。"
            )
        ]
    }

    private static func makeDefaultUploadVideos() -> [UploadVideo] {
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

    private static func makeDefaultFeedPosts(from discoverPets: [PetProfile]) -> [FeedPost] {
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

    private static func makeDefaultChatThreads(from discoverPets: [PetProfile]) -> [ChatThread] {
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

@MainActor
@Observable
final class AppModel {
    private let backend = InMemoryPetBackend()

    var isLoaded = false
    var isBusy = false
    var currentUser: UserAccount?
    var ownedPets: [PetProfile] = []
    var discoverPets: [PetProfile] = []
    var holidayMemories: [HolidayMemory] = []
    var uploadVideos: [UploadVideo] = []
    var feedPosts: [FeedPost] = []
    var chatThreads: [ChatThread] = []

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
