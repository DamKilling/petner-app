do $$ begin
  create type public.notification_type as enum ('chat', 'booking', 'service', 'community');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type public.notification_type not null,
  title text not null,
  body text not null,
  action_url text not null,
  source_table text,
  source_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_status_idx
on public.notifications (recipient_id, read_at, created_at desc);

create index if not exists notifications_recipient_type_idx
on public.notifications (recipient_id, type, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications owner read" on public.notifications;
create policy "notifications owner read"
on public.notifications for select
to authenticated
using ((select auth.uid()) = recipient_id);

drop policy if exists "notifications owner update" on public.notifications;
create policy "notifications owner update"
on public.notifications for update
to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id);

drop policy if exists "notifications actor insert" on public.notifications;
create policy "notifications actor insert"
on public.notifications for insert
to authenticated
with check ((select auth.uid()) = actor_id);
