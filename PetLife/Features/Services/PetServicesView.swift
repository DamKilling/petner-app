import PhotosUI
import SwiftUI
import UIKit

struct PetServicesView: View {
    @State private var selectedCategory: PetServiceCategory = .boarding
    @State private var boardingProviders = BoardingProvider.samples
    @State private var groomingShops = GroomingShop.samples
    @State private var hospitals = PetHospital.samples

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ServiceHero()

                Picker("服务类型", selection: $selectedCategory) {
                    ForEach(PetServiceCategory.allCases, id: \.self) { category in
                        Text(category.title).tag(category)
                    }
                }
                .pickerStyle(.segmented)

                switch selectedCategory {
                case .boarding:
                    BoardingSection(providers: $boardingProviders)
                case .grooming:
                    GroomingSection(shops: $groomingShops)
                case .hospital:
                    HospitalSection(hospitals: $hospitals)
                }
            }
            .padding(20)
        }
        .background(Color(.secondarySystemBackground))
        .navigationTitle("服务")
    }

    private func handleUpload(_ result: ServiceUploadResult) {
        switch result {
        case .boarding(let provider):
            boardingProviders.insert(provider, at: 0)
            selectedCategory = .boarding
        case .grooming(let shop):
            groomingShops.insert(shop, at: 0)
            selectedCategory = .grooming
        case .hospital(let hospital):
            hospitals.insert(hospital, at: 0)
            selectedCategory = .hospital
        }
    }
}

private enum PetServiceCategory: String, CaseIterable {
    case boarding
    case grooming
    case hospital

    var title: String {
        switch self {
        case .boarding:
            return "宠物寄养"
        case .grooming:
            return "宠物美容"
        case .hospital:
            return "医院预约"
        }
    }

    var uploadTitle: String {
        switch self {
        case .boarding:
            return "上传寄养资料"
        case .grooming:
            return "上传美容服务"
        case .hospital:
            return "上传医院信息"
        }
    }

    var listTitle: String {
        switch self {
        case .boarding:
            return "寄养家庭筛选与沟通"
        case .grooming:
            return "宠物美容筛选与沟通"
        case .hospital:
            return "宠物医院筛选与预约"
        }
    }

    var listDetail: String {
        switch self {
        case .boarding:
            return "浏览家庭或店铺上传的环境、寄养条件和适合宠物类型，再联系主人沟通。"
        case .grooming:
            return "查看店铺上传的服务项目、环境图片和护理说明，再私信确认档期。"
        case .hospital:
            return "查看医院上传的地址、电话、预约项目和诊疗能力，再私信预约时间。"
        }
    }
}

private enum ServiceUploadResult {
    case boarding(BoardingProvider)
    case grooming(GroomingShop)
    case hospital(PetHospital)
}

private struct ServiceHero: View {
    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [AccentToken.sky.color, AccentToken.mint.color, AccentToken.peach.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 292)

            PetHeroArtwork(name: "hero-profile", width: 148)
                .padding(.trailing, 18)
                .padding(.bottom, 18)

