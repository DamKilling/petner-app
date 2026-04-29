import { unstable_noStore as noStore } from "next/cache";

import {
  demoBookings,
  demoMemories,
  demoNotifications,
  demoPets,
  demoPosts,
  demoProfile,
  demoReviewSummary,
  demoServiceOffers,
  demoServiceRequests,
  demoVideos,
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  AppNotification,
  ChatMessage,
  ChatThread,
  FeedPost,
  Memory,
  Pet,
  PostComment,
  Profile,
  ReviewSummary,
  ServiceOffer,
  ServiceRequest,
  Video,
  Booking,
} from "@/lib/types";

export type AppUser = {
  id: string;
  email: string | null;
  profile: Profile;
};

export type InteractiveMemory = {
  id: string;
  title: string;
  subtitle: string;
  dateText: string;
  photoUrl: string;
};

function withProfileDefaults(profile: Profile): Profile {
  return {
    verification_status: profile.verification_status ?? "basic",
    response_rate: profile.response_rate ?? 92,
    response_time_label: profile.response_time_label ?? "通常 30 分钟内回复",
    rating_avg: profile.rating_avg ?? 4.8,
    rating_count: profile.rating_count ?? 12,
    repeat_booking_count: profile.repeat_booking_count ?? 3,
    completed_booking_count: profile.completed_booking_count ?? 8,
    ...profile,
  };
}

function withPetDefaults(pet: Pet): Pet {
  return {
    sex: pet.sex ?? "unknown",
    personality_tags: pet.personality_tags ?? pet.interests.slice(0, 3),
    energy_level: pet.energy_level ?? "medium",
    social_level: pet.social_level ?? (pet.visibility === "public" ? "warm" : "shy"),
    health_summary: pet.health_summary ?? (pet.vaccinated ? "已完成基础疫苗，可继续沟通见面细节" : "健康信息待补充"),
    vaccine_status: pet.vaccine_status ?? (pet.vaccinated ? "complete" : "unknown"),
    neutered_status: pet.neutered_status ?? "unknown",
    avatar_url: pet.avatar_url ?? null,
    ...pet,
  };
}

export async function getCurrentUser() {
  noStore();

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile) {
    const displayName =
      user.email?.split("@")[0]?.trim() || user.user_metadata?.name || "PetLife 用户";

    const { data: inserted } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: displayName,
        city: "上海",
        bio: "在 PetLife 记录宠物成长，也认识同频家庭。",
        avatar_symbol: "pawprint",
      })
      .select("*")
      .single<Profile>();

    profile = inserted;
  }

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile: withProfileDefaults(profile),
  } satisfies AppUser;
}

export async function getDashboardData(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return {
      profile: demoProfile,
      petCount: demoPets.length,
      pendingVideoCount: 0,
      chatCount: 0,
      pendingBookingCount: demoBookings.filter((item) => item.status === "pending" || item.status === "confirmed").length,
      unreadNotificationCount: demoNotifications.filter((item) => !item.read).length,
      latestPosts: demoPosts,
    };
  }

  const supabase = await createClient();
  const [pets, videos, chats, posts] = await Promise.all([
    supabase.from("pets").select("id", { count: "exact", head: true }).eq("owner_id", userID),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userID)
      .in("status", ["draft", "uploading", "reviewing"]),
    supabase
      .from("chat_threads")
      .select("id", { count: "exact", head: true })
      .or(`initiator_id.eq.${userID},pet_owner_id.eq.${userID}`),
    supabase
      .from("feed_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<FeedPost[]>(),
  ]);

  return {
    profile: null,
    petCount: pets.count ?? 0,
    pendingVideoCount: videos.count ?? 0,
    chatCount: chats.count ?? 0,
    pendingBookingCount: 2,
    unreadNotificationCount: 1,
    latestPosts: posts.data ?? [],
  };
}

export async function getOwnedPets(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoPets.filter((pet) => pet.owner_id === "demo-owner");
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", userID)
    .order("created_at", { ascending: false })
    .returns<Pet[]>();

  return (data ?? []).map(withPetDefaults);
}

export async function getDiscoverPets(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoPets;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("visibility", "public")
    .neq("owner_id", userID)
    .order("created_at", { ascending: false })
    .limit(24)
    .returns<Pet[]>();

  return (data ?? []).map(withPetDefaults);
}

export async function getPet(petID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoPets.find((pet) => pet.id === petID) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pets").select("*").eq("id", petID).maybeSingle<Pet>();
  return data ? withPetDefaults(data) : data;
}

export async function getMemories(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoMemories;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("*")
    .eq("owner_id", userID)
    .order("created_at", { ascending: false })
    .returns<Memory[]>();

  return data ?? [];
}

