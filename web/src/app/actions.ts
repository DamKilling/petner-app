"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { demoNotifications } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppNotificationType } from "@/lib/types";
import { splitTags } from "@/lib/utils";

async function getAuthenticatedSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function createNotification(
  supabase: SupabaseServerClient,
  input: {
    recipientID: string;
    actorID: string;
    type: AppNotificationType;
    title: string;
    body: string;
    actionURL: string;
    sourceTable?: string;
    sourceID?: string;
  },
) {
  if (input.recipientID === input.actorID) {
    return;
  }

  const { error } = await supabase.from("notifications").insert({
    recipient_id: input.recipientID,
    actor_id: input.actorID,
    type: input.type,
    title: input.title,
    body: input.body,
    action_url: input.actionURL,
    source_table: input.sourceTable ?? null,
    source_id: input.sourceID ?? null,
  });

  if (error) {
    console.error("Failed to create notification", error.message);
  }
}

function truncateNotificationBody(value: string, maxLength = 96) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function ownedStoragePath(
  userID: string,
  scope: string,
  entityID: string,
  value: FormDataEntryValue | null,
) {
  if (typeof value !== "string") {
    return null;
  }

  const path = value.trim();
  const expectedPrefix = `${userID}/${scope}/${entityID}/`;
  return path.startsWith(expectedPrefix) ? path : null;
}

