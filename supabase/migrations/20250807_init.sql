-- Enable pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Authenticated users mapping
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.translation_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  source_language text not null,
  target_language text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.translation_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text not null,
  language text not null,
  audio_url text,
  voice text,
  confidence double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_sessions_profile_id on public.translation_sessions(profile_id);
create index if not exists idx_sessions_created_at on public.translation_sessions(created_at);
create index if not exists idx_messages_session_id on public.messages(session_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_sessions_updated_at on public.translation_sessions;
create trigger trg_sessions_updated_at
before update on public.translation_sessions
for each row execute function public.set_updated_at();

-- On auth.users insert, upsert profile row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, display_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.translation_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.audit_logs enable row level security;

-- Policies
-- Profiles: users can manage only their row
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Sessions: owner-only
drop policy if exists "Sessions selectable by owner" on public.translation_sessions;
create policy "Sessions selectable by owner"
on public.translation_sessions for select
using (exists (
  select 1 from public.profiles p where p.id = translation_sessions.profile_id and p.user_id = auth.uid()
));

drop policy if exists "Sessions insertable by owner" on public.translation_sessions;
create policy "Sessions insertable by owner"
on public.translation_sessions for insert
with check (exists (
  select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()
));

drop policy if exists "Sessions updatable by owner" on public.translation_sessions;
create policy "Sessions updatable by owner"
on public.translation_sessions for update
using (exists (
  select 1 from public.profiles p where p.id = translation_sessions.profile_id and p.user_id = auth.uid()
))
with check (exists (
  select 1 from public.profiles p where p.id = translation_sessions.profile_id and p.user_id = auth.uid()
));

drop policy if exists "Sessions deletable by owner" on public.translation_sessions;
create policy "Sessions deletable by owner"
on public.translation_sessions for delete
using (exists (
  select 1 from public.profiles p where p.id = translation_sessions.profile_id and p.user_id = auth.uid()
));

-- Messages: owner-only via session join
drop policy if exists "Messages selectable by owner" on public.messages;
create policy "Messages selectable by owner"
on public.messages for select
using (exists (
  select 1 from public.translation_sessions s
  join public.profiles p on p.id = s.profile_id
  where s.id = messages.session_id and p.user_id = auth.uid()
));

drop policy if exists "Messages insertable by owner" on public.messages;
create policy "Messages insertable by owner"
on public.messages for insert
with check (exists (
  select 1 from public.translation_sessions s
  join public.profiles p on p.id = s.profile_id
  where s.id = session_id and p.user_id = auth.uid()
));

drop policy if exists "Messages updatable by owner" on public.messages;
create policy "Messages updatable by owner"
on public.messages for update
using (exists (
  select 1 from public.translation_sessions s
  join public.profiles p on p.id = s.profile_id
  where s.id = messages.session_id and p.user_id = auth.uid()
))
with check (exists (
  select 1 from public.translation_sessions s
  join public.profiles p on p.id = s.profile_id
  where s.id = messages.session_id and p.user_id = auth.uid()
));

drop policy if exists "Messages deletable by owner" on public.messages;
create policy "Messages deletable by owner"
on public.messages for delete
using (exists (
  select 1 from public.translation_sessions s
  join public.profiles p on p.id = s.profile_id
  where s.id = messages.session_id and p.user_id = auth.uid()
));

-- Audit logs: read by admin only (example), insert by everyone
drop policy if exists "Audit logs insertable by any auth user" on public.audit_logs;
create policy "Audit logs insertable by any auth user"
on public.audit_logs for insert to authenticated
with check (true);

drop policy if exists "Audit logs viewable by service role" on public.audit_logs;
create policy "Audit logs viewable by service role"
on public.audit_logs for select
using (current_setting('request.jwt.claims', true)::jsonb ? 'role' and (
  (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
));