export async function getInteractiveMemories(userID: string) {
  noStore();

  const memories = await getMemories(userID);
  const photoMemories = memories.filter((memory) => memory.photo_path);

  const signedMemories = await Promise.all(
    photoMemories.map(async (memory) => {
      const photoUrl = await getSignedMediaUrl(memory.photo_path);

      if (!photoUrl) {
        return null;
      }

      return {
        id: memory.id,
        title: memory.title,
        subtitle: memory.subtitle,
        dateText: memory.date_text,
        photoUrl,
      } satisfies InteractiveMemory;
    }),
  );

  return signedMemories.filter((memory): memory is InteractiveMemory => memory !== null);
}

export async function getMemory(memoryID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoMemories.find((memory) => memory.id === memoryID) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("memories")
    .select("*")
    .eq("id", memoryID)
    .maybeSingle<Memory>();
  return data;
}

export async function getVideos(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoVideos;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .eq("owner_id", userID)
    .order("created_at", { ascending: false })
    .returns<Video[]>();

  return data ?? [];
}

export async function getVideo(videoID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoVideos.find((video) => video.id === videoID) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("videos").select("*").eq("id", videoID).maybeSingle<Video>();
  return data;
}

export async function getFeedPosts(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoPosts.map((post) => ({ post, likes: 12, comments: 1, liked: false }));
  }

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<FeedPost[]>();

  if (!posts?.length) {
    return [];
  }

  const ids = posts.map((post) => post.id);
  const [{ data: likes }, { data: comments }] = await Promise.all([
    supabase.from("post_likes").select("post_id,user_id").in("post_id", ids),
    supabase.from("post_comments").select("post_id").in("post_id", ids),
  ]);

  return posts.map((post) => ({
    post,
    likes: likes?.filter((like) => like.post_id === post.id).length ?? 0,
    comments: comments?.filter((comment) => comment.post_id === post.id).length ?? 0,
    liked: likes?.some((like) => like.post_id === post.id && like.user_id === userID) ?? false,
  }));
}

export async function getPost(postID: string, userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    const post = demoPosts.find((item) => item.id === postID);
    return post
      ? {
          post,
          comments: [],
          likes: 12,
          liked: false,
        }
      : null;
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("feed_posts")
    .select("*")
    .eq("id", postID)
    .maybeSingle<FeedPost>();

  if (!post) {
    return null;
  }

  const [{ data: comments }, { data: likes }] = await Promise.all([
    supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postID)
      .order("created_at", { ascending: true })
      .returns<PostComment[]>(),
    supabase.from("post_likes").select("user_id").eq("post_id", postID),
  ]);

  return {
    post,
    comments: comments ?? [],
    likes: likes?.length ?? 0,
    liked: likes?.some((like) => like.user_id === userID) ?? false,
  };
}

export async function getChatThreads(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_threads")
    .select("*")
    .or(`initiator_id.eq.${userID},pet_owner_id.eq.${userID}`)
    .order("updated_at", { ascending: false })
    .returns<ChatThread[]>();

  return data ?? [];
}

export async function getChatThread(threadID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const [{ data: thread }, { data: messages }] = await Promise.all([
    supabase.from("chat_threads").select("*").eq("id", threadID).maybeSingle<ChatThread>(),
    supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadID)
      .order("created_at", { ascending: true })
      .returns<ChatMessage[]>(),
  ]);

  if (!thread) {
    return null;
  }

  return {
    thread,
    messages: messages ?? [],
  };
}

export async function getServiceOffers(userID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoServiceOffers;
  }

  return (await getServiceBoardData({ userID })).offers;

  const pets = await getDiscoverPets(userID);

  if (!pets.length) {
    return [];
  }

  return pets.slice(0, 8).map((pet, index) => ({
    id: `service-${pet.id}`,
    provider_id: pet.owner_id,
    provider_name: `${pet.name} 的主人`,
    related_pet_id: pet.id,
    related_pet_name: pet.name,
    service_types:
      index % 3 === 0
        ? ["宠物玩伴", "附近活动"]
        : index % 3 === 1
          ? ["宠物陪伴", "视频初聊"]
          : ["临时照看", "遛宠协助"],
    service_area: `${pet.city} · 就近沟通`,
    price_mode: index % 2 === 0 ? "按次沟通" : "先聊后定",
    availability_summary: index % 2 === 0 ? "本周末可约" : "工作日晚间可约",
    trust_badges: [
      "宠物信息完整",
      pet.vaccinated ? "疫苗信息完整" : "健康信息待确认",
      index % 2 === 0 ? "响应快" : "评价稳定",
    ],
    response_time_label: index % 2 === 0 ? "通常 15 分钟内回复" : "通常 30 分钟内回复",
    rating_avg: 4.7 + (index % 3) * 0.1,
    rating_count: 6 + index * 3,
    repeat_booking_count: 2 + (index % 4),
    intro: `${pet.name} 适合 ${pet.looking_for}，可先沟通互动节奏和见面方式。`,
  })) satisfies ServiceOffer[];
}

