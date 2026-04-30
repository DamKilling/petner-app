-- Enable owner-only edit/delete paths for PetLife records.

drop policy if exists "memories owner update" on public.memories;
create policy "memories owner update"
on public.memories for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "memories owner delete" on public.memories;
create policy "memories owner delete"
on public.memories for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "feed author delete" on public.feed_posts;
create policy "feed author delete"
on public.feed_posts for delete
to authenticated
using (author_id = auth.uid());

drop policy if exists "service offers owner delete" on public.service_offers;
create policy "service offers owner delete"
on public.service_offers for delete
to authenticated
using (provider_id = auth.uid());

drop policy if exists "service requests owner delete" on public.service_requests;
create policy "service requests owner delete"
on public.service_requests for delete
to authenticated
using (requester_id = auth.uid());
