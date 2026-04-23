import type { FeedPost, Memory, Pet, Profile, Video } from "@/lib/types";

export const demoProfile: Profile = {
  id: "demo",
  display_name: "PetLife 用户",
  phone: null,
  city: "上海",
  bio: "在 PetLife 记录宠物成长，也认识同频家庭。",
  avatar_symbol: "pawprint",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const demoPets: Pet[] = [
  {
    id: "demo-bobo",
    owner_id: "demo-owner",
    name: "Bobo",
    species: "狗狗",
    breed: "柯基",
    age_text: "2岁",
    city: "上海",
    bio: "情绪稳定，喜欢飞盘和草地社交，见面会先闻闻再摇尾巴。",
    interests: ["飞盘", "露营", "亲人"],
    looking_for: "周末能一起跑起来的玩伴",
    accent: "peach",
    vaccinated: true,
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-mochi",
    owner_id: "demo-owner",
    name: "Mochi",
    species: "猫猫",
    breed: "布偶猫",
    age_text: "1岁半",
    city: "杭州",
    bio: "慢热但很黏人，适合安静家庭，也愿意先从线上视频认识。",
    interests: ["晒太阳", "陪伴", "安静"],
    looking_for: "性格温柔的长期陪伴对象",
    accent: "sky",
    vaccinated: true,
    visibility: "public",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoMemories: Memory[] = [
  {
    id: "demo-memory",
    owner_id: "demo",
    title: "初雪见面",
    subtitle: "把领养那天的照片挂上树梢，像点亮新的家庭故事。",
    date_text: "2025.12.03",
    story: "第一次见面是在下雪天。它从航空箱里探出头时很安静，但那一瞬间我们知道它要成为家里的一员。",
    ornament: "sparkles",
    accent: "ember",
    photo_path: null,
    audio_path: null,
    audio_display_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoVideos: Video[] = [
  {
    id: "demo-video",
    owner_id: "demo",
    title: "Lucky 第一次学会握手",
    duration_text: "00:34",
    caption: "训练第三天终于学会握手，奖励了两颗冻干。",
    tags: ["训练", "成长"],
    status: "published",
    asset_path: "",
    selected_asset_count: 1,
    accent: "ember",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const demoPosts: FeedPost[] = [
  {
    id: "demo-post",
    author_id: "demo-owner",
    related_pet_id: "demo-bobo",
    pet_name: "Bobo",
    topic: "宠物相亲",
    city: "上海",
    content: "春天到了，想给狗狗找一个脾气温和、疫苗齐全的相亲对象，也欢迎先线上视频见面。",
    tags: ["相亲", "疫苗齐全", "视频初聊"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
