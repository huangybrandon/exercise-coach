-- Supabase schema for exercise app
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  language text not null default 'en',
  created_at timestamptz not null default now()
);

-- Helper to check admin (defined after profiles table exists)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.is_admin = true
  );
$$;

-- Exercises
create table if not exists public.exercises (
  id text primary key,
  type text not null check (type in ('balance','strength','core','mobility')),
  timing jsonb not null,
  media jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_translations (
  exercise_id text not null references public.exercises(id) on delete cascade,
  lang text not null,
  title text not null,
  description text not null,
  cues jsonb not null,
  safety text not null,
  primary key (exercise_id, lang)
);

-- Routines
create table if not exists public.routines (
  id text primary key,
  duration_minutes int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_translations (
  routine_id text not null references public.routines(id) on delete cascade,
  lang text not null,
  title text not null,
  primary key (routine_id, lang)
);

create table if not exists public.routine_items (
  routine_id text not null references public.routines(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete restrict,
  sort_order int not null,
  primary key (routine_id, exercise_id, sort_order)
);

-- Sessions (per completed routine)
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id text not null references public.routines(id) on delete restrict,
  completed_at timestamptz not null default now(),
  completed_local_date date not null,
  duration_minutes int not null,
  created_at timestamptz not null default now()
);

-- Streaks
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_completed_date date
);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Streak update RPC
create or replace function public.update_streak(p_user_id uuid, p_completed_local_date date)
returns public.streaks
language plpgsql
security definer
as $$
declare
  s public.streaks;
  yesterday date := (p_completed_local_date - interval '1 day')::date;
  new_current int;
  new_longest int;
  new_last date;
begin
  select * into s from public.streaks where user_id = p_user_id for update;

  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak, last_completed_date)
    values (p_user_id, 1, 1, p_completed_local_date)
    returning * into s;
    return s;
  end if;

  if s.last_completed_date = p_completed_local_date then
    return s; -- already counted today
  elsif s.last_completed_date = yesterday then
    new_current := s.current_streak + 1;
  else
    new_current := 1;
  end if;

  new_longest := greatest(s.longest_streak, new_current);
  new_last := p_completed_local_date;

  update public.streaks
  set current_streak = new_current,
      longest_streak = new_longest,
      last_completed_date = new_last
  where user_id = p_user_id
  returning * into s;

  return s;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_translations enable row level security;
alter table public.routines enable row level security;
alter table public.routine_translations enable row level security;
alter table public.routine_items enable row level security;
alter table public.sessions enable row level security;
alter table public.streaks enable row level security;

-- Profiles: users can read/update their own
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Content: all authenticated users can read
create policy "exercises_select_auth" on public.exercises
  for select using (auth.role() = 'authenticated');
create policy "exercise_translations_select_auth" on public.exercise_translations
  for select using (auth.role() = 'authenticated');
create policy "routines_select_auth" on public.routines
  for select using (auth.role() = 'authenticated');
create policy "routine_translations_select_auth" on public.routine_translations
  for select using (auth.role() = 'authenticated');
create policy "routine_items_select_auth" on public.routine_items
  for select using (auth.role() = 'authenticated');

-- Content: admin can write
create policy "exercises_admin_write" on public.exercises
  for all using (public.is_admin(auth.uid()));
create policy "exercise_translations_admin_write" on public.exercise_translations
  for all using (public.is_admin(auth.uid()));
create policy "routines_admin_write" on public.routines
  for all using (public.is_admin(auth.uid()));
create policy "routine_translations_admin_write" on public.routine_translations
  for all using (public.is_admin(auth.uid()));
create policy "routine_items_admin_write" on public.routine_items
  for all using (public.is_admin(auth.uid()));

-- Sessions: user owns their sessions
create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);

-- Streaks: user owns their streaks
create policy "streaks_select_own" on public.streaks
  for select using (auth.uid() = user_id);
create policy "streaks_update_own" on public.streaks
  for update using (auth.uid() = user_id);
create policy "streaks_insert_own" on public.streaks
  for insert with check (auth.uid() = user_id);
