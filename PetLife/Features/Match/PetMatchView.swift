import SwiftUI

struct PetMatchView: View {
    let appModel: AppModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                MatchHero()
                MatchProfileCarousel(pets: appModel.featuredPets)
                CommunityFeed(posts: appModel.nearbyPosts)
            }
            .padding(20)
        }
        .background(Color(.secondarySystemBackground))
        .navigationTitle("宠物相亲角")
    }
}

private struct MatchHero: View {
    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.96, green: 0.51, blue: 0.30),
                            Color(red: 0.90, green: 0.23, blue: 0.33),
                            Color(red: 0.37, green: 0.12, blue: 0.24)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)

            VStack(alignment: .leading, spacing: 10) {
                Text("像社交媒体一样去认识新朋友")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("结合同城动态、宠物档案、兴趣标签和互动入口，让宠物社交不只是一张名片。")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.84))
            }
            .padding(24)
        }
    }
}

private struct MatchProfileCarousel: View {
    let pets: [PetProfile]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("推荐档案")
                .font(.title3.weight(.semibold))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(pets) { pet in
                        PetProfileCard(pet: pet)
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
                        colors: [pet.accent, pet.accent.opacity(0.45)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 250, height: 180)
                .overlay(
                    Image(systemName: "pawprint.fill")
                        .font(.system(size: 42))
                        .foregroundStyle(.white.opacity(0.78))
                )

            VStack(alignment: .leading, spacing: 6) {
                Text("\(pet.name) · \(pet.breed)")
                    .font(.headline)
                Text("\(pet.age) · \(pet.city)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(pet.bio)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            HStack(spacing: 8) {
                ForEach(pet.interests, id: \.self) { interest in
                    Text(interest)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(pet.accent.opacity(0.12), in: Capsule())
                }
            }
        }
        .padding(16)
        .frame(width: 282, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

private struct CommunityFeed: View {
    let posts: [FeedPost]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("同城动态")
                .font(.title3.weight(.semibold))

            ForEach(posts) { post in
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(post.author) · \(post.petName)")
                                .font(.headline)
                            Text(post.topic)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(PetTheme.accent)
                        }
                        Spacer()
                        Image(systemName: "ellipsis")
                            .foregroundStyle(.secondary)
                    }

                    Text(post.content)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 18) {
                        Label("\(post.likes)", systemImage: "heart")
                        Label("\(post.comments)", systemImage: "bubble.right")
                        Label("私信", systemImage: "paperplane")
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
        }
    }
}

#Preview {
    NavigationStack {
        PetMatchView(appModel: AppModel())
    }
}
