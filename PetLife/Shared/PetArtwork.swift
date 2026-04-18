import SwiftUI

struct PetHeroArtwork: View {
    let name: String
    var width: CGFloat
    var alignment: Alignment = .center

    var body: some View {
        Image(name)
            .resizable()
            .interpolation(.high)
            .antialiased(true)
            .scaledToFit()
            .frame(maxWidth: width, alignment: alignment)
            .shadow(color: .black.opacity(0.08), radius: 18, y: 10)
            .accessibilityHidden(true)
    }
}

struct PetHeroCopyBox<Content: View>: View {
    var maxWidth: CGFloat
    let content: Content

    init(maxWidth: CGFloat, @ViewBuilder content: () -> Content) {
        self.maxWidth = maxWidth
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .frame(maxWidth: maxWidth, alignment: .leading)
        .padding(18)
        .background(.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.16), lineWidth: 1)
        )
    }
}

struct PetFeatureIcon: View {
    let name: String
    var size: CGFloat = 44

    var body: some View {
        Image(name)
            .resizable()
            .interpolation(.high)
            .antialiased(true)
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

struct PetTabIcon: View {
    let name: String

    var body: some View {
        Image(name)
            .renderingMode(.template)
            .resizable()
            .interpolation(.high)
            .antialiased(true)
            .scaledToFit()
            .frame(width: 22, height: 22)
            .accessibilityHidden(true)
    }
}