async function uploadOwnerFile(
  userID: string,
  scope: string,
  entityID: string,
  file: FormDataEntryValue | null,
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const { supabase } = await getAuthenticatedSupabase();
  const extension = file.name.split(".").pop() || "bin";
  const path = `${userID}/${scope}/${entityID}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("petlife-media").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userID: string,
  email?: string | null,
) {
  const displayName = email?.split("@")[0]?.trim() || "PetLife 用户";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userID,
      display_name: displayName,
      city: "上海",
      bio: "在 PetLife 记录宠物成长，也认识同频家庭。",
      avatar_symbol: "pawprint",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInWithPassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?message=missing-supabase");
  }

  const email = text(formData, "email");
  const password = text(formData, "password");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await ensureProfile(supabase, data.user.id, data.user.email);
  }

  redirect("/app");
}

export async function signUpWithPassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/login?message=missing-supabase");
  }

  const email = text(formData, "email");
  const password = text(formData, "password");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (data.user && data.session) {
    await ensureProfile(supabase, data.user.id, data.user.email);
    redirect("/app");
  }

  redirect("/login?message=confirm-email-disabled-required");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}

export async function openNotification(formData: FormData) {
  const notificationID = text(formData, "notification_id");

  if (!isSupabaseConfigured()) {
    const notification = demoNotifications.find((item) => item.id === notificationID);
    redirect(notification?.action_url ?? "/app/chats?tab=updates");
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const { data: notification } = await supabase
    .from("notifications")
    .select("id,action_url")
    .eq("id", notificationID)
    .eq("recipient_id", user.id)
    .maybeSingle<{ id: string; action_url: string }>();

  if (!notification) {
    redirect("/app/chats?tab=updates");
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notification.id)
    .eq("recipient_id", user.id);

  revalidatePath("/app");
  revalidatePath("/app/chats");
  redirect(notification.action_url);
}

export async function markNotificationRead(formData: FormData) {
  if (!isSupabaseConfigured()) {
    revalidatePath("/app/chats");
    return;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const notificationID = text(formData, "notification_id");

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationID)
    .eq("recipient_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/chats");
}

export async function markAllNotificationsRead(formData: FormData) {
  if (!isSupabaseConfigured()) {
    revalidatePath("/app/chats");
    return;
  }

  const { supabase, user } = await getAuthenticatedSupabase();
  const type = text(formData, "type", "all");
  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (type !== "all") {
    query = query.eq("type", type);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app");
  revalidatePath("/app/chats");
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: text(formData, "display_name", "PetLife 用户"),
    phone: text(formData, "phone") || null,
    city: text(formData, "city", "上海"),
    bio: text(formData, "bio", "在 PetLife 记录宠物成长，也认识同频家庭。"),
    avatar_symbol: "pawprint",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/profile");
  revalidatePath("/app");
}

export async function addPet(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();

  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    name: text(formData, "name"),
    species: text(formData, "species", "狗狗"),
    breed: text(formData, "breed"),
    age_text: text(formData, "age_text"),
    city: text(formData, "city", "上海"),
    bio: text(formData, "bio"),
    interests: splitTags(formData.get("interests")),
    looking_for: text(formData, "looking_for", "一起散步和玩耍"),
    accent: text(formData, "accent", "ember"),
    vaccinated: formData.get("vaccinated") === "on",
    visibility: text(formData, "visibility", "public"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/profile");
  revalidatePath("/app/match");
  redirect("/app/profile");
}

export async function addMemory(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const submittedMemoryID = text(formData, "memory_id");
  const memoryID = submittedMemoryID || crypto.randomUUID();
  const photoPath =
    ownedStoragePath(user.id, "memories", memoryID, formData.get("photo_path")) ??
    (await uploadOwnerFile(user.id, "memories", memoryID, formData.get("photo")));
  const audioFile = formData.get("audio");
  const audioPath =
    ownedStoragePath(user.id, "memories", memoryID, formData.get("audio_path")) ??
    (await uploadOwnerFile(user.id, "memories", memoryID, audioFile));
  const uploadedAudioDisplayName = text(formData, "audio_display_name") || null;

  const { error } = await supabase.from("memories").insert({
    id: memoryID,
    owner_id: user.id,
    title: text(formData, "title"),
    subtitle: text(formData, "subtitle"),
    date_text: text(formData, "date_text", "2026.04.23"),
    story: text(formData, "story"),
    ornament: text(formData, "ornament", "star"),
    accent: text(formData, "accent", "pine"),
    photo_path: photoPath,
    audio_path: audioPath,
    audio_display_name:
      uploadedAudioDisplayName ?? (audioFile instanceof File && audioFile.size > 0 ? audioFile.name : null),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/tree");
  revalidatePath("/app/tree/interactive");
  redirect(`/app/tree/${memoryID}`);
}

export async function addVideo(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const videoID = crypto.randomUUID();
  const assetPath = await uploadOwnerFile(user.id, "videos", videoID, formData.get("video"));

  if (!assetPath) {
    throw new Error("请选择一个视频文件。");
  }

  const { error } = await supabase.from("videos").insert({
    id: videoID,
    owner_id: user.id,
    title: text(formData, "title"),
    duration_text: text(formData, "duration_text", "00:30"),
    caption: text(formData, "caption"),
    tags: splitTags(formData.get("tags")),
    status: "reviewing",
    asset_path: assetPath,
    selected_asset_count: 1,
    accent: text(formData, "accent", "peach"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/videos");
  redirect(`/app/videos/${videoID}`);
}

export async function createPost(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const petID = text(formData, "related_pet_id") || null;
  let petName = text(formData, "pet_name", "我的宠物");

  if (petID) {
    const { data: pet } = await supabase
      .from("pets")
      .select("name")
      .eq("id", petID)
      .eq("owner_id", user.id)
      .maybeSingle<{ name: string }>();
    petName = pet?.name ?? petName;
  }

  const postID = crypto.randomUUID();
  const { error } = await supabase.from("feed_posts").insert({
    id: postID,
    author_id: user.id,
    related_pet_id: petID,
    pet_name: petName,
    topic: text(formData, "topic", "同城交友"),
    city: text(formData, "city", "上海"),
    content: text(formData, "content"),
    tags: splitTags(formData.get("tags")),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/match");
  redirect(`/app/match/posts/${postID}`);
}

export async function toggleLike(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const postID = text(formData, "post_id");
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postID)
    .eq("user_id", user.id)
    .maybeSingle();

  const result = existing
    ? await supabase.from("post_likes").delete().eq("post_id", postID).eq("user_id", user.id)
    : await supabase.from("post_likes").insert({ post_id: postID, user_id: user.id });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/app/match");
  revalidatePath(`/app/match/posts/${postID}`);
}

export async function addComment(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const postID = text(formData, "post_id");
  const body = text(formData, "body");
  const { data: post } = await supabase
    .from("feed_posts")
    .select("author_id,pet_name")
    .eq("id", postID)
    .maybeSingle<{ author_id: string; pet_name: string }>();
  const { error } = await supabase.from("post_comments").insert({
    post_id: postID,
    author_id: user.id,
    body,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (post) {
    await createNotification(supabase, {
      recipientID: post.author_id,
      actorID: user.id,
      type: "community",
      title: "社区动态有新评论",
      body: truncateNotificationBody(body),
      actionURL: `/app/match/posts/${postID}`,
      sourceTable: "feed_posts",
      sourceID: postID,
    });
  }

  revalidatePath(`/app/match/posts/${postID}`);
  revalidatePath("/app/chats");
}

export async function openChat(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const petID = text(formData, "pet_id");
  const { data: pet, error: petError } = await supabase
    .from("pets")
    .select("id,owner_id,name,accent")
    .eq("id", petID)
    .single<{ id: string; owner_id: string; name: string; accent: string }>();

  if (petError || !pet) {
    throw new Error(petError?.message ?? "宠物档案不存在。");
  }

  const { data: existing } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("related_pet_id", pet.id)
    .eq("initiator_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existing) {
    redirect(`/app/chats/${existing.id}`);
  }

  const threadID = crypto.randomUUID();
  const { error } = await supabase.from("chat_threads").insert({
    id: threadID,
    related_pet_id: pet.id,
    pet_owner_id: pet.owner_id,
    initiator_id: user.id,
    title: `${pet.name} 的聊天`,
    subtitle: "新的聊天已开启",
    accent: pet.accent,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/profile");
  redirect(`/app/chats/${threadID}`);
}

export async function createServiceOffer(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const offerID = crypto.randomUUID();
  const { error } = await supabase.from("service_offers").insert({
    id: offerID,
    provider_id: user.id,
    related_pet_id: text(formData, "related_pet_id") || null,
    title: text(formData, "title"),
    intro: text(formData, "intro"),
    service_types: splitTags(formData.get("service_types")),
    service_area: text(formData, "service_area"),
    price_mode: text(formData, "price_mode", "先聊后定"),
    availability_summary: text(formData, "availability_summary", "待沟通"),
    status: "active",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/match");
  redirect(`/app/match/services/${offerID}`);
}

export async function updateServiceOfferStatus(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const offerID = text(formData, "offer_id");
  const status = text(formData, "status", "active");
  const { error } = await supabase
    .from("service_offers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", offerID)
    .eq("provider_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/match");
  revalidatePath(`/app/match/services/${offerID}`);
}

export async function createServiceRequest(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const requestID = crypto.randomUUID();
  const { error } = await supabase.from("service_requests").insert({
    id: requestID,
    requester_id: user.id,
    related_pet_id: text(formData, "related_pet_id") || null,
    title: text(formData, "title"),
    detail: text(formData, "detail"),
    request_type: text(formData, "request_type", "宠物陪伴"),
    city: text(formData, "city", "上海"),
    preferred_time_summary: text(formData, "preferred_time_summary", "待沟通"),
    budget_summary: text(formData, "budget_summary", "先聊后定"),
    status: "open",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/match");
  redirect(`/app/match/requests/${requestID}`);
}

export async function updateServiceRequestStatus(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const requestID = text(formData, "request_id");
  const status = text(formData, "status", "open");
  const { error } = await supabase
    .from("service_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestID)
    .eq("requester_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/match");
  revalidatePath(`/app/match/requests/${requestID}`);
}

export async function openServiceChat(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const sourceKind = text(formData, "source_kind", "offer");
  const sourceID = text(formData, "source_id");

  if (sourceKind === "request") {
    const { data: request, error } = await supabase
      .from("service_requests")
      .select("id,requester_id,related_pet_id,title,request_type")
      .eq("id", sourceID)
      .single<{ id: string; requester_id: string; related_pet_id: string | null; title: string; request_type: string }>();

    if (error || !request) {
      throw new Error(error?.message ?? "服务需求不存在。");
    }

    const { data: existing } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("service_request_id", request.id)
      .eq("initiator_id", user.id)
      .maybeSingle<{ id: string }>();

    if (existing) {
      redirect(`/app/chats/${existing.id}`);
    }

    const threadID = crypto.randomUUID();
    const { error: insertError } = await supabase.from("chat_threads").insert({
      id: threadID,
      related_pet_id: request.related_pet_id,
      service_request_id: request.id,
      pet_owner_id: request.requester_id,
      initiator_id: user.id,
      title: `服务需求沟通：${request.title}`,
      subtitle: `来自需求广场 · ${request.request_type}`,
      accent: "sky",
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    await createNotification(supabase, {
      recipientID: request.requester_id,
      actorID: user.id,
      type: "service",
      title: "服务需求收到新的联系",
      body: `有人想继续沟通：${request.title}`,
      actionURL: `/app/chats/${threadID}`,
      sourceTable: "service_requests",
      sourceID: request.id,
    });

    redirect(`/app/chats/${threadID}`);
  }

  const { data: offer, error } = await supabase
    .from("service_offers")
    .select("id,provider_id,related_pet_id,title,service_types")
    .eq("id", sourceID)
    .single<{ id: string; provider_id: string; related_pet_id: string | null; title: string; service_types: string[] }>();

  if (error || !offer) {
    throw new Error(error?.message ?? "服务项目不存在。");
  }

  const { data: existing } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("service_offer_id", offer.id)
    .eq("initiator_id", user.id)
    .maybeSingle<{ id: string }>();

  if (existing) {
    redirect(`/app/chats/${existing.id}`);
  }

  const threadID = crypto.randomUUID();
  const { error: insertError } = await supabase.from("chat_threads").insert({
    id: threadID,
    related_pet_id: offer.related_pet_id,
    service_offer_id: offer.id,
    pet_owner_id: offer.provider_id,
    initiator_id: user.id,
    title: `服务沟通：${offer.title}`,
    subtitle: `来自服务卡 · ${(offer.service_types ?? []).join(" / ")}`,
    accent: "mint",
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await createNotification(supabase, {
    recipientID: offer.provider_id,
    actorID: user.id,
    type: "service",
    title: "服务卡收到新的联系",
    body: `有人想继续沟通：${offer.title}`,
    actionURL: `/app/chats/${threadID}`,
    sourceTable: "service_offers",
    sourceID: offer.id,
  });

  redirect(`/app/chats/${threadID}`);
}

export async function createBookingDraft(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const sourceKind = text(formData, "source_kind", "offer");
  const sourceID = text(formData, "source_id");
  const threadID = text(formData, "thread_id") || null;
  let booking: {
    source_kind: string;
    service_offer_id: string | null;
    service_request_id: string | null;
    requester_id: string;
    provider_id: string;
    related_pet_id: string | null;
    service_type: string;
  };

  if (sourceKind === "request") {
    const { data: request, error } = await supabase
      .from("service_requests")
      .select("id,requester_id,related_pet_id,request_type")
      .eq("id", sourceID)
      .single<{ id: string; requester_id: string; related_pet_id: string | null; request_type: string }>();

    if (error || !request) {
      throw new Error(error?.message ?? "服务需求不存在。");
    }

    booking = {
      source_kind: "request",
      service_offer_id: null,
      service_request_id: request.id,
      requester_id: request.requester_id,
      provider_id: user.id,
      related_pet_id: request.related_pet_id,
      service_type: request.request_type,
    };
  } else {
    const { data: offer, error } = await supabase
      .from("service_offers")
      .select("id,provider_id,related_pet_id,service_types")
      .eq("id", sourceID)
      .single<{ id: string; provider_id: string; related_pet_id: string | null; service_types: string[] }>();

    if (error || !offer) {
      throw new Error(error?.message ?? "服务项目不存在。");
    }

    booking = {
      source_kind: "offer",
      service_offer_id: offer.id,
      service_request_id: null,
      requester_id: user.id,
      provider_id: offer.provider_id,
      related_pet_id: offer.related_pet_id,
      service_type: offer.service_types?.[0] ?? "宠物陪伴",
    };
  }

  const existingQuery = supabase
    .from("bookings")
    .select("id")
    .eq("requester_id", booking.requester_id)
    .eq("provider_id", booking.provider_id)
    .neq("status", "cancelled");
  const { data: existing } =
    booking.source_kind === "offer"
      ? await existingQuery.eq("service_offer_id", booking.service_offer_id).maybeSingle<{ id: string }>()
      : await existingQuery.eq("service_request_id", booking.service_request_id).maybeSingle<{ id: string }>();

  if (existing) {
    redirect(`/app/match/bookings/${existing.id}`);
  }

  const bookingID = crypto.randomUUID();
  const { error } = await supabase.from("bookings").insert({
    id: bookingID,
    ...booking,
    thread_id: threadID,
    scheduled_time: text(formData, "scheduled_time", "待双方确认具体时间"),
    location_summary: text(formData, "location_summary", "先在消息页确认地点"),
    price_summary: text(formData, "price_summary", "价格与频次待双方确认"),
    notes: text(formData, "notes"),
    status: "draft",
    safety_notice: "提交前请核对宠物健康信息、见面地点与应急联系人。",
  });

  if (error) {
    throw new Error(error.message);
  }

  if (threadID) {
    await supabase.from("chat_threads").update({ booking_id: bookingID }).eq("id", threadID);
  }

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/chats");
  redirect(`/app/match/bookings/${bookingID}`);
}

export async function updateBookingStatus(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const bookingID = text(formData, "booking_id");
  const status = text(formData, "status", "pending");
  const { data: booking } = await supabase
    .from("bookings")
    .select("id,requester_id,provider_id,service_type")
    .eq("id", bookingID)
    .maybeSingle<{ id: string; requester_id: string; provider_id: string; service_type: string }>();

  if (!booking || ![booking.requester_id, booking.provider_id].includes(user.id)) {
    throw new Error("没有权限更新这条预约。");
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingID);

  if (error) {
    throw new Error(error.message);
  }

  await createNotification(supabase, {
    recipientID: booking.requester_id === user.id ? booking.provider_id : booking.requester_id,
    actorID: user.id,
    type: "booking",
    title: "预约状态有更新",
    body: `${booking.service_type} 已更新为 ${status}`,
    actionURL: `/app/match/bookings/${bookingID}`,
    sourceTable: "bookings",
    sourceID: bookingID,
  });

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath("/app/chats");
  revalidatePath(`/app/match/bookings/${bookingID}`);
}

export async function submitServiceReview(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const bookingID = text(formData, "booking_id");
  const revieweeID = text(formData, "reviewee_id");
  const rating = Number(text(formData, "rating", "5"));
  const { error } = await supabase.from("service_reviews").insert({
    booking_id: bookingID,
    reviewer_id: user.id,
    reviewee_id: revieweeID,
    rating,
    tags: splitTags(formData.get("tags")),
    body: text(formData, "body"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/app/match/bookings/${bookingID}`);
}

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const threadID = text(formData, "thread_id");
  const body = text(formData, "text");

  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id,initiator_id,pet_owner_id,title")
    .eq("id", threadID)
    .maybeSingle<{ id: string; initiator_id: string; pet_owner_id: string; title: string }>();

  if (!thread || ![thread.initiator_id, thread.pet_owner_id].includes(user.id)) {
    throw new Error("没有权限发送这条消息。");
  }

  const [{ error: messageError }, { error: threadError }] = await Promise.all([
    supabase.from("chat_messages").insert({
      thread_id: threadID,
      sender_id: user.id,
      text: body,
    }),
    supabase
      .from("chat_threads")
      .update({ subtitle: body, updated_at: new Date().toISOString() })
      .eq("id", threadID),
  ]);

  if (messageError || threadError) {
    throw new Error(messageError?.message ?? threadError?.message);
  }

  await createNotification(supabase, {
    recipientID: thread.initiator_id === user.id ? thread.pet_owner_id : thread.initiator_id,
    actorID: user.id,
    type: "chat",
    title: "收到一条新消息",
    body: truncateNotificationBody(body),
    actionURL: `/app/chats/${threadID}`,
    sourceTable: "chat_threads",
    sourceID: threadID,
  });

  revalidatePath("/app");
  revalidatePath("/app/chats");
  revalidatePath(`/app/chats/${threadID}`);
}
