import SwiftUI

struct AuthenticationView: View {
    let appModel: AppModel

    @State private var draft = SignInDraft()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                AuthHero()

                VStack(alignment: .leading, spacing: 16) {
                    Text("开始你的 PetLife")
                        .font(.title2.weight(.bold))

                    Text("先建立账号，我们就能把宠物档案、视频、动态和聊天都串成一条完整体验。")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    PetTextField(title: "你的昵称", text: $draft.displayName, prompt: "例如：阿宁")
                    PetTextField(title: "手机号", text: $draft.phone, prompt: "用于后续真实登录接入")
                    PetTextField(title: "所在城市", text: $draft.city, prompt: "例如：上海")

                    Button(action: handleSignIn) {
                        HStack {
                            if appModel.isBusy {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("进入产品原型")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(PetTheme.accent)
                    .disabled(draft.displayName.isEmpty || draft.phone.isEmpty || appModel.isBusy)
                }
                .padding(24)
                .background(.white, in: RoundedRectangle(cornerRadius: 30, style: .continuous))

                ValueGrid()
            }
            .padding(20)
        }
        .background(PetTheme.softBackground)
    }

    private func handleSignIn() {
        Task {
            await appModel.signIn(draft)
        }
    }
}

private struct AuthHero: View {
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(PetTheme.dashboardGradient)
                .frame(height: 300)

            PetHeroArtwork(name: "hero-auth", width: 146)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 228) {
                    Text("宠物从成长到陪伴关系的完整 App")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.86)

                    Text("把成长记录、视频内容、同城互动和聊天入口收进一个产品壳里，这一版已经具备真实流程的雏形。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.85))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)

                    HStack(spacing: 10) {
                        AuthPill(label: "登录")
                        AuthPill(label: "档案")
                        AuthPill(label: "上传")
                        AuthPill(label: "社交")
                    }
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct ValueGrid: View {
    var body: some View {
        VStack(spacing: 14) {
            ValueCard(iconName: "feature-profile", title: "宠物档案", detail: "建立宠物基础资料、关系偏好和社交标签。")
            ValueCard(iconName: "feature-video", title: "视频发布", detail: "本地选视频、进入上传队列，再扩展到云端存储。")
            ValueCard(iconName: "feature-social", title: "动态和聊天", detail: "动态流承接曝光，聊天承接意向沟通。")
        }
    }
}

private struct ValueCard: View {
    let iconName: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            PetFeatureIcon(name: iconName, size: 40)

            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.headline)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(.white.opacity(0.8), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct AuthPill: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.85)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.white.opacity(0.15), in: Capsule())
    }
}

private struct PetTextField: View {
    let title: String
    @Binding var text: String
    let prompt: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
            TextField(prompt, text: $text)
                .textInputAutocapitalization(.never)
                .padding(14)
                .background(Color(.systemGroupedBackground), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}

#Preview {
    AuthenticationView(appModel: AppModel())
}
