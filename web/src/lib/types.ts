export type AccentToken = "ember" | "pine" | "sky" | "peach" | "plum" | "mint";
export type UploadStatus = "draft" | "uploading" | "reviewing" | "published";
export type PetVisibility = "public" | "private";

export type Profile = {
  id: string;
  display_name: string;
  phone: string | null;
  city: string;
  bio: string;
  avatar_symbol: string;
  created_at: string;
  updated_at: string;
};

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  age_text: string;
  city: string;
  bio: string;
  interests: string[];
  looking_for: string;
  accent: AccentToken;
  vaccinated: boolean;
  visibility: PetVisibility;
  created_at: string;
  updated_at: string;
};

export type Memory = {
  id: string;
  owner_id: string;
  title: string;
  subtitle: string;
  date_text: string;
  story: string;
  ornament: string;
  accent: AccentToken;
  photo_path: string | null;
  audio_path: string | null;
  audio_display_name: string | null;
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  owner_id: string;
  title: string;
  duration_text: string;
  caption: string;
  tags: string[];
  status: UploadStatus;
  asset_path: string;
  selected_asset_count: number;
  accent: AccentToken;
  created_at: string;
  updated_at: string;
};

export type FeedPost = {
  id: string;
  author_id: string;
  related_pet_id: string | null;
  pet_name: string;
  topic: string;
  city: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type ChatThread = {
  id: string;
  related_pet_id: string;
  pet_owner_id: string;
  initiator_id: string;
  title: string;
  subtitle: string;
  accent: AccentToken;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};
