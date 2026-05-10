import AVFoundation
import AVKit
import PhotosUI
import SwiftUI
import UniformTypeIdentifiers
import UIKit

struct PetMatchView: View {
    let appModel: AppModel

    @State private var isShowingComposer = false
    @State private var composerDraft = PostDraft()
    @State private var activeThreadRoute: ActiveThreadRoute?
    @State private var activePostRoute: ActivePostRoute?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                MatchHero()
                MatchProfileCarousel(appModel: appModel, activeThreadRoute: $activeThreadRoute)
                MyPostsSection(appModel: appModel, showComposerAction: {
                    isShowingComposer = true
                })
                PetFriendMatchEntry(appModel: appModel, activeThreadRoute: $activeThreadRoute)
                CommunityFeed(
                    appModel: appModel,
                    activeThreadRoute: $activeThreadRoute,
                    activePostRoute: $activePostRoute
                )
            }
            .padding(20)
        }
        .background(Color(.secondarySystemBackground))
        .navigationTitle("宠物相亲角")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("发动态") {
                    isShowingComposer = true
                }
            }
        }
        .sheet(isPresented: $isShowingComposer) {
            PostComposerSheet(
                draft: $composerDraft,
                petOptions: appModel.ownedPets.map(\.name),
                isBusy: appModel.isBusy,
                publishAction: handlePublishPost
            )
        }
        .sheet(item: $activeThreadRoute) { route in
            NavigationStack {
                ChatThreadView(appModel: appModel, threadID: route.id)
            }
        }
        .navigationDestination(item: $activePostRoute) { route in
            PostDetailView(appModel: appModel, postID: route.id)
        }
    }

    private func handlePublishPost(selectedPet: String) {
        let draftToSave = composerDraft
        Task {
            await appModel.createPost(draftToSave, petName: selectedPet)
            composerDraft = PostDraft()
            isShowingComposer = false
        }
    }
}

private struct ActiveThreadRoute: Identifiable {
    let id: UUID
}

private struct ActivePostRoute: Identifiable,Hashable {
    let id: UUID
}

private struct MatchHero: View {
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [AccentToken.peach.color, AccentToken.ember.color, AccentToken.plum.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 276)

            PetHeroArtwork(name: "hero-social", width: 148)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 220) {
                    Text("像社交媒体一样去认识新朋友")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.86)

                    Text("推荐档案承接发现，动态详情承接了解，聊天入口承接意向转化。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.84))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct MatchProfileCarousel: View {
    let appModel: AppModel
    @Binding var activeThreadRoute: ActiveThreadRoute?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("推荐档案")
                .font(.title3.weight(.semibold))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(appModel.discoverPets) { pet in
                        NavigationLink {
                            PetDetailView(appModel: appModel, pet: pet, activeThreadRoute: $activeThreadRoute)
                        } label: {
                            PetProfileCard(pet: pet)
                        }
                    }
                }
            }
        }
    }
}

private struct PetProfileCard: View {
    let pet: PetProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [pet.accent.color, pet.accent.color.opacity(0.45)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 250, height: 180)
                .overlay(
                    PetFeatureIcon(name: "feature-social", size: 84)
                )

            VStack(alignment: .leading, spacing: 6) {
                Text("\(pet.name) · \(pet.breed)")
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                Text("\(pet.ageText) · \(pet.city)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(pet.bio)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(2)
            }

            HStack(spacing: 8) {
                ForEach(pet.interests, id: \.self) { interest in
                    Text(interest)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(pet.accent.color.opacity(0.12), in: Capsule())
                }
            }
        }
        .padding(16)
        .frame(width: 282, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct CommunityFeed: View {
    let appModel: AppModel
    @Binding var activeThreadRoute: ActiveThreadRoute?
    @Binding var activePostRoute: ActivePostRoute?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("同城动态")
                .font(.title3.weight(.semibold))

            ForEach(appModel.feedPosts) { post in
                NavigationLink {
                    PostDetailView(appModel: appModel, postID: post.id)
                } label: {
                    PostRow(
                        post: post,
                        attachment: appModel.mediaAttachment(for: post.id),
                        likeAction: {
                            Task {
                                await appModel.toggleLike(postID: post.id)
                            }
                        }
                    )
                }
                .contextMenu {
                    Button("进入详情") {
                        activePostRoute = ActivePostRoute(id: post.id)
                    }
                    Button("发起聊天") {
                        handleMessage(for: post)
                    }
                }
            }
        }
    }

