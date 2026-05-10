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
                Label {
                    Text("首页")
                } icon: {
                    PetTabIcon(name: "tab-home")
                }
            }
            .tag(AppTab.home)

            NavigationStack {
                AlbumTreeView(appModel: appModel)
            }
            .tabItem {
                Label {
                    Text("相册树")
                } icon: {
                    PetTabIcon(name: "tab-tree")
                }
            }
            .tag(AppTab.tree)

            NavigationStack {
                PetServicesView()
            }
            .tabItem {
                Label {
                    Text("服务")
                } icon: {
                    Image(systemName: "cross.case.fill")
                }
            }
            .tag(AppTab.services)

            NavigationStack {
                PetMatchView(appModel: appModel)
            }
            .tabItem {
                Label {
                    Text("社交")
                } icon: {
                    PetTabIcon(name: "tab-social")
                }
            }
            .tag(AppTab.match)

            NavigationStack {
                ProfileHubView(appModel: appModel)
            }
            .tabItem {
                Label {
                    Text("我的")
                } icon: {
                    PetTabIcon(name: "tab-profile")
                }
            }
            .tag(AppTab.profile)
        }
        .tint(PetTheme.accent)
    }
}

#Preview {
    RootTabView(appModel: AppModel())
}
