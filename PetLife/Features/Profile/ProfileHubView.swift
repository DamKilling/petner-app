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

                ChatInboxSection(appModel: appModel)

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
                Text("我的宠物档案")
                    .font(.title3.weight(.semibold))
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

private struct ChatInboxSection: View {
    let appModel: AppModel

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("聊天入口")
                .font(.title3.weight(.semibold))

            ForEach(appModel.chatThreads) { thread in
                NavigationLink {
                    ChatThreadView(appModel: appModel, threadID: thread.id)
                } label: {
                    HStack(spacing: 14) {
                        Circle()
                            .fill(thread.accent.color.opacity(0.2))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Image(systemName: "bubble.left.and.bubble.right.fill")
                                    .foregroundStyle(thread.accent.color)
                            )

                        VStack(alignment: .leading, spacing: 4) {
                            Text(thread.title)
                                .font(.headline)
                                .foregroundStyle(PetTheme.ink)
                            Text(thread.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        if thread.unreadCount > 0 {
                            Text("\(thread.unreadCount)")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 6)
                                .background(PetTheme.accent, in: Capsule())
                        }
                    }
                    .padding(16)
                    .background(.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
            }
        }
    }
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
