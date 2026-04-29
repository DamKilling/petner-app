do $$ begin
  create type public.service_offer_status as enum ('active', 'paused');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.service_request_status as enum ('open', 'matched', 'closed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_status as enum ('draft', 'pending', 'confirmed', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.booking_source_kind as enum ('offer', 'request');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists verification_status text not null default 'basic',
  add column if not exists response_rate integer not null default 92,
  add column if not exists response_time_label text not null default '通常 30 分钟内回复',
  add column if not exists rating_avg numeric(3, 2) not null default 4.8,
  add column if not exists rating_count integer not null default 0,
  add column if not exists repeat_booking_count integer not null default 0,
  add column if not exists completed_booking_count integer not null default 0;

alter table public.pets
  add column if not exists sex text not null default 'unknown',
  add column if not exists personality_tags text[] not null default '{}',
  add column if not exists energy_level text not null default 'medium',
  add column if not exists social_level text not null default 'warm',
  add column if not exists health_summary text not null default '健康信息待补充',
  add column if not exists vaccine_status text not null default 'unknown',
  add column if not exists neutered_status text not null default 'unknown',
  add column if not exists avatar_url text;

create table if not exists public.service_offers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  related_pet_id uuid references public.pets(id) on delete set null,
  title text not null,
  intro text not null,
  service_types text[] not null default '{}',
  service_area text not null,
  price_mode text not null,
  availability_summary text not null,
  status public.service_offer_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  related_pet_id uuid references public.pets(id) on delete set null,
  title text not null,
  detail text not null,
  request_type text not null,
  city text not null,
  preferred_time_summary text not null,
  budget_summary text not null,
  status public.service_request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_threads
  alter column related_pet_id drop not null,
  add column if not exists service_offer_id uuid references public.service_offers(id) on delete set null,
  add column if not exists service_request_id uuid references public.service_requests(id) on delete set null,
  add column if not exists booking_id uuid;

do $$ begin
  alter table public.chat_threads drop constraint chat_threads_unique_pair;
exception
  when undefined_object then null;
end $$;

create unique index if not exists chat_threads_pet_pair_unique
on public.chat_threads (related_pet_id, initiator_id)
where related_pet_id is not null and service_offer_id is null and service_request_id is null;

create unique index if not exists chat_threads_offer_pair_unique
on public.chat_threads (service_offer_id, initiator_id)
where service_offer_id is not null;

create unique index if not exists chat_threads_request_pair_unique
on public.chat_threads (service_request_id, initiator_id)
where service_request_id is not null;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  source_kind public.booking_source_kind not null,
  service_offer_id uuid references public.service_offers(id) on delete set null,
  service_request_id uuid references public.service_requests(id) on delete set null,
  thread_id uuid references public.chat_threads(id) on delete set null,
  requester_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  related_pet_id uuid references public.pets(id) on delete set null,
  service_type text not null,
  scheduled_time text not null,
  location_summary text not null,
  price_summary text not null,
  notes text not null default '',
  status public.booking_status not null default 'draft',
  safety_notice text not null default '提交前请核对宠物健康信息、见面地点与应急联系人。',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  tags text[] not null default '{}',
  body text not null,
  created_at timestamptz not null default now(),
  constraint service_reviews_unique_reviewer unique (booking_id, reviewer_id)
);

create index if not exists service_offers_provider_idx on public.service_offers(provider_id, created_at desc);
create index if not exists service_offers_active_idx on public.service_offers(created_at desc) where status = 'active';
create index if not exists service_requests_requester_idx on public.service_requests(requester_id, created_at desc);
create index if not exists service_requests_open_idx on public.service_requests(created_at desc) where status = 'open';
create index if not exists bookings_participants_idx on public.bookings(requester_id, provider_id, updated_at desc);
create unique index if not exists bookings_offer_active_unique
on public.bookings (service_offer_id, requester_id, provider_id)
where service_offer_id is not null and status <> 'cancelled';
create unique index if not exists bookings_request_active_unique
on public.bookings (service_request_id, requester_id, provider_id)
where service_request_id is not null and status <> 'cancelled';

alter table public.service_offers enable row level security;
alter table public.service_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.service_reviews enable row level security;

drop policy if exists "service offers active read" on public.service_offers;
create policy "service offers active read"
on public.service_offers for select
to authenticated
using (status = 'active' or (select auth.uid()) = provider_id);

drop policy if exists "service offers owner insert" on public.service_offers;
create policy "service offers owner insert"
on public.service_offers for insert
to authenticated
with check ((select auth.uid()) = provider_id);

drop policy if exists "service offers owner update" on public.service_offers;
create policy "service offers owner update"
on public.service_offers for update
to authenticated
using ((select auth.uid()) = provider_id)
with check ((select auth.uid()) = provider_id);

drop policy if exists "service requests open read" on public.service_requests;
create policy "service requests open read"
on public.service_requests for select
to authenticated
using (status = 'open' or (select auth.uid()) = requester_id);

drop policy if exists "service requests owner insert" on public.service_requests;
create policy "service requests owner insert"
on public.service_requests for insert
to authenticated
with check ((select auth.uid()) = requester_id);

drop policy if exists "service requests owner update" on public.service_requests;
create policy "service requests owner update"
on public.service_requests for update
to authenticated
using ((select auth.uid()) = requester_id)
with check ((select auth.uid()) = requester_id);

drop policy if exists "bookings participant read" on public.bookings;
create policy "bookings participant read"
on public.bookings for select
to authenticated
using ((select auth.uid()) in (requester_id, provider_id));

drop policy if exists "bookings participant insert" on public.bookings;
create policy "bookings participant insert"
on public.bookings for insert
to authenticated
with check ((select auth.uid()) in (requester_id, provider_id));

drop policy if exists "bookings participant update" on public.bookings;
create policy "bookings participant update"
on public.bookings for update
to authenticated
using ((select auth.uid()) in (requester_id, provider_id))
with check ((select auth.uid()) in (requester_id, provider_id));

drop policy if exists "service reviews authenticated read" on public.service_reviews;
create policy "service reviews authenticated read"
on public.service_reviews for select
to authenticated
using (true);

drop policy if exists "service reviews participant insert" on public.service_reviews;
create policy "service reviews participant insert"
on public.service_reviews for insert
to authenticated
with check (
  (select auth.uid()) = reviewer_id
  and exists (
    select 1 from public.bookings b
    where b.id = booking_id
      and b.status = 'completed'
      and (select auth.uid()) in (b.requester_id, b.provider_id)
      and reviewee_id in (b.requester_id, b.provider_id)
      and reviewee_id <> reviewer_id
  )
);

drop policy if exists "chat participant insert" on public.chat_threads;
create policy "chat participant insert"
on public.chat_threads for insert
to authenticated
with check ((select auth.uid()) = initiator_id);
