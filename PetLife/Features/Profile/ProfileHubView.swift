import SwiftUI

struct ProfileHubView: View {
    let appModel: AppModel

    @State private var isShowingPetSheet = false
    @State private var petDraft = PetDraft()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let currentUser = appModel.currentUser {
                    ProfileHeader(user: currentUser)
                }

                PetSection(
                    pets: appModel.ownedPets,
                    addAction: { isShowingPetSheet = true }
                )

                MyMessagesEntry(appModel: appModel)

                Button("退出当前账号", action: handleSignOut)
                    .fontWeight(.semibold)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("我的")
        .sheet(isPresented: $isShowingPetSheet) {
            AddPetSheet(
                draft: $petDraft,
                isBusy: appModel.isBusy,
                saveAction: handleAddPet
            )
        }
    }

    private func handleSignOut() {
        Task {
            await appModel.signOut()
        }
    }

    private func handleAddPet() {
        let draftToSave = petDraft
        Task {
            await appModel.addPet(draftToSave)
            petDraft = PetDraft()
            isShowingPetSheet = false
        }
    }
}

private struct ProfileHeader: View {
    let user: UserAccount

    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 14) {
                    Image(systemName: user.avatarSymbol)
                        .font(.system(size: 34))
                        .foregroundStyle(.white)
                        .frame(width: 72, height: 72)
                        .background(PetTheme.accent, in: Circle())

                    VStack(alignment: .leading, spacing: 6) {
                        Text(user.displayName)
                            .font(.title3.weight(.bold))
                        Text("\(user.city) · \(user.phone)")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Text(user.bio)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(3)
            }
            .layoutPriority(1)

            Spacer(minLength: 0)

            PetHeroArtwork(name: "hero-profile", width: 104)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(22)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct PetSection: View {
    let pets: [PetProfile]
    let addAction: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                HStack(spacing: 10) {
                    PetFeatureIcon(name: "feature-profile", size: 28)
                    Text("我的宠物档案")
                        .font(.title3.weight(.semibold))
                }
                Spacer()
                Button("新增档案", action: addAction)
                    .font(.subheadline.weight(.semibold))
            }

            ForEach(pets) { pet in
                VStack(alignment: .leading, spacing: 10) {
                    Text("\(pet.name) · \(pet.species) · \(pet.breed)")
                        .font(.headline)
                    Text("\(pet.ageText) · \(pet.city)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(pet.bio)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(2)

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
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
        }
    }
}

private struct MyMessagesEntry: View {
    let appModel: AppModel

    private var unreadCount: Int {
        appModel.chatThreads.reduce(ServiceInboxThread.samplesUnreadCount) { partialResult, thread in
            partialResult + thread.unreadCount
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("消息中心")
                .font(.title3.weight(.semibold))

            NavigationLink {
                MessageInboxView(appModel: appModel)
            } label: {
                HStack(spacing: 14) {
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [AccentToken.plum.color.opacity(0.22), PetTheme.accent.opacity(0.12)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 58, height: 58)
                        .overlay(
                            Image(systemName: "tray.full.fill")
                                .font(.system(size: 24, weight: .semibold))
                                .foregroundStyle(AccentToken.plum.color)
                        )

                    VStack(alignment: .leading, spacing: 5) {
                        Text("我的消息")
                            .font(.headline)
                            .foregroundStyle(PetTheme.ink)
                        Text("接收服务咨询和宠物交友消息，并继续回复聊天。")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(2)
                    }

                    Spacer()

                    if unreadCount > 0 {
                        Text("\(unreadCount)")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 6)
                            .background(PetTheme.accent, in: Capsule())
                    }

                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
                .padding(16)
                .background(.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            }
            .buttonStyle(.plain)
        }
    }
}

private struct MessageInboxView: View {
    let appModel: AppModel

    @State private var serviceThreads = ServiceInboxThread.samples

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                inboxHeader

                MessageThreadSection(title: "服务消息") {
                    ForEach($serviceThreads) { $thread in
                        NavigationLink {
                            ServiceInboxChatView(thread: $thread)
                        } label: {
                            MessageThreadRow(
                                icon: thread.icon,
                                title: thread.title,
                                subtitle: thread.subtitle,
                                source: thread.source,
                                unreadCount: thread.unreadCount,
                                accent: thread.accent
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }

                MessageThreadSection(title: "交友消息") {
                    if appModel.chatThreads.isEmpty {
                        EmptyInboxCard(text: "还没有宠物交友消息。去相亲角发起聊天后，对话会出现在这里。")
                    } else {
                        ForEach(appModel.chatThreads) { thread in
                            NavigationLink {
                                ChatThreadView(appModel: appModel, threadID: thread.id)
                            } label: {
                                MessageThreadRow(
                                    icon: "bubble.left.and.bubble.right.fill",
                                    title: thread.title,
                                    subtitle: thread.subtitle,
                                    source: "宠物相亲角",
                                    unreadCount: thread.unreadCount,
                                    accent: thread.accent
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("我的消息")
    }

    private var inboxHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("消息盒子")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(PetTheme.ink)
            Text("这里集中接收服务页面和宠物相亲角发来的消息，用户可以点进会话继续回复。")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

private struct MessageThreadSection<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(PetTheme.ink)

            content
        }
    }
}

private struct MessageThreadRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let source: String
    let unreadCount: Int
    let accent: AccentToken

    var body: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(accent.color.opacity(0.2))
                .frame(width: 48, height: 48)
                .overlay(
                    Image(systemName: icon)
                        .foregroundStyle(accent.color)
                )

            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(PetTheme.ink)
                    Text(source)
                        .font(.caption2.weight(.semibold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(accent.color.opacity(0.1), in: Capsule())
                        .foregroundStyle(accent.color)
                }

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(2)
            }

            Spacer()

            if unreadCount > 0 {
                Text("\(unreadCount)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 6)
                    .background(PetTheme.accent, in: Capsule())
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }
}

private struct EmptyInboxCard: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }
}

private struct ServiceInboxChatView: View {
    @Binding var thread: ServiceInboxThread

    @State private var draft = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(thread.messages) { message in
                        HStack {
                            if message.isFromCurrentUser {
                                Spacer()
                            }

                            Text(message.text)
                                .font(.subheadline)
                                .padding(14)
                                .background(
                                    message.isFromCurrentUser ? thread.accent.color : Color.white,
                                    in: RoundedRectangle(cornerRadius: 18, style: .continuous)
                                )
                                .foregroundStyle(message.isFromCurrentUser ? .white : PetTheme.ink)

                            if !message.isFromCurrentUser {
                                Spacer()
                            }
                        }
                    }
                }
                .padding(20)
            }

            HStack(spacing: 12) {
                TextField("输入回复", text: $draft)
                    .textFieldStyle(.roundedBorder)

                Button("发送", action: send)
                    .buttonStyle(.borderedProminent)
                    .tint(thread.accent.color)
                    .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(16)
            .background(.thinMaterial)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(thread.title)
        .onAppear {
            thread.unreadCount = 0
        }
    }

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else {
            return
        }

        thread.messages.append(ServiceInboxMessage(id: UUID(), text: text, isFromCurrentUser: true, sentAtText: "刚刚"))
        thread.subtitle = text
        thread.unreadCount = 0
        draft = ""
    }
}

private struct ServiceInboxThread: Identifiable, Hashable {
    let id: UUID
    var title: String
    var subtitle: String
    var source: String
    var icon: String
    var unreadCount: Int
    var accent: AccentToken
    var messages: [ServiceInboxMessage]

    static var samplesUnreadCount: Int {
        samples.reduce(0) { $0 + $1.unreadCount }
    }

    static let samples: [ServiceInboxThread] = [
        ServiceInboxThread(
            id: UUID(uuidString: "B1000000-0000-0000-0000-000000000001") ?? UUID(),
            title: "暖爪家庭寄养",
            subtitle: "你好，可以先发一下宠物年龄和寄养日期吗？",
            source: "服务 · 寄养",
            icon: "house.fill",
            unreadCount: 1,
            accent: .mint,
            messages: [
                ServiceInboxMessage(id: UUID(), text: "你好，我看到你在服务页咨询寄养。", isFromCurrentUser: false, sentAtText: "今天 10:20"),
                ServiceInboxMessage(id: UUID(), text: "可以先发一下宠物年龄、性格和寄养日期吗？", isFromCurrentUser: false, sentAtText: "今天 10:22")
            ]
        ),
        ServiceInboxThread(
            id: UUID(uuidString: "B1000000-0000-0000-0000-000000000002") ?? UUID(),
            title: "毛球造型研究所",
            subtitle: "本周六下午还有一个基础护理档期。",
            source: "服务 · 美容",
            icon: "scissors",
            unreadCount: 0,
            accent: .peach,
            messages: [
                ServiceInboxMessage(id: UUID(), text: "本周六下午还有一个基础护理档期。", isFromCurrentUser: false, sentAtText: "昨天 16:40"),
                ServiceInboxMessage(id: UUID(), text: "如果宠物比较怕吹风，可以提前备注。", isFromCurrentUser: false, sentAtText: "昨天 16:41")
            ]
        ),
        ServiceInboxThread(
            id: UUID(uuidString: "B1000000-0000-0000-0000-000000000003") ?? UUID(),
            title: "安安宠物医院",
            subtitle: "体检预约可以带上疫苗本和既往检查记录。",
            source: "服务 · 医院",
            icon: "cross.case.fill",
            unreadCount: 1,
            accent: .ember,
            messages: [
                ServiceInboxMessage(id: UUID(), text: "你好，体检预约可以带上疫苗本和既往检查记录。", isFromCurrentUser: false, sentAtText: "今天 09:18")
            ]
        )
    ]
}

private struct ServiceInboxMessage: Identifiable, Hashable {
    let id: UUID
    var text: String
    var isFromCurrentUser: Bool
    var sentAtText: String
}

private struct AddPetSheet: View {
    @Binding var draft: PetDraft
    let isBusy: Bool
    let saveAction: () -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("基础信息") {
                    TextField("名字", text: $draft.name)
                    TextField("物种，例如狗狗/猫咪", text: $draft.species)
                    TextField("品种", text: $draft.breed)
                    TextField("年龄", text: $draft.ageText)
                    TextField("城市", text: $draft.city)
                }

                Section("社交标签") {
                    TextField("简介", text: $draft.bio, axis: .vertical)
                    TextField("兴趣，用空格分开", text: $draft.interestsText)
                    TextField("想找怎样的伙伴", text: $draft.lookingFor)
                    Toggle("已完成基础疫苗", isOn: $draft.vaccinated)
                }
            }
            .navigationTitle("新增宠物档案")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("保存", action: saveAction)
                        .disabled(draft.name.isEmpty || draft.breed.isEmpty || isBusy)
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        ProfileHubView(appModel: AppModel())
    }
}