async function getProfilesByIds(ids: string[]) {
  if (!ids.length || !isSupabaseConfigured()) {
    return new Map<string, Profile>();
  }

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").in("id", ids).returns<Profile[]>();
  return new Map((data ?? []).map((profile) => [profile.id, withProfileDefaults(profile)]));
}

async function getPetsByIds(ids: string[]) {
  if (!ids.length || !isSupabaseConfigured()) {
    return new Map<string, Pet>();
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pets").select("*").in("id", ids).returns<Pet[]>();
  return new Map((data ?? []).map((pet) => [pet.id, withPetDefaults(pet)]));
}

function offerTrustBadges(profile: Profile | null, pet: Pet | null) {
  return [
    profile?.verification_status === "verified" ? "实名认证" : "资料可见",
    pet?.vaccine_status === "complete" || pet?.vaccinated ? "宠物信息完整" : "健康信息待确认",
    (profile?.repeat_booking_count ?? 0) > 0 ? `${profile?.repeat_booking_count} 次复约` : "可先聊天确认",
  ];
}

function normalizeOffer(offer: ServiceOffer, profile?: Profile | null, pet?: Pet | null): ServiceOffer {
  return {
    ...offer,
    title: offer.title ?? `${pet?.name ?? offer.related_pet_name ?? "宠物"} 的陪伴服务`,
    provider_name: offer.provider_name ?? profile?.display_name ?? "PetLife 用户",
    related_pet_name: offer.related_pet_name ?? pet?.name ?? null,
    trust_badges: offer.trust_badges?.length ? offer.trust_badges : offerTrustBadges(profile ?? null, pet ?? null),
    response_time_label: offer.response_time_label ?? profile?.response_time_label ?? "通常 30 分钟内回复",
    rating_avg: offer.rating_avg ?? profile?.rating_avg ?? 4.8,
    rating_count: offer.rating_count ?? profile?.rating_count ?? 0,
    repeat_booking_count: offer.repeat_booking_count ?? profile?.repeat_booking_count ?? 0,
    status: offer.status ?? "active",
    provider_profile: profile ?? null,
    related_pet: pet ?? null,
  };
}

function normalizeRequest(request: ServiceRequest, profile?: Profile | null, pet?: Pet | null): ServiceRequest {
  return {
    ...request,
    requester_name: request.requester_name ?? profile?.display_name ?? "PetLife 用户",
    related_pet_name: request.related_pet_name ?? pet?.name ?? null,
    requester_profile: profile ?? null,
    related_pet: pet ?? null,
  };
}

export async function getServiceBoardData({
  userID,
  surface = "offers",
  serviceType,
  city,
}: {
  userID: string;
  surface?: "offers" | "requests";
  serviceType?: string;
  city?: string;
}) {
  noStore();

  if (!isSupabaseConfigured()) {
    return {
      surface,
      offers: demoServiceOffers
        .filter((offer) => !serviceType || offer.service_types.includes(serviceType))
        .filter((offer) => !city || offer.service_area.includes(city))
        .map((offer) => normalizeOffer(offer, demoProfile, demoPets.find((pet) => pet.id === offer.related_pet_id))),
      requests: demoServiceRequests
        .filter((request) => !serviceType || request.request_type === serviceType)
        .filter((request) => !city || request.city.includes(city))
        .map((request) => normalizeRequest(request, demoProfile, demoPets.find((pet) => pet.id === request.related_pet_id))),
    };
  }

  void userID;
  const supabase = await createClient();
  let offerQuery = supabase.from("service_offers").select("*").order("created_at", { ascending: false });
  let requestQuery = supabase.from("service_requests").select("*").order("created_at", { ascending: false });

  if (serviceType) {
    offerQuery = offerQuery.contains("service_types", [serviceType]);
    requestQuery = requestQuery.eq("request_type", serviceType);
  }

  if (city) {
    offerQuery = offerQuery.ilike("service_area", `%${city}%`);
    requestQuery = requestQuery.ilike("city", `%${city}%`);
  }

  const [{ data: rawOffers }, { data: rawRequests }] = await Promise.all([
    offerQuery.returns<ServiceOffer[]>(),
    requestQuery.returns<ServiceRequest[]>(),
  ]);
  const profileIDs = [
    ...(rawOffers ?? []).map((offer) => offer.provider_id),
    ...(rawRequests ?? []).map((request) => request.requester_id),
  ];
  const petIDs = [
    ...(rawOffers ?? []).map((offer) => offer.related_pet_id).filter((id): id is string => Boolean(id)),
    ...(rawRequests ?? []).map((request) => request.related_pet_id).filter((id): id is string => Boolean(id)),
  ];
  const [profiles, pets] = await Promise.all([getProfilesByIds([...new Set(profileIDs)]), getPetsByIds([...new Set(petIDs)])]);

  return {
    surface,
    offers: (rawOffers ?? []).map((offer) => normalizeOffer(offer, profiles.get(offer.provider_id), offer.related_pet_id ? pets.get(offer.related_pet_id) : null)),
    requests: (rawRequests ?? []).map((request) => normalizeRequest(request, profiles.get(request.requester_id), request.related_pet_id ? pets.get(request.related_pet_id) : null)),
  };
}

export async function getServiceOfferDetail(offerID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    const offer = demoServiceOffers.find((item) => item.id === offerID);
    return offer ? normalizeOffer(offer, demoProfile, demoPets.find((pet) => pet.id === offer.related_pet_id)) : null;
  }

  const supabase = await createClient();
  const { data: offer } = await supabase.from("service_offers").select("*").eq("id", offerID).maybeSingle<ServiceOffer>();

  if (!offer) {
    return null;
  }

  const [profiles, pets] = await Promise.all([
    getProfilesByIds([offer.provider_id]),
    offer.related_pet_id ? getPetsByIds([offer.related_pet_id]) : Promise.resolve(new Map<string, Pet>()),
  ]);

  return normalizeOffer(offer, profiles.get(offer.provider_id), offer.related_pet_id ? pets.get(offer.related_pet_id) : null);
}

