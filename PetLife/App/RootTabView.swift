import SwiftUI

struct RootTabView: View {
    let appModel: AppModel

    var body: some View {
        TabView {
            NavigationStack {
                HomeDashboardView(appModel: appModel)
            }
            .tabItem {
                Label("首页", systemImage: "pawprint.circle.fill")
            }

            NavigationStack {
                ChristmasTreeAlbumView(memories: appModel.holidayMemories)
            }
            .tabItem {
                Label("圣诞树", systemImage: "tree.fill")
            }

            NavigationStack {
                VideoUploadView(appModel: appModel)
            }
            .tabItem {
                Label("视频", systemImage: "play.rectangle.fill")
            }

            NavigationStack {
                PetMatchView(appModel: appModel)
            }
            .tabItem {
                Label("相亲角", systemImage: "heart.circle.fill")
            }
        }
        .tint(PetTheme.accent)
    }
}

#Preview {
    RootTabView(appModel: AppModel())
}
