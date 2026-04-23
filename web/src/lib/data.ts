import { unstable_noStore as noStore } from "next/cache";

import { demoMemories, demoPets, demoPosts, demoProfile, demoVideos } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatThread, FeedPost, Memory, Pet, PostComment, Profile, Video } from "@/lib/types";

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
    profile,
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

  return data ?? [];
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

  return data ?? [];
}

export async function getPet(petID: string) {
  noStore();

  if (!isSupabaseConfigured()) {
    return demoPets.find((pet) => pet.id === petID) ?? null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pets").select("*").eq("id", petID).maybeSingle<Pet>();
  return data;
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

export async function getSignedMediaUrl(path: string | null) {
  noStore();

  if (!path || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage.from("petlife-media").createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}
