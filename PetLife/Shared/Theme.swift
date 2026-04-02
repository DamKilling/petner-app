import SwiftUI

enum PetTheme {
    static let accent = Color(red: 0.86, green: 0.24, blue: 0.22)
    static let pine = Color(red: 0.10, green: 0.36, blue: 0.26)
    static let cream = Color(red: 0.98, green: 0.95, blue: 0.88)
    static let gold = Color(red: 0.95, green: 0.75, blue: 0.24)
    static let ink = Color(red: 0.16, green: 0.17, blue: 0.22)
    static let softBackground = Color(red: 0.95, green: 0.94, blue: 0.92)

    static let dashboardGradient = LinearGradient(
        colors: [
            Color(red: 0.16, green: 0.42, blue: 0.31),
            Color(red: 0.10, green: 0.21, blue: 0.17),
            Color(red: 0.55, green: 0.14, blue: 0.16)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

extension AccentToken {
    var color: Color {
        switch self {
        case .ember:
            return Color(red: 0.84, green: 0.24, blue: 0.20)
        case .pine:
            return Color(red: 0.14, green: 0.48, blue: 0.32)
        case .sky:
            return Color(red: 0.34, green: 0.55, blue: 0.88)
        case .peach:
            return Color(red: 0.95, green: 0.62, blue: 0.28)
        case .plum:
            return Color(red: 0.56, green: 0.26, blue: 0.55)
        case .mint:
            return Color(red: 0.24, green: 0.71, blue: 0.58)
        }
    }
}
