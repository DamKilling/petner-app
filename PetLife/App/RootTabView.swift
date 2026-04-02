import Observation
import SwiftUI

struct RootTabView: View {
    @Bindable var appModel: AppModel

    @State private var selectedTab: AppTab = .home

    var body: some View {
        Group {
            if appModel.isLoaded {
                if appModel.isAuthenticated {
                    authenticatedShell
                } else {
                    AuthenticationView(appModel: appModel)
                }
            } else {
                ProgressView("正在准备 PetLife")
                    .tint(PetTheme.accent)
                    .task {
                        await appModel.loadIfNeeded()
                    }
            }
        }
        .animation(.smooth, value: appModel.isAuthenticated)
    }

    private var authenticatedShell: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                HomeDashboardView(appModel: appModel)
            }
            .tabItem {
                Label("首页", systemImage: "house.fill")
            }
            .tag(AppTab.home)

            NavigationStack {
                ChristmasTreeAlbumView(appModel: appModel)
            }
            .tabItem {
                Label("相册树", systemImage: "tree.fill")
            }
            .tag(AppTab.tree)

            NavigationStack {
                VideoUploadView(appModel: appModel)
            }
            .tabItem {
                Label("视频", systemImage: "play.rectangle.fill")
            }
            .tag(AppTab.videos)

            NavigationStack {
                PetMatchView(appModel: appModel)
            }
            .tabItem {
                Label("社交", systemImage: "heart.circle.fill")
            }
            .tag(AppTab.match)

            NavigationStack {
                ProfileHubView(appModel: appModel)
            }
            .tabItem {
                Label("我的", systemImage: "person.crop.circle.fill")
            }
            .tag(AppTab.profile)
        }
        .tint(PetTheme.accent)
    }
}

#Preview {
    RootTabView(appModel: AppModel())
}