            VStack(alignment: .leading, spacing: 0) {
                PetHeroCopyBox(maxWidth: 236) {
                    PetFeatureIcon(name: "feature-profile", size: 48)

                    Text("筛选服务，再直接沟通")
                        .font(.system(size: 29, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.84)

                    Text("寄养家庭、宠物店铺和医院都能上传条件与服务，用户看完详情后发起私信咨询。")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.86))
                        .fixedSize(horizontal: false, vertical: true)
                        .lineLimit(4)
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct BoardingSection: View {
    @Binding var providers: [BoardingProvider]

    private var visibleProviders: [BoardingProvider] {
        providers.filter { !$0.isUserUploaded }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ForEach(visibleProviders) { provider in
                NavigationLink {
                    BoardingDetailView(provider: provider, providers: $providers)
                } label: {
                    ServiceProviderCard(
                        title: provider.name,
                        subtitle: provider.type.rawValue,
                        detail: provider.summary,
                        accent: provider.accent,
                        systemImage: provider.type == .shop ? "storefront.fill" : "house.fill",
                        imageAssetPath: provider.imageAssetPath,
                        tags: provider.environmentTags
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }
}

private struct GroomingSection: View {
    @Binding var shops: [GroomingShop]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ServiceCategoryDescriptionCard(category: .grooming)

            ForEach(shops) { shop in
                GroomingProviderUploadCard(shop: shop, shops: $shops)
            }
        }
    }
}

private struct HospitalSection: View {
    @Binding var hospitals: [PetHospital]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            ServiceCategoryHeader(category: .hospital, uploadAction: handleHospitalUpload)

            ForEach(hospitals) { hospital in
                NavigationLink {
                    HospitalDetailView(hospital: hospital, hospitals: $hospitals)
                } label: {
                    ServiceProviderCard(
                        title: hospital.name,
                        subtitle: hospital.address,
                        detail: hospital.summary,
                        accent: hospital.accent,
                        systemImage: "cross.case.fill",
                        imageAssetPath: hospital.imageAssetPath,
                        tags: hospital.services
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func handleHospitalUpload(_ result: ServiceUploadResult) {
        guard case .hospital(let newHospital) = result else {
            return
        }

        hospitals.insert(newHospital, at: 0)
    }
}

private struct ServiceCategoryHeader: View {
    let category: PetServiceCategory
    let uploadAction: (ServiceUploadResult) -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text(category.listTitle)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)
                Text(category.listDetail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            NavigationLink {
                ServiceUploadForm(category: category, saveAction: uploadAction)
            } label: {
                Label("发布/上传", systemImage: "plus")
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .background(PetTheme.accent, in: Capsule())
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct ServiceCategoryDescriptionCard: View {
    let category: PetServiceCategory

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(category.listTitle)
                .font(.title3.weight(.semibold))
                .foregroundStyle(PetTheme.ink)
            Text(category.listDetail)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct ServiceProviderCard: View {
    let title: String
    let subtitle: String
    let detail: String
    let accent: AccentToken
    let systemImage: String
    let imageAssetPath: String?
    let tags: [String]

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ServiceImagePreview(
                imageAssetPath: imageAssetPath,
                accent: accent,
                systemImage: systemImage,
                height: 88
            )
            .frame(width: 92)

            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                    .lineLimit(2)
                Text(subtitle)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(accent.color)
                    .lineLimit(2)
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(3)

                TagWrap(tags: Array(tags.prefix(3)), accent: accent)
            }

            Spacer(minLength: 0)

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct GroomingProviderUploadCard: View {
    let shop: GroomingShop
    @Binding var shops: [GroomingShop]

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            NavigationLink {
                GroomingDetailView(shop: shop, shops: $shops)
            } label: {
                HStack(alignment: .top, spacing: 14) {
                    ServiceImagePreview(
                        imageAssetPath: shop.imageAssetPath,
                        accent: shop.accent,
                        systemImage: "scissors",
                        height: 88
                    )
                    .frame(width: 92)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(shop.name)
                            .font(.headline)
                            .foregroundStyle(PetTheme.ink)
                            .lineLimit(2)
                        Text(shop.address)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(shop.accent.color)
                            .lineLimit(2)
                        Text(shop.summary)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineLimit(3)

                        TagWrap(tags: Array(shop.highlights.prefix(3)), accent: shop.accent)
                    }
                }
            }
            .buttonStyle(.plain)

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 12) {
                NavigationLink {
                    ServiceUploadForm(category: .grooming, saveAction: handleGroomingUpload)
                } label: {
                    Label("发布/上传", systemImage: "plus")
                        .font(.caption.weight(.semibold))
                        .lineLimit(1)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 8)
                        .background(PetTheme.accent, in: Capsule())
                        .foregroundStyle(.white)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    GroomingDetailView(shop: shop, shops: $shops)
                } label: {
                    Image(systemName: "chevron.right")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private func handleGroomingUpload(_ result: ServiceUploadResult) {
        guard case .grooming(let newShop) = result else {
            return
        }

        shops.insert(newShop, at: 0)
    }
}

private struct BoardingDetailView: View {
    let provider: BoardingProvider
    @Binding var providers: [BoardingProvider]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ServiceCategoryHeader(category: .boarding, uploadAction: handleBoardingUpload)

                BoardingDetailHeader(provider: provider)

                if provider.type == .home {
                    HomeProviderChoicesSection(
                        currentProviderID: provider.id,
                        providers: $providers
                    )
                }

                CompactDetailBlock(title: "环境标签", rows: provider.environmentTags)
                DetailBlock(title: "寄养条件", rows: provider.conditions)
                DetailBlock(title: "适合宠物", rows: provider.petFit)
            }
            .padding(20)
            .padding(.bottom, 88)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("寄养详情")
        .safeAreaInset(edge: .bottom) {
            DetailContactBar(title: provider.name, accent: provider.accent, label: "联系主人")
        }
    }

    private func handleBoardingUpload(_ result: ServiceUploadResult) {
        guard case .boarding(let newProvider) = result else {
            return
        }

        providers.insert(newProvider, at: 0)
    }
}

private struct BoardingDetailHeader: View {
    let provider: BoardingProvider

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            ServiceImagePreview(
                imageAssetPath: provider.imageAssetPath,
                accent: provider.accent,
                systemImage: provider.type == .shop ? "storefront.fill" : "house.fill",
                height: 178
            )

            VStack(alignment: .leading, spacing: 8) {
                Text(provider.name)
                    .font(.system(size: 38, weight: .bold, design: .rounded))
                    .foregroundStyle(PetTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)

                Text(provider.type.rawValue)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(provider.accent.color)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

private struct HomeProviderChoicesSection: View {
    let currentProviderID: UUID
    @Binding var providers: [BoardingProvider]

    private var homeProviders: [BoardingProvider] {
        providers.filter { $0.type == .home && $0.id != currentProviderID }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("个人家庭可选列表")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)

                Text("上传后的家庭图片、寄养情况和适合宠物会展示在这里，方便用户自行比较选择。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if homeProviders.isEmpty {
                Text("暂无个人家庭资料，点击上方发布/上传后会显示在这里。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            } else {
                ForEach(homeProviders) { provider in
                    NavigationLink {
                        BoardingDetailView(provider: provider, providers: $providers)
                    } label: {
                        UploadedHomeProviderCard(provider: provider)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct UploadedHomeProviderCard: View {
    let provider: BoardingProvider

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ServiceImagePreview(
                imageAssetPath: provider.imageAssetPath,
                accent: provider.accent,
                systemImage: "house.fill",
                height: 150
            )

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(provider.name)
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                    .lineLimit(2)

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            Text(provider.summary)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(3)

            TagWrap(tags: Array(provider.environmentTags.prefix(3)), accent: provider.accent)

            if !provider.conditions.isEmpty {
                VStack(alignment: .leading, spacing: 7) {
                    Text("寄养情况")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(PetTheme.ink)

                    ForEach(Array(provider.conditions.prefix(2)), id: \.self) { condition in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(provider.accent.color.opacity(0.32))
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)

                            Text(condition)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct GroomingDetailView: View {
    let shop: GroomingShop
    @Binding var shops: [GroomingShop]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ServiceCategoryHeader(category: .grooming, uploadAction: handleGroomingUpload)

                ServiceVisualHeader(
                    title: shop.name,
                    subtitle: shop.address,
                    accent: shop.accent,
                    systemImage: "scissors",
                    imageAssetPath: shop.imageAssetPath
                )

                DetailBlock(title: "店铺上传服务", rows: shop.uploadedServices)

                GroomingShopChoicesSection(currentShopID: shop.id, shops: $shops)

                DetailBlock(title: "1. 基础护理 Basic Grooming", rows: [
                    "洗澡与吹干：使用宠物专用洗发露和护发素，彻底清洁并吹干毛发，帮助预防皮肤问题。",
                    "修剪指甲：专业修剪或磨光，防止指甲过长导致行走困难或嵌入肉垫。",
                    "清理耳朵：清除耳垢，必要时拔除耳毛，帮助预防耳道感染。",
                    "挤肛门腺：减轻宠物瘙痒感，降低腺体发炎风险。",
                    "眼部清理：清理泪痕和眼角分泌物。"
                ])

                DetailBlock(title: "2. 修剪与造型 Trimming & Styling", rows: [
                    "全身体毛修剪：针对长毛品种修剪特定造型，例如贵宾的泰迪装。",
                    "卫生区域修剪：修剪脚底毛、腹部毛和肛门周围毛发，保持整洁。",
                    "去废毛 De-shedding：换毛期使用专业工具去除深层死毛，减少家中掉毛。"
                ])

                DetailBlock(title: "3. 特色 SPA 与高端服务", rows: [
                    "药浴：针对皮肤敏感或有皮肤问题的宠物使用特定药水。",
                    "美牙服务：刷牙或洁牙，帮助改善口臭和牙结石。",
                    "香薰/精油 SPA：缓解宠物压力，滋养皮肤。",
                    "染色美容：使用安全颜料对耳朵、尾巴进行创意染色。"
                ])
            }
            .padding(20)
            .padding(.bottom, 88)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("美容服务")
        .safeAreaInset(edge: .bottom) {
            DetailContactBar(title: shop.name, accent: shop.accent, label: "联系店铺")
        }
    }

    private func handleGroomingUpload(_ result: ServiceUploadResult) {
        guard case .grooming(let newShop) = result else {
            return
        }

        shops.insert(newShop, at: 0)
    }
}

private struct GroomingShopChoicesSection: View {
    let currentShopID: UUID
    @Binding var shops: [GroomingShop]

    private var otherShops: [GroomingShop] {
        shops.filter { $0.id != currentShopID }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("可选美容店铺")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)

                Text("上传后的店铺图片、服务项目和护理说明会展示在这里，方便用户比较后私信确认档期。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if otherShops.isEmpty {
                Text("暂无其他美容店铺资料，点击上方发布/上传后会显示在这里。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            } else {
                ForEach(otherShops) { shop in
                    NavigationLink {
                        GroomingDetailView(shop: shop, shops: $shops)
                    } label: {
                        GroomingShopChoiceCard(shop: shop)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct GroomingShopChoiceCard: View {
    let shop: GroomingShop

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ServiceImagePreview(
                imageAssetPath: shop.imageAssetPath,
                accent: shop.accent,
                systemImage: "scissors",
                height: 150
            )

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(shop.name)
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                    .lineLimit(2)

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            Text(shop.summary)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(3)

            TagWrap(tags: Array(shop.highlights.prefix(3)), accent: shop.accent)

            if !shop.uploadedServices.isEmpty {
                VStack(alignment: .leading, spacing: 7) {
                    Text("店铺服务")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(PetTheme.ink)

                    ForEach(Array(shop.uploadedServices.prefix(2)), id: \.self) { service in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(shop.accent.color.opacity(0.32))
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)

                            Text(service)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct HospitalDetailView: View {
    let hospital: PetHospital
    @Binding var hospitals: [PetHospital]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ServiceCategoryHeader(category: .hospital, uploadAction: handleHospitalUpload)

                ServiceVisualHeader(
                    title: hospital.name,
                    subtitle: hospital.address,
                    accent: hospital.accent,
                    systemImage: "cross.case.fill",
                    imageAssetPath: hospital.imageAssetPath
                )

                VStack(alignment: .leading, spacing: 10) {
                    ContactRow(icon: "mappin.and.ellipse", text: hospital.address)
                    ContactRow(icon: "phone.fill", text: hospital.phone)
                }
                .padding(18)
                .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))

                DetailBlock(title: "可预约项目", rows: hospital.services)
                HospitalChoicesSection(currentHospitalID: hospital.id, hospitals: $hospitals)
                DetailBlock(title: "医院能力", rows: hospital.capabilities)
            }
            .padding(20)
            .padding(.bottom, 88)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("医院预约")
        .safeAreaInset(edge: .bottom) {
            DetailContactBar(title: hospital.name, accent: hospital.accent, label: "发起咨询")
        }
    }

    private func handleHospitalUpload(_ result: ServiceUploadResult) {
        guard case .hospital(let newHospital) = result else {
            return
        }

        hospitals.insert(newHospital, at: 0)
    }
}

private struct HospitalChoicesSection: View {
    let currentHospitalID: UUID
    @Binding var hospitals: [PetHospital]

    private var otherHospitals: [PetHospital] {
        hospitals.filter { $0.id != currentHospitalID }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("可选宠物医院")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PetTheme.ink)

                Text("上传后的医院地址、电话、预约项目和诊疗能力会展示在这里，方便用户比较后预约时间。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if otherHospitals.isEmpty {
                Text("暂无其他医院资料，点击上方发布/上传后会显示在这里。")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            } else {
                ForEach(otherHospitals) { hospital in
                    NavigationLink {
                        HospitalDetailView(hospital: hospital, hospitals: $hospitals)
                    } label: {
                        HospitalChoiceCard(hospital: hospital)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct HospitalChoiceCard: View {
    let hospital: PetHospital

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ServiceImagePreview(
                imageAssetPath: hospital.imageAssetPath,
                accent: hospital.accent,
                systemImage: "cross.case.fill",
                height: 150
            )

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(hospital.name)
                    .font(.headline)
                    .foregroundStyle(PetTheme.ink)
                    .lineLimit(2)

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            ContactRow(icon: "mappin.and.ellipse", text: hospital.address)
            ContactRow(icon: "phone.fill", text: hospital.phone)

            Text(hospital.summary)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(3)

            TagWrap(tags: Array(hospital.services.prefix(3)), accent: hospital.accent)

            if !hospital.capabilities.isEmpty {
                VStack(alignment: .leading, spacing: 7) {
                    Text("诊疗能力")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(PetTheme.ink)

                    ForEach(Array(hospital.capabilities.prefix(2)), id: \.self) { capability in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(hospital.accent.color.opacity(0.32))
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)

                            Text(capability)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct DetailContactBar: View {
    let title: String
    let accent: AccentToken
    let label: String

    var body: some View {
        NavigationLink {
            ServiceConversationView(title: title, accent: accent)
        } label: {
            Label(label, systemImage: "message.fill")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.borderedProminent)
        .tint(accent.color)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.thinMaterial)
    }
}

private struct ServiceVisualHeader: View {
    let title: String
    let subtitle: String
    let accent: AccentToken
    let systemImage: String
    let imageAssetPath: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            ServiceImagePreview(
                imageAssetPath: imageAssetPath,
                accent: accent,
                systemImage: systemImage,
                height: 230
            )

            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(PetTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(subtitle)
                    .font(.headline)
                    .foregroundStyle(accent.color)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

private struct ServiceUploadForm: View {
    let category: PetServiceCategory
    let saveAction: (ServiceUploadResult) -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var imageAssetPath: String?
    @State private var importErrorMessage: String?

    @State private var providerType: BoardingProvider.ProviderType = .home
    @State private var name = ""
    @State private var address = ""
    @State private var phone = ""
    @State private var summary = ""
    @State private var environmentTagsText = "无幼童 封闭阳台 每日反馈"
    @State private var conditionsText = ""
    @State private var petFitText = ""
    @State private var servicesText = ""
    @State private var capabilitiesText = ""

    var body: some View {
        Form {
            Section("基础信息") {
                if category == .boarding {
                    Picker("类型", selection: $providerType) {
                        ForEach(BoardingProvider.ProviderType.allCases, id: \.self) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }
                }

                TextField(defaultNamePrompt, text: $name)
                if category != .boarding {
                    TextField("地址", text: $address)
                }
                if category == .hospital {
                    TextField("联系电话", text: $phone)
                }
                TextField("简短描述", text: $summary, axis: .vertical)
            }

            Section(imageSectionTitle) {
                PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                    Label(imageAssetPath == nil ? "选择图片" : "更换图片", systemImage: "photo")
                }

                ServiceImagePreview(
                    imageAssetPath: imageAssetPath,
                    accent: .sky,
                    systemImage: category.placeholderIcon,
                    height: 180
                )
                .padding(.vertical, 4)

                if let importErrorMessage {
                    Text(importErrorMessage)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }
            }

            switch category {
            case .boarding:
                Section("寄养筛选信息") {
                    TextField("环境标签，空格分隔", text: $environmentTagsText)
                    TextField("寄养条件，每行一条", text: $conditionsText, axis: .vertical)
                    TextField("适合宠物类型，每行一条", text: $petFitText, axis: .vertical)
                }
            case .grooming:
                Section("店铺服务") {
                    TextField("服务标签，空格分隔", text: $environmentTagsText)
                    TextField("可提供服务，每行一条", text: $servicesText, axis: .vertical)
                }
            case .hospital:
                Section("医院预约信息") {
                    TextField("可预约项目，空格分隔", text: $servicesText)
                    TextField("医院能力，每行一条", text: $capabilitiesText, axis: .vertical)
                }
            }
        }
        .navigationTitle(category.uploadTitle)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("发布", action: save)
                    .disabled(!canSave)
            }
        }
        .task(id: selectedPhotoItem) {
            await importSelectedPhoto()
        }
        .onAppear(perform: applyDefaults)
    }

    private var defaultNamePrompt: String {
        switch category {
        case .boarding:
            return "家庭或店铺名称"
        case .grooming:
            return "宠物店铺名称"
        case .hospital:
            return "宠物医院名称"
        }
    }

    private var imageSectionTitle: String {
        switch category {
        case .boarding:
            return "环境图片"
        case .grooming:
            return "店铺图片"
        case .hospital:
            return "医院图片"
        }
    }

    private var canSave: Bool {
        let hasBase = !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            !summary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        switch category {
        case .boarding:
            return hasBase
        case .grooming:
            return hasBase && !address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .hospital:
            return hasBase &&
                !address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
                !phone.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        }
    }

    private func applyDefaults() {
        guard conditionsText.isEmpty, petFitText.isEmpty, servicesText.isEmpty, capabilitiesText.isEmpty else {
            return
        }

        switch category {
        case .boarding:
            conditionsText = "提供独立休息空间\n每天照片反馈\n可按宠物习惯喂食"
            petFitText = "适合小型犬\n适合性格稳定的猫咪"
        case .grooming:
            environmentTagsText = "基础护理 造型修剪 特色SPA"
            servicesText = "洗澡与吹干\n修剪指甲\n清理耳朵\n去废毛\n药浴和美牙服务"
        case .hospital:
            environmentTagsText = "体检 健康管理 疫苗"
            servicesText = "宠物体检 宠物健康管理 疫苗接种"
            capabilitiesText = "提供基础体检、血常规和生化检查\n支持长期健康档案管理\n可提前沟通宠物病史和预约时间"
        }
    }

    private func save() {
        let cleanName = trimmed(name)
        let cleanSummary = trimmed(summary)
        let cleanAddress = trimmed(address)
        let cleanPhone = trimmed(phone)

        switch category {
        case .boarding:
            saveAction(.boarding(BoardingProvider(
                name: cleanName,
                type: providerType,
                summary: cleanSummary,
                imageAssetPath: imageAssetPath,
                environmentTags: splitTags(environmentTagsText),
                conditions: splitLines(conditionsText),
                petFit: splitLines(petFitText),
                accent: providerType == .home ? .mint : .sky,
                isUserUploaded: true
            )))
        case .grooming:
            let uploadedServices = splitLines(servicesText)
            saveAction(.grooming(GroomingShop(
                name: cleanName,
                address: cleanAddress,
                summary: cleanSummary,
                imageAssetPath: imageAssetPath,
                highlights: splitTags(environmentTagsText),
                uploadedServices: uploadedServices.isEmpty ? ["基础护理", "修剪与造型"] : uploadedServices,
                accent: .peach
            )))
        case .hospital:
            saveAction(.hospital(PetHospital(
                name: cleanName,
                address: cleanAddress,
                phone: cleanPhone,
                summary: cleanSummary,
                imageAssetPath: imageAssetPath,
                services: splitTags(servicesText),
                capabilities: splitLines(capabilitiesText),
                accent: .ember
            )))
        }

        dismiss()
    }

    private func importSelectedPhoto() async {
        guard let selectedPhotoItem else {
            return
        }

        do {
            guard let imageData = try await selectedPhotoItem.loadTransferable(type: Data.self) else {
                importErrorMessage = "图片读取失败，请重新选择。"
                return
            }

            let ext = selectedPhotoItem.supportedContentTypes.first?.preferredFilenameExtension ?? "jpg"
            imageAssetPath = try MemoryAssetStore.saveImageData(imageData, preferredExtension: ext)
            importErrorMessage = nil
        } catch {
            importErrorMessage = "图片导入失败：\(error.localizedDescription)"
        }
    }
}

private extension PetServiceCategory {
    var placeholderIcon: String {
        switch self {
        case .boarding:
            return "house.fill"
        case .grooming:
            return "scissors"
        case .hospital:
            return "cross.case.fill"
        }
    }
}

private struct DetailBlock: View {
    let title: String
    let rows: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(PetTheme.ink)

            ForEach(rows.isEmpty ? ["暂无补充内容"] : rows, id: \.self) { row in
                HStack(alignment: .top, spacing: 10) {
                    Circle()
                        .fill(PetTheme.accent.opacity(0.32))
                        .frame(width: 7, height: 7)
                        .padding(.top, 7)

                    Text(row)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct CompactDetailBlock: View {
    let title: String
    let rows: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(PetTheme.ink)

            ForEach(rows.isEmpty ? ["暂无补充内容"] : rows, id: \.self) { row in
                HStack(alignment: .top, spacing: 10) {
                    Circle()
                        .fill(AccentToken.peach.color.opacity(0.32))
                        .frame(width: 7, height: 7)
                        .padding(.top, 7)

                    Text(row)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(18)
        .frame(maxWidth: 190, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
    }
}

private struct ServiceImagePreview: View {
    let imageAssetPath: String?
    let accent: AccentToken
    let systemImage: String
    let height: CGFloat

    var body: some View {
        Group {
            if
                let imageAssetPath,
                let imageURL = MemoryAssetStore.url(for: imageAssetPath),
                let image = UIImage(contentsOfFile: imageURL.path)
            {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [accent.color.opacity(0.22), accent.color.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        Image(systemName: systemImage)
                            .font(.system(size: height > 120 ? 48 : 26, weight: .semibold))
                            .foregroundStyle(accent.color)
                    )
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct ContactRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(PetTheme.accent)
                .frame(width: 22)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

private struct TagWrap: View {
    let tags: [String]
    let accent: AccentToken

    var body: some View {
        HStack(spacing: 8) {
            ForEach(tags.isEmpty ? ["待完善"] : tags, id: \.self) { tag in
                Text(tag)
                    .font(.caption)
                    .lineLimit(1)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(accent.color.opacity(0.1), in: Capsule())
                    .foregroundStyle(accent.color)
            }
        }
    }
}

private struct ServiceConversationView: View {
    let title: String
    let accent: AccentToken

    @State private var messages: [ServiceMessage] = [
        ServiceMessage(text: "你好，我想了解一下服务时间和细节。", isFromCurrentUser: true),
        ServiceMessage(text: "你好，可以先告诉我宠物品种、年龄和期望日期，我们来帮你确认安排。", isFromCurrentUser: false)
    ]
    @State private var draft = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(messages) { message in
                        HStack {
                            if message.isFromCurrentUser {
                                Spacer()
                            }

                            Text(message.text)
                                .font(.subheadline)
                                .padding(14)
                                .background(
                                    message.isFromCurrentUser ? accent.color : Color.white,
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
                TextField("输入想沟通的细节", text: $draft)
                    .textFieldStyle(.roundedBorder)

                Button("发送", action: send)
                    .buttonStyle(.borderedProminent)
                    .tint(accent.color)
                    .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
            .padding(16)
            .background(.thinMaterial)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(title)
    }

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else {
            return
        }

        messages.append(ServiceMessage(text: text, isFromCurrentUser: true))
        draft = ""
    }
}

private struct ServiceMessage: Identifiable, Hashable {
    let id = UUID()
    var text: String
    var isFromCurrentUser: Bool
}

private struct BoardingProvider: Identifiable, Hashable {
    enum ProviderType: String, CaseIterable, Hashable {
        case shop = "宠物店铺寄养"
        case home = "个人家庭寄养"
    }

    let id = UUID()
    var name: String
    var type: ProviderType
    var summary: String
    var imageAssetPath: String?
    var environmentTags: [String]
    var conditions: [String]
    var petFit: [String]
    var accent: AccentToken
    var isUserUploaded = false

    static let samples: [BoardingProvider] = [
        BoardingProvider(
            name: "暖爪家庭寄养",
            type: .home,
            summary: "家庭式照护，每天上传照片和散步记录，只接小型犬和性格稳定的猫咪。",
            imageAssetPath: nil,
            environmentTags: ["无幼童", "封闭阳台", "每日反馈"],
            conditions: [
                "提供客厅活动区、独立睡眠垫和饮水点。",
                "寄养前需要疫苗记录和基础驱虫记录。",
                "每天至少两次照片反馈，可沟通喂食习惯。"
            ],
            petFit: [
                "适合 12kg 以下小型犬。",
                "适合胆子较小、需要安静环境的猫咪。",
                "暂不接有明显攻击行为的宠物。"
            ],
            accent: .mint
        ),
        BoardingProvider(
            name: "PawCare 宠物店寄养",
            type: .shop,
            summary: "门店寄养，有独立笼位、夜间巡查和基础清洁服务，适合短期出差托管。",
            imageAssetPath: nil,
            environmentTags: ["独立笼位", "夜间巡查", "可加洗护"],
            conditions: [
                "店铺提供小型、中型和大型独立寄养空间。",
                "支持自带粮食、药品和常用玩具。",
                "寄养期间可加购洗澡、修甲和耳道清理。"
            ],
            petFit: [
                "适合短期旅行、出差期间托管。",
                "适合需要规律喂药或固定喂食时间的宠物。",
                "大型犬需提前沟通体型和活动需求。"
            ],
            accent: .sky
        )
    ]
}

private struct GroomingShop: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var address: String
    var summary: String
    var imageAssetPath: String?
    var highlights: [String]
    var uploadedServices: [String]
    var accent: AccentToken

    static let samples: [GroomingShop] = [
        GroomingShop(
            name: "毛球造型研究所",
            address: "上海市徐汇区宠爱路 88 号",
            summary: "提供日常洗护、品种造型、去废毛、药浴和美牙护理，可先沟通宠物性格。",
            imageAssetPath: nil,
            highlights: ["基础护理", "造型修剪", "特色SPA"],
            uploadedServices: [
                "基础护理：洗澡、吹干、修剪指甲、清理耳朵。",
                "修剪与造型：全身体毛修剪、卫生区域修剪、去废毛。",
                "特色 SPA：药浴、美牙、香薰护理和安全染色。"
            ],
            accent: .peach
        ),
        GroomingShop(
            name: "Little Paw 精致洗护",
            address: "杭州市西湖区湖畔街 26 号",
            summary: "主打低刺激洗护和猫咪友好护理，支持预约独立时段。",
            imageAssetPath: nil,
            highlights: ["低刺激", "猫咪友好", "美牙"],
            uploadedServices: [
                "低刺激洗护：使用温和洗护用品，适合敏感皮肤宠物。",
                "猫咪友好护理：预约独立时段，减少等候和应激。",
                "美牙护理：刷牙、口腔清洁和口气管理。"
            ],
            accent: .plum
        )
    ]
}

private struct PetHospital: Identifiable, Hashable {
    let id = UUID()
    var name: String
    var address: String
    var phone: String
    var summary: String
    var imageAssetPath: String?
    var services: [String]
    var capabilities: [String]
    var accent: AccentToken

    static let samples: [PetHospital] = [
        PetHospital(
            name: "安安宠物医院",
            address: "上海市静安区康宁路 168 号",
            phone: "021-6677-8899",
            summary: "支持宠物体检、疫苗、皮肤科、口腔检查和慢病健康管理预约。",
            imageAssetPath: nil,
            services: ["宠物体检", "宠物健康管理", "疫苗接种"],
            capabilities: [
                "提供基础体检、血常规、生化检查和影像检查。",
                "可建立长期健康档案，定期提醒复诊。",
                "支持猫犬常见皮肤问题和口腔问题初诊。"
            ],
            accent: .ember
        ),
        PetHospital(
            name: "青禾动物医疗中心",
            address: "杭州市滨江区月明路 39 号",
            phone: "0571-8866-1234",
            summary: "提供健康管理、术前评估、老年宠物检查和营养咨询。",
            imageAssetPath: nil,
            services: ["老年体检", "术前评估", "营养咨询"],
            capabilities: [
                "适合老年宠物年度检查和慢病复查。",
                "提供体重管理、饮食建议和护理方案。",
                "预约后可提前沟通宠物病史和检查项目。"
            ],
            accent: .pine
        )
    ]
}

private func trimmed(_ value: String) -> String {
    value.trimmingCharacters(in: .whitespacesAndNewlines)
}

private func splitTags(_ text: String) -> [String] {
    text
        .split(whereSeparator: { $0.isWhitespace || $0 == "，" || $0 == "," || $0 == "、" })
        .map { String($0) }
        .filter { !$0.isEmpty }
}

private func splitLines(_ text: String) -> [String] {
    text
        .split(whereSeparator: \.isNewline)
        .map { trimmed(String($0)) }
        .filter { !$0.isEmpty }
}

#Preview {
    NavigationStack {
        PetServicesView()
    }
}