    private func handleMessage(for post: FeedPost) {
        guard
            let relatedPetID = post.relatedPetID,
            let pet = appModel.discoverPets.first(where: { $0.id == relatedPetID })
        else {
            return
        }

        Task {
            if let id = await appModel.openChat(for: pet) {
                activeThreadRoute = ActiveThreadRoute(id: id)
            }
        }
    }
}

private struct MyPostsSection: View {
    let appModel: AppModel
    let showComposerAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("我的动态")
                    .font(.title3.weight(.semibold))
                Spacer()
                NavigationLink("查看全部") {
                    MyPostsHubView(appModel: appModel)
                }
                .font(.subheadline.weight(.semibold))
            }

            if appModel.myPosts.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("你还没有发布过动态。")
                        .font(.headline)
                        .foregroundStyle(PetTheme.ink)
                    Text("从右上角发一条带图片或视频的动态，这里就会展示你已经发布的内容。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)

                    Button("现在发动态", action: showComposerAction)
                        .buttonStyle(.borderedProminent)
                        .tint(PetTheme.accent)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(appModel.myPosts) { post in
                            NavigationLink {
                                PostDetailView(appModel: appModel, postID: post.id)
                            } label: {
                                MyPostCard(
                                    post: post,
                                    attachment: appModel.mediaAttachment(for: post.id)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.vertical, 2)
                }
            }
        }
    }
}

private struct MyPostCard: View {
    let post: FeedPost
    let attachment: PostMediaAttachment?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            PostMediaPreview(attachment: attachment, height: 180)

            Text(post.topic)
                .font(.headline)
                .foregroundStyle(PetTheme.ink)
                .lineLimit(1)

            Text(post.content)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(2)

            HStack(spacing: 14) {
                Label("\(post.likes)", systemImage: post.likedByCurrentUser ? "heart.fill" : "heart")
                Label("\(post.comments.count)", systemImage: "bubble.right")
                Text(post.createdAtText)
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(16)
        .frame(width: 250, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct PetFriendMatchEntry: View {
    let appModel: AppModel
    @Binding var activeThreadRoute: ActiveThreadRoute?

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("宠物交友一键匹配")
                .font(.title3.weight(.semibold))

            NavigationLink {
                PetFriendMatchView(appModel: appModel, activeThreadRoute: $activeThreadRoute)
            } label: {
                HStack(alignment: .top, spacing: 14) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [AccentToken.peach.color.opacity(0.22), AccentToken.plum.color.opacity(0.14)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        Image(systemName: "sparkles")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(PetTheme.accent)
                    }
                    .frame(width: 82, height: 82)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("智能推荐附近合拍宠友")
                            .font(.headline)
                            .foregroundStyle(PetTheme.ink)
                        Text("按体型、性格、期望交友对象和地区近远综合匹配，一键找到更合适的玩伴。")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(3)

                        HStack(spacing: 8) {
                            ForEach(["同体型", "同频性格", "近距离"], id: \.self) { tag in
                                Text(tag)
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(PetTheme.accent.opacity(0.1), in: Capsule())
                                    .foregroundStyle(PetTheme.accent)
                            }
                        }
                    }

                    Spacer(minLength: 0)

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .padding(.top, 6)
                }
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
            .buttonStyle(.plain)
        }
    }
}

private struct PetFriendMatchView: View {
    let appModel: AppModel
    @Binding var activeThreadRoute: ActiveThreadRoute?

    @State private var selectedPetID: UUID?

    private var selectedPet: PetProfile? {
        let fallback = appModel.ownedPets.first
        guard let selectedPetID else {
            return fallback
        }
        return appModel.ownedPets.first { $0.id == selectedPetID } ?? fallback
    }

