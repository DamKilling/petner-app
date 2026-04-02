import Foundation
import Observation
import SwiftUI

struct HolidayMemory: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let subtitle: String
    let dateText: String
    let color: Color
    let ornament: String
}

struct UploadVideo: Identifiable, Hashable {
    enum Status: String {
        case draft = "待处理"
        case uploading = "上传中"
        case ready = "已发布"
    }

    let id = UUID()
    let title: String
    let duration: String
    let tags: [String]
    let status: Status
}

struct PetProfile: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let breed: String
    let age: String
    let city: String
    let bio: String
    let interests: [String]
    let accent: Color
}

struct FeedPost: Identifiable, Hashable {
    let id = UUID()
    let author: String
    let petName: String
    let content: String
    let topic: String
    let likes: Int
    let comments: Int
}

@Observable
final class AppModel {
    var holidayMemories: [HolidayMemory] = [
        HolidayMemory(
            title: "初雪见面",
            subtitle: "把领养那天的照片挂上树尖，像点亮了新的家庭故事。",
            dateText: "2025.12.03",
            color: Color(red: 0.84, green: 0.16, blue: 0.20),
            ornament: "sparkles"
        ),
        HolidayMemory(
            title: "第一件圣诞毛衣",
            subtitle: "记录宠物成长节点，每一张都能挂成一个节日愿望。",
            dateText: "2025.12.10",
            color: Color(red: 0.12, green: 0.54, blue: 0.38),
            ornament: "gift.fill"
        ),
        HolidayMemory(
            title: "全家福夜灯",
            subtitle: "把视频、语音和照片组合成会发光的树枝故事线。",
            dateText: "2025.12.24",
            color: Color(red: 0.94, green: 0.67, blue: 0.17),
            ornament: "star.fill"
        )
    ]

    var uploadedVideos: [UploadVideo] = [
        UploadVideo(
            title: "Lucky第一次学会握手",
            duration: "00:34",
            tags: ["训练", "成长", "高互动"],
            status: .ready
        ),
        UploadVideo(
            title: "Milo雪地撒欢",
            duration: "01:12",
            tags: ["冬天", "户外", "萌宠"],
            status: .uploading
        ),
        UploadVideo(
            title: "Nana洗澡挑战",
            duration: "00:48",
            tags: ["日常", "搞笑"],
            status: .draft
        )
    ]

    var featuredPets: [PetProfile] = [
        PetProfile(
            name: "Bobo",
            breed: "柯基",
            age: "2岁",
            city: "上海",
            bio: "性格稳定，喜欢飞盘和周末草地聚会。",
            interests: ["飞盘", "户外", "亲人"],
            accent: Color(red: 0.97, green: 0.55, blue: 0.24)
        ),
        PetProfile(
            name: "Mochi",
            breed: "布偶猫",
            age: "1岁半",
            city: "杭州",
            bio: "慢热但黏人，喜欢安静家庭和有窗景的午后。",
            interests: ["晒太阳", "陪伴", "安静"],
            accent: Color(red: 0.40, green: 0.52, blue: 0.86)
        ),
        PetProfile(
            name: "Dumpling",
            breed: "比熊",
            age: "3岁",
            city: "苏州",
            bio: "适合城市社交，爱拍照也爱认识新朋友。",
            interests: ["拍照", "社交", "散步"],
            accent: Color(red: 0.25, green: 0.68, blue: 0.59)
        )
    ]

    var nearbyPosts: [FeedPost] = [
        FeedPost(
            author: "阿青",
            petName: "Pudding",
            content: "想给我家英短找固定玩伴，周末徐汇滨江可以一起遛猫背包。",
            topic: "同城交友",
            likes: 128,
            comments: 19
        ),
        FeedPost(
            author: "Miya",
            petName: "Seven",
            content: "春天到了，给狗狗找一个脾气温和的相亲对象，也欢迎先线上视频见面。",
            topic: "宠物相亲",
            likes: 203,
            comments: 41
        ),
        FeedPost(
            author: "老周",
            petName: "豆包",
            content: "有没有想一起拍圣诞树主题写真和短视频的家庭？可以组局。",
            topic: "活动组队",
            likes: 87,
            comments: 12
        )
    ]
}
