import SwiftUI

struct VideoUploadView: View {
    let appModel: AppModel

    var body: some View {
        AlbumTreeView(appModel: appModel)
    }
}

#Preview {
    NavigationStack {
        VideoUploadView(appModel: AppModel())
    }
}