export async function getServiceRequestDetail(requestID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    const request = demoServiceRequests.find((item) => item.id === requestID);
    return request ? normalizeRequest(request, demoProfile, demoPets.find((pet) => pet.id === request.related_pet_id)) : null;
  }

  const supabase = await createClient();
  const { data: request } = await supabase.from("service_requests").select("*").eq("id", requestID).maybeSingle<ServiceRequest>();

  if (!request) {
    return null;
  }

  const [profiles, pets] = await Promise.all([
    getProfilesByIds([request.requester_id]),
    request.related_pet_id ? getPetsByIds([request.related_pet_id]) : Promise.resolve(new Map<string, Pet>()),
  ]);

  return normalizeRequest(request, profiles.get(request.requester_id), request.related_pet_id ? pets.get(request.related_pet_id) : null);
}

export async function getReviewSummary(): Promise<ReviewSummary> {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoReviewSummary;
  }

  return {
    rating_avg: 4.8,
    rating_count: 12,
    highlight_tags: ["沟通清楚", "回复及时", "过程稳定"],
    repeat_booking_count: 3,
    quote: "沟通预期很清楚，见面节奏也比较安心。",
  };
}

export async function getBookingTimeline(userID: string): Promise<Booking[]> {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoBookings;
  }

  return getBookings(userID);

  return [
    {
      id: `booking-${userID}`,
      status: "pending",
      service_type: "宠物陪伴初次沟通",
      scheduled_time: "待双方确认具体时间",
      participants: ["你", "匹配对象"],
      location_summary: "先在消息页确认见面地点",
      price_summary: "价格与频次待双方确认",
      safety_notice: "提交前请核对宠物健康信息、见面地点与应急联系人。",
    },
  ];
}

export async function getBookings(userID: string): Promise<Booking[]> {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoBookings;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .or(`requester_id.eq.${userID},provider_id.eq.${userID}`)
    .order("updated_at", { ascending: false })
    .returns<Booking[]>();

  return data ?? [];
}

export async function getBookingDetail(bookingID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoBookings.find((booking) => booking.id === bookingID) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*").eq("id", bookingID).maybeSingle<Booking>();
  return data;
}

export async function getNotifications(userID: string): Promise<AppNotification[]> {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoNotifications;
  }

  const threads = await getChatThreads(userID);

  return threads.slice(0, 4).map((thread, index) => ({
    id: `notification-thread-${thread.id}`,
    type: index === 0 ? "chat" : index === 1 ? "booking" : "community",
    title: index === 0 ? "收到一条新消息" : index === 1 ? "预约状态有更新" : "社区互动有新回复",
    body: thread.subtitle,
    action_url: `/app/chats/${thread.id}`,
    read: index > 1,
    created_at: thread.updated_at,
  }));
}

export async function getSignedMediaUrl(path: string | null) {
  noStore();

  if (!path || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage.from("petlife-media").createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}
