"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
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
  const memoryID = crypto.randomUUID();
  const photoPath = await uploadOwnerFile(user.id, "memories", memoryID, formData.get("photo"));
  const audioFile = formData.get("audio");
  const audioPath = await uploadOwnerFile(user.id, "memories", memoryID, audioFile);

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
    audio_display_name: audioFile instanceof File && audioFile.size > 0 ? audioFile.name : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/app/tree");
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
  const { error } = await supabase.from("post_comments").insert({
    post_id: postID,
    author_id: user.id,
    body: text(formData, "body"),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/app/match/posts/${postID}`);
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

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await getAuthenticatedSupabase();
  const threadID = text(formData, "thread_id");
  const body = text(formData, "text");

  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id,initiator_id,pet_owner_id")
    .eq("id", threadID)
    .maybeSingle<{ id: string; initiator_id: string; pet_owner_id: string }>();

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

  revalidatePath(`/app/chats/${threadID}`);
}
