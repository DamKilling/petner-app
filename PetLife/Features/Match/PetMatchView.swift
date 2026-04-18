import SwiftUI

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
                    PostRow(post: post, likeAction: {
                        Task {
                            await appModel.toggleLike(postID: post.id)
                        }
                    })
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

private struct PostRow: View {
    let post: FeedPost
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
                    PostRow(post: post, likeAction: {
                        Task {
                            await appModel.toggleLike(postID: post.id)
                        }
                    })

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

private struct PostComposerSheet: View {
    @Binding var draft: PostDraft
    let petOptions: [String]
    let isBusy: Bool
    let publishAction: (String) -> Void

    @State private var selectedPet = ""

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
            }
            .navigationTitle("发布动态")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("发布") {
                        publishAction(selectedPet.isEmpty ? (petOptions.first ?? "我的宠物") : selectedPet)
                    }
                    .disabled(draft.content.isEmpty || petOptions.isEmpty || isBusy)
                }
            }
        }
    }

    private var selectedPetBinding: Binding<String> {
        Binding(
            get: { selectedPet.isEmpty ? (petOptions.first ?? "") : selectedPet },
            set: { selectedPet = $0 }
        )
    }
}

#Preview {
    NavigationStack {
        PetMatchView(appModel: AppModel())
    }
}
