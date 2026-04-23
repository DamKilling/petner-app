create extension if not exists "pgcrypto";

do $$ begin
  create type public.accent_token as enum ('ember', 'pine', 'sky', 'peach', 'plum', 'mint');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.pet_visibility as enum ('public', 'private');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.upload_status as enum ('draft', 'uploading', 'reviewing', 'published');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  city text not null default '上海',
  bio text not null default '在 PetLife 记录宠物成长，也认识同频家庭。',
  avatar_symbol text not null default 'pawprint',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null,
  breed text not null,
  age_text text not null,
  city text not null,
  bio text not null,
  interests text[] not null default '{}',
  looking_for text not null,
  accent public.accent_token not null default 'ember',
  vaccinated boolean not null default true,
  visibility public.pet_visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text not null,
  date_text text not null,
  story text not null,
  ornament text not null default 'star',
  accent public.accent_token not null default 'pine',
  photo_path text,
  audio_path text,
  audio_display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  duration_text text not null default '00:30',
  caption text not null,
  tags text[] not null default '{}',
  status public.upload_status not null default 'uploading',
  asset_path text not null,
  selected_asset_count integer not null default 1,
  accent public.accent_token not null default 'peach',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  related_pet_id uuid references public.pets(id) on delete set null,
  pet_name text not null,
  topic text not null,
  city text not null,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  related_pet_id uuid not null references public.pets(id) on delete cascade,
  pet_owner_id uuid not null references auth.users(id) on delete cascade,
  initiator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text not null default '新的聊天已开启',
  accent public.accent_token not null default 'plum',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_threads_unique_pair unique (related_pet_id, initiator_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists pets_owner_id_idx on public.pets(owner_id);
create index if not exists pets_public_created_idx on public.pets(created_at desc) where visibility = 'public';
create index if not exists memories_owner_id_idx on public.memories(owner_id, created_at desc);
create index if not exists videos_owner_id_idx on public.videos(owner_id, created_at desc);
create index if not exists feed_posts_created_idx on public.feed_posts(created_at desc);
create index if not exists feed_posts_author_id_idx on public.feed_posts(author_id);
create index if not exists post_comments_post_id_idx on public.post_comments(post_id, created_at asc);
create index if not exists chat_threads_participant_idx on public.chat_threads(initiator_id, pet_owner_id);
create index if not exists chat_messages_thread_id_idx on public.chat_messages(thread_id, created_at asc);

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.memories enable row level security;
alter table public.videos enable row level security;
alter table public.feed_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "pets readable by authenticated users" on public.pets;
create policy "pets readable by authenticated users"
on public.pets for select
to authenticated
using (visibility = 'public' or (select auth.uid()) = owner_id);

drop policy if exists "pets owner insert" on public.pets;
create policy "pets owner insert"
on public.pets for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "pets owner update" on public.pets;
create policy "pets owner update"
on public.pets for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "memories owner read" on public.memories;
create policy "memories owner read"
on public.memories for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "memories owner insert" on public.memories;
create policy "memories owner insert"
on public.memories for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "videos owner read" on public.videos;
create policy "videos owner read"
on public.videos for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "videos owner insert" on public.videos;
create policy "videos owner insert"
on public.videos for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "feed readable by authenticated users" on public.feed_posts;
create policy "feed readable by authenticated users"
on public.feed_posts for select
to authenticated
using (true);

drop policy if exists "feed author insert" on public.feed_posts;
create policy "feed author insert"
on public.feed_posts for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "feed author update" on public.feed_posts;
create policy "feed author update"
on public.feed_posts for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists "likes readable by authenticated users" on public.post_likes;
create policy "likes readable by authenticated users"
on public.post_likes for select
to authenticated
using (true);

drop policy if exists "likes owner insert" on public.post_likes;
create policy "likes owner insert"
on public.post_likes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "likes owner delete" on public.post_likes;
create policy "likes owner delete"
on public.post_likes for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "comments readable by authenticated users" on public.post_comments;
create policy "comments readable by authenticated users"
on public.post_comments for select
to authenticated
using (true);

drop policy if exists "comments author insert" on public.post_comments;
create policy "comments author insert"
on public.post_comments for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "chat participant read" on public.chat_threads;
create policy "chat participant read"
on public.chat_threads for select
to authenticated
using ((select auth.uid()) in (initiator_id, pet_owner_id));

drop policy if exists "chat participant insert" on public.chat_threads;
create policy "chat participant insert"
on public.chat_threads for insert
to authenticated
with check ((select auth.uid()) = initiator_id);

drop policy if exists "chat participant update" on public.chat_threads;
create policy "chat participant update"
on public.chat_threads for update
to authenticated
using ((select auth.uid()) in (initiator_id, pet_owner_id))
with check ((select auth.uid()) in (initiator_id, pet_owner_id));

drop policy if exists "messages participant read" on public.chat_messages;
create policy "messages participant read"
on public.chat_messages for select
to authenticated
using (
  exists (
    select 1 from public.chat_threads t
    where t.id = thread_id
      and (select auth.uid()) in (t.initiator_id, t.pet_owner_id)
  )
);

drop policy if exists "messages participant insert" on public.chat_messages;
create policy "messages participant insert"
on public.chat_messages for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and exists (
    select 1 from public.chat_threads t
    where t.id = thread_id
      and (select auth.uid()) in (t.initiator_id, t.pet_owner_id)
  )
);

insert into storage.buckets (id, name, public)
values ('petlife-media', 'petlife-media', false)
on conflict (id) do nothing;

drop policy if exists "petlife media owner read" on storage.objects;
create policy "petlife media owner read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'petlife-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "petlife media owner upload" on storage.objects;
create policy "petlife media owner upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'petlife-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "petlife media owner update" on storage.objects;
create policy "petlife media owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'petlife-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'petlife-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "petlife media owner delete" on storage.objects;
create policy "petlife media owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'petlife-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