    private var matchResults: [PetFriendMatchResult] {
        guard let selectedPet else {
            return []
        }

        return PetFriendMatcher.results(for: selectedPet, candidates: appModel.discoverPets)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                matchIntro

                if appModel.ownedPets.isEmpty {
                    emptyOwnedPetCard
                } else {
                    petPicker
                    matchRuleCard

                    ForEach(matchResults) { result in
                        PetFriendMatchResultCard(result: result, chatAction: {
                            openChat(for: result.pet)
                        })
                    }
                }
            }
            .padding(20)
        }
        .background(Color(.secondarySystemBackground))
        .navigationTitle("一键匹配")
        .onAppear {
            if selectedPetID == nil {
                selectedPetID = appModel.ownedPets.first?.id
            }
        }
    }

    private var matchIntro: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("宠物交友智能匹配")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(PetTheme.ink)
                .fixedSize(horizontal: false, vertical: true)

            Text("系统会读取宠物档案里的品种、体型关键词、性格描述、主人期望对象和城市信息，优先推送地区更近、特征更合拍的宠友。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var emptyOwnedPetCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("还没有可用于匹配的宠物档案")
                .font(.headline)
                .foregroundStyle(PetTheme.ink)
            Text("先在“我的”里新增宠物档案，填写品种、性格和期望交友对象后，就可以进行一键匹配。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var petPicker: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("选择要匹配的宠物")
                .font(.headline)
                .foregroundStyle(PetTheme.ink)

            Picker("选择要匹配的宠物", selection: selectedPetIDBinding) {
                ForEach(appModel.ownedPets) { pet in
                    Text("\(pet.name) · \(pet.breed)").tag(Optional(pet.id))
                }
            }
            .pickerStyle(.menu)

            if let selectedPet {
                Text("\(selectedPet.city) · \(selectedPet.bio)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var selectedPetIDBinding: Binding<UUID?> {
        Binding(
            get: { selectedPetID ?? appModel.ownedPets.first?.id },
            set: { selectedPetID = $0 }
        )
    }

    private var matchRuleCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("匹配机制")
                .font(.headline)
                .foregroundStyle(PetTheme.ink)

            MatchRuleRow(icon: "pawprint.fill", title: "体型优先", detail: "小型犬优先匹配小型犬，同物种、同体型加权更高。")
            MatchRuleRow(icon: "heart.text.square.fill", title: "性格同频", detail: "安静匹配安静，活泼匹配活泼，按档案描述和兴趣关键词识别。")
            MatchRuleRow(icon: "scope", title: "期望对象", detail: "如果主人写明想找某个品种，比如金毛想认识萨摩耶，会额外提高匹配分。")
            MatchRuleRow(icon: "location.fill", title: "地区近优先", detail: "同城优先，其次推送周边城市，降低见面和遛宠成本。")
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func openChat(for pet: PetProfile) {
        Task {
            if let id = await appModel.openChat(for: pet) {
                activeThreadRoute = ActiveThreadRoute(id: id)
            }
        }
    }
}

private struct MatchRuleRow: View {
    let icon: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(PetTheme.accent)
                .frame(width: 22)
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

private struct PetFriendMatchResultCard: View {
    let result: PetFriendMatchResult
    let chatAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 14) {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [result.pet.accent.color, result.pet.accent.color.opacity(0.42)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 92, height: 92)
                    .overlay(PetFeatureIcon(name: "feature-social", size: 42))

                VStack(alignment: .leading, spacing: 7) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("\(result.pet.name) · \(result.pet.breed)")
                            .font(.headline)
                            .foregroundStyle(PetTheme.ink)
                            .lineLimit(2)
                        Spacer(minLength: 8)
                        Text("\(result.score)分")
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(result.pet.accent.color.opacity(0.12), in: Capsule())
                            .foregroundStyle(result.pet.accent.color)
                    }

                    Text("\(result.pet.ageText) · \(result.pet.city) · \(result.distanceLabel)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(result.pet.accent.color)
                    Text(result.pet.bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(3)
                }
            }

            HStack(spacing: 8) {
                ForEach(result.pet.interests.prefix(3), id: \.self) { interest in
                    Text(interest)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(result.pet.accent.color.opacity(0.1), in: Capsule())
                        .foregroundStyle(result.pet.accent.color)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("推荐理由")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)

                ForEach(result.reasons, id: \.self) { reason in
                    HStack(alignment: .top, spacing: 8) {
                        Circle()
                            .fill(result.pet.accent.color.opacity(0.35))
                            .frame(width: 6, height: 6)
                            .padding(.top, 6)
                        Text(reason)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }

            Button("发起聊天", action: chatAction)
                .buttonStyle(.borderedProminent)
                .tint(result.pet.accent.color)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct PetFriendMatchResult: Identifiable, Hashable {
    var id: UUID { pet.id }
    let pet: PetProfile
    let score: Int
    let reasons: [String]
    let distanceLabel: String
}

private enum PetFriendMatcher {
    static func results(for pet: PetProfile, candidates: [PetProfile]) -> [PetFriendMatchResult] {
        candidates
            .map { candidate in
                score(pet: pet, candidate: candidate)
            }
            .sorted {
                if $0.score == $1.score {
                    return cityPriority(from: pet.city, to: $0.pet.city) > cityPriority(from: pet.city, to: $1.pet.city)
                }
                return $0.score > $1.score
            }
    }

    private static func score(pet: PetProfile, candidate: PetProfile) -> PetFriendMatchResult {
        var score = 0
        var reasons: [String] = []

        if pet.species == candidate.species {
            score += 15
            reasons.append("同为\(pet.species)，互动方式更接近。")
        }

        let petSize = sizeBucket(for: pet)
        let candidateSize = sizeBucket(for: candidate)
        if petSize == candidateSize {
            score += 25
            reasons.append("\(petSize)体型接近，见面玩耍更安全。")
        }

        let sharedPersonalities = personalityTags(for: pet).intersection(personalityTags(for: candidate))
        if !sharedPersonalities.isEmpty {
            score += 24
            reasons.append("性格关键词同频：\(sharedPersonalities.sorted().joined(separator: "、"))。")
        }

        let expectedBreedHits = expectedBreeds(in: pet).filter { candidate.breed.contains($0) || candidate.bio.contains($0) }
        if !expectedBreedHits.isEmpty {
            score += 24
            reasons.append("符合主人期望的交友对象：\(expectedBreedHits.joined(separator: "、"))。")
        }

        let sharedInterests = Set(pet.interests).intersection(Set(candidate.interests))
        if !sharedInterests.isEmpty {
            score += min(16, sharedInterests.count * 8)
            reasons.append("共同兴趣：\(sharedInterests.sorted().joined(separator: "、"))。")
        }

        let cityScore = cityPriority(from: pet.city, to: candidate.city)
        score += cityScore
        reasons.append(cityReason(from: pet.city, to: candidate.city))

        if reasons.isEmpty {
            reasons.append("档案信息完整，可先从线上聊天了解彼此。")
        }

        return PetFriendMatchResult(
            pet: candidate,
            score: min(score, 100),
            reasons: Array(reasons.prefix(4)),
            distanceLabel: cityDistanceLabel(from: pet.city, to: candidate.city)
        )
    }

    private static func sizeBucket(for pet: PetProfile) -> String {
        let text = searchableText(for: pet)
        if text.contains("小型") || text.contains("柯基") || text.contains("比熊") || text.contains("泰迪") || text.contains("博美") || text.contains("吉娃娃") {
            return "小型"
        }
        if text.contains("金毛") || text.contains("拉布拉多") || text.contains("阿拉斯加") || text.contains("德牧") || text.contains("大型") {
            return "大型"
        }
        if text.contains("萨摩耶") || text.contains("边牧") || text.contains("柴犬") || text.contains("中型") {
            return "中型"
        }
        if pet.species.contains("猫") {
            return "猫咪"
        }
        return "相近"
    }

    private static func personalityTags(for pet: PetProfile) -> Set<String> {
        let text = searchableText(for: pet)
        var tags = Set<String>()
        if text.contains("安静") || text.contains("温柔") || text.contains("慢热") || text.contains("稳定") {
            tags.insert("安静稳定")
        }
        if text.contains("活泼") || text.contains("社交") || text.contains("跑") || text.contains("飞盘") || text.contains("户外") {
            tags.insert("活泼外向")
        }
        if text.contains("亲人") || text.contains("黏人") || text.contains("陪伴") {
            tags.insert("亲人陪伴")
        }
        return tags
    }

    private static func expectedBreeds(in pet: PetProfile) -> [String] {
        let knownBreeds = ["金毛", "萨摩耶", "柯基", "布偶猫", "比熊", "柴犬", "边牧", "拉布拉多", "泰迪", "博美"]
        let text = "\(pet.lookingFor) \(pet.bio) \(pet.interests.joined(separator: " "))"
        return knownBreeds.filter { breed in
            breed != pet.breed && text.contains(breed)
        }
    }

    private static func cityPriority(from origin: String, to candidate: String) -> Int {
        if origin == candidate {
            return 20
        }
        if nearbyCities(for: origin).contains(candidate) {
            return 12
        }
        return 5
    }

    private static func nearbyCities(for city: String) -> Set<String> {
        switch city {
        case "上海":
            return ["苏州", "杭州", "南京"]
        case "杭州":
            return ["上海", "苏州", "宁波"]
        case "苏州":
            return ["上海", "杭州", "南京"]
        default:
            return []
        }
    }

    private static func cityReason(from origin: String, to candidate: String) -> String {
        if origin == candidate {
            return "同城优先推送，线下见面和遛宠更方便。"
        }
        if nearbyCities(for: origin).contains(candidate) {
            return "\(candidate)属于周边城市，适合周末约见。"
        }
        return "地区距离较远，建议先线上熟悉。"
    }

    private static func cityDistanceLabel(from origin: String, to candidate: String) -> String {
        if origin == candidate {
            return "同城优先"
        }
        if nearbyCities(for: origin).contains(candidate) {
            return "周边城市"
        }
        return "可线上认识"
    }

    private static func searchableText(for pet: PetProfile) -> String {
        "\(pet.species) \(pet.breed) \(pet.bio) \(pet.interests.joined(separator: " ")) \(pet.lookingFor)"
    }
}

private struct PostRow: View {
    let post: FeedPost
    let attachment: PostMediaAttachment?
    let likeAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(post.authorName) · \(post.petName)")
                        .font(.headline)
                        .foregroundStyle(PetTheme.ink)
                    Text("\(post.topic) · \(post.city)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(PetTheme.accent)
                }
                Spacer()
                Text(post.createdAtText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(post.content)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(3)

            if attachment != nil {
                PostMediaPreview(attachment: attachment, height: 190)
            }

            HStack(spacing: 8) {
                ForEach(post.tags, id: \.self) { tag in
                    Text("#\(tag)")
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                        .background(Color.secondary.opacity(0.08), in: Capsule())
                }
            }

            HStack(spacing: 18) {
                Button(action: likeAction) {
                    Label("\(post.likes)", systemImage: post.likedByCurrentUser ? "heart.fill" : "heart")
                }
                .buttonStyle(.plain)

                Label("\(post.comments.count)", systemImage: "bubble.right")
                Label("详情", systemImage: "arrow.right.circle")
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct PetDetailView: View {
    let appModel: AppModel
    let pet: PetProfile
    @Binding var activeThreadRoute: ActiveThreadRoute?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                RoundedRectangle(cornerRadius: 32, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [pet.accent.color, pet.accent.color.opacity(0.45)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 250)
                    .overlay(
                        PetHeroArtwork(name: "hero-social", width: 190)
                    )

                Text("\(pet.name) · \(pet.breed)")
                    .font(.largeTitle.weight(.bold))
                Text("\(pet.species) · \(pet.ageText) · \(pet.city)")
                    .font(.headline)
                    .foregroundStyle(.secondary)
                Text(pet.bio)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                Text("想找的关系")
                    .font(.headline)
                Text(pet.lookingFor)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                Button("发起聊天", action: openChat)
                    .buttonStyle(.borderedProminent)
                    .tint(PetTheme.accent)
            }
            .padding(20)
        }
        .navigationTitle("宠物档案")
    }

    private func openChat() {
        Task {
            if let id = await appModel.openChat(for: pet) {
                activeThreadRoute = ActiveThreadRoute(id: id)
            }
        }
    }
}

private struct PostDetailView: View {
    let appModel: AppModel
    let postID: UUID

    @State private var commentText = ""

    private var post: FeedPost? {
        appModel.post(for: postID)
    }

    var body: some View {
        ScrollView {
            if let post {
                VStack(alignment: .leading, spacing: 18) {
                    if let attachment = appModel.mediaAttachment(for: post.id) {
                        PostMediaDetail(attachment: attachment)
                    }

                    PostRow(
                        post: post,
                        attachment: nil,
                        likeAction: {
                            Task {
                                await appModel.toggleLike(postID: post.id)
                            }
                        }
                    )

                    VStack(alignment: .leading, spacing: 12) {
                        Text("评论")
                            .font(.title3.weight(.semibold))

                        ForEach(post.comments) { comment in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(comment.authorName)
                                    .font(.headline)
                                Text(comment.body)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                Text(comment.createdAtText)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        }

                        TextField("补一句你的想法", text: $commentText, axis: .vertical)
                            .textFieldStyle(.roundedBorder)

                        Button("发布评论", action: handleAddComment)
                            .buttonStyle(.borderedProminent)
                            .tint(PetTheme.accent)
                            .disabled(commentText.isEmpty)
                    }
                }
                .padding(20)
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("动态详情")
    }

    private func handleAddComment() {
        let text = commentText
        Task {
            await appModel.addComment(postID: postID, text: text)
            commentText = ""
        }
    }
}

private struct PostMediaDetail: View {
    let attachment: PostMediaAttachment

    var body: some View {
        if let fileURL = MemoryAssetStore.url(for: attachment.localAssetPath) {
            Group {
                switch attachment.kind {
                case .image:
                    if let image = UIImage(contentsOfFile: fileURL.path) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                    } else {
                        MediaPlaceholder(kind: attachment.kind, title: attachment.displayName)
                    }
                case .video:
                    VideoPlayer(player: AVPlayer(url: fileURL))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 320)
            .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        } else {
            MediaPlaceholder(kind: attachment.kind, title: attachment.displayName)
                .frame(height: 320)
        }
    }
}

struct ChatThreadView: View {
    let appModel: AppModel
    let threadID: UUID

    @State private var draft = ""

    private var thread: ChatThread? {
        appModel.thread(for: threadID)
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    if let thread {
                        ForEach(thread.messages) { message in
                            HStack {
                                if message.isFromCurrentUser {
                                    Spacer()
                                }

                                Text(message.text)
                                    .font(.subheadline)
                                    .padding(14)
                                    .background(
                                        message.isFromCurrentUser ? PetTheme.accent : Color.white,
                                        in: RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    )
                                    .foregroundStyle(message.isFromCurrentUser ? .white : PetTheme.ink)

                                if !message.isFromCurrentUser {
                                    Spacer()
                                }
                            }
                        }
                    }
                }
                .padding(20)
            }

            HStack(spacing: 12) {
                TextField("输入消息", text: $draft)
                    .textFieldStyle(.roundedBorder)

                Button("发送", action: handleSend)
                    .buttonStyle(.borderedProminent)
                    .tint(PetTheme.accent)
                    .disabled(draft.isEmpty)
            }
            .padding(16)
            .background(.thinMaterial)
        }
        .navigationTitle(thread?.title ?? "聊天")
        .background(Color(.systemGroupedBackground))
    }

    private func handleSend() {
        let text = draft
        Task {
            await appModel.sendMessage(threadID: threadID, text: text)
            draft = ""
        }
    }
}

private struct MyPostsHubView: View {
    let appModel: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if appModel.myPosts.isEmpty {
                    Text("这里还没有你发布的动态。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(18)
                        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                } else {
                    ForEach(appModel.myPosts) { post in
                        NavigationLink {
                            PostDetailView(appModel: appModel, postID: post.id)
                        } label: {
                            PostRow(
                                post: post,
                                attachment: appModel.mediaAttachment(for: post.id),
                                likeAction: {
                                    Task {
                                        await appModel.toggleLike(postID: post.id)
                                    }
                                }
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("我的动态")
    }
}

private struct PostComposerSheet: View {
    @Binding var draft: PostDraft
    let petOptions: [String]
    let isBusy: Bool
    let publishAction: (String) -> Void

    @State private var selectedPet = ""
    @State private var selectedMediaItem: PhotosPickerItem?
    @State private var mediaErrorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("动态内容") {
                    Picker("关联宠物", selection: selectedPetBinding) {
                        ForEach(petOptions, id: \.self) { pet in
                            Text(pet).tag(pet)
                        }
                    }
                    TextField("主题", text: $draft.topic)
                    TextField("城市", text: $draft.city)
                    TextField("正文", text: $draft.content, axis: .vertical)
                    TextField("标签，空格分隔", text: $draft.tagsText)
                }

                Section("图片或视频") {
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
                            draft.mediaAssetPath == nil ? "选择\(draft.mediaKind.rawValue)" : "重新选择\(draft.mediaKind.rawValue)",
                            systemImage: draft.mediaKind == .image ? "photo" : "video"
                        )
                    }

                    if let attachment = draft.mediaAttachment {
                        PostMediaPreview(attachment: attachment, height: 180)
                            .padding(.vertical, 4)
                    }

                    if let mediaErrorMessage {
                        Text(mediaErrorMessage)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("发布动态")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("发布") {
                        publishAction(selectedPet.isEmpty ? (petOptions.first ?? "我的宠物") : selectedPet)
                    }
                    .disabled(draft.content.isEmpty || draft.mediaAssetPath == nil || petOptions.isEmpty || isBusy)
                }
            }
            .task(id: selectedMediaItem) {
                await importSelectedMedia()
            }
        }
    }

    private var selectedPetBinding: Binding<String> {
        Binding(
            get: { selectedPet.isEmpty ? (petOptions.first ?? "") : selectedPet },
            set: { selectedPet = $0 }
        )
    }

    private func importSelectedMedia() async {
        guard let selectedMediaItem else { return }
        mediaErrorMessage = nil

        let preferredType = selectedMediaItem.supportedContentTypes.first
        let preferredExtension = preferredType?.preferredFilenameExtension ?? (draft.mediaKind == .image ? "jpg" : "mov")

        do {
            guard let data = try await selectedMediaItem.loadTransferable(type: Data.self) else {
                mediaErrorMessage = "没有读取到媒体内容。"
                return
            }

            let assetPath = try MemoryAssetStore.saveBinaryData(data, preferredExtension: preferredExtension)
            draft.mediaAssetPath = assetPath
            draft.mediaDisplayName = selectedMediaItem.itemIdentifier ?? "\(draft.mediaKind.rawValue).\(preferredExtension)"
        } catch {
            mediaErrorMessage = "导入\(draft.mediaKind.rawValue)失败，请重试。"
        }
    }
}

private struct PostMediaPreview: View {
    let attachment: PostMediaAttachment?
    let height: CGFloat

    var body: some View {
        Group {
            if let attachment, let fileURL = MemoryAssetStore.url(for: attachment.localAssetPath) {
                switch attachment.kind {
                case .image:
                    if let image = UIImage(contentsOfFile: fileURL.path) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                    } else {
                        MediaPlaceholder(kind: attachment.kind, title: attachment.displayName)
                    }
                case .video:
                    if let thumbnail = videoThumbnail(for: fileURL) {
                        Image(uiImage: thumbnail)
                            .resizable()
                            .scaledToFill()
                            .overlay(alignment: .center) {
                                Image(systemName: "play.circle.fill")
                                    .font(.system(size: 34))
                                    .foregroundStyle(.white)
                                    .shadow(radius: 10)
                            }
                    } else {
                        MediaPlaceholder(kind: attachment.kind, title: attachment.displayName)
                    }
                }
            } else {
                MediaPlaceholder(kind: .image, title: "暂未选择媒体")
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    private func videoThumbnail(for url: URL) -> UIImage? {
        let asset = AVAsset(url: url)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 900, height: 900)
        do {
            let cgImage = try generator.copyCGImage(at: .zero, actualTime: nil)
            return UIImage(cgImage: cgImage)
        } catch {
            return nil
        }
    }
}

private struct MediaPlaceholder: View {
    let kind: PostMediaKind
    let title: String

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [AccentToken.peach.color.opacity(0.65), AccentToken.plum.color.opacity(0.72)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 10) {
                Image(systemName: kind == .image ? "photo.on.rectangle.angled" : "play.rectangle.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(.white)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 14)
            }
        }
    }
}

#Preview {
    NavigationStack {
        PetMatchView(appModel: AppModel())
    }
}
