-- Drive Quest: initial schema
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (public user data — no email exposure)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  learning_points integer not null default 0 check (learning_points >= 0),
  mock_exam_points integer not null default 0 check (mock_exam_points >= 0),
  total_points integer not null default 0 check (total_points >= 0),
  level integer not null default 1 check (level >= 1),
  best_mock_exam_score integer not null default 0 check (best_mock_exam_score >= 0 and best_mock_exam_score <= 100),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length check (char_length(nickname) between 2 and 20),
  constraint profiles_nickname_unique unique (nickname)
);

-- ---------------------------------------------------------------------------
-- questions (official question bank)
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_number integer not null,
  category text not null,
  content text not null,
  image_url text,
  option_1 text not null,
  option_2 text not null,
  option_3 text not null,
  option_4 text not null,
  correct_answer smallint not null check (correct_answer between 1 and 4),
  explanation text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint questions_number_unique unique (question_number)
);

create index questions_category_idx on public.questions (category);
create index questions_active_idx on public.questions (is_active) where is_active = true;

-- ---------------------------------------------------------------------------
-- learning_sessions (daily 10-question sessions)
-- ---------------------------------------------------------------------------
create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default (timezone('utc', now()))::date,
  questions_count integer not null default 10 check (questions_count > 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  points_earned integer not null default 0 check (points_earned >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index learning_sessions_user_date_idx
  on public.learning_sessions (user_id, session_date desc);

-- ---------------------------------------------------------------------------
-- mock_exams
-- ---------------------------------------------------------------------------
create table public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  total_questions integer not null check (total_questions > 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  score_percent numeric(5, 2) not null default 0 check (score_percent >= 0 and score_percent <= 100),
  points_earned integer not null default 0 check (points_earned >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index mock_exams_user_idx on public.mock_exams (user_id, completed_at desc nulls last);

-- ---------------------------------------------------------------------------
-- user_question_attempts
-- ---------------------------------------------------------------------------
create table public.user_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  learning_session_id uuid references public.learning_sessions (id) on delete set null,
  mock_exam_id uuid references public.mock_exams (id) on delete set null,
  selected_answer smallint not null check (selected_answer between 1 and 4),
  is_correct boolean not null,
  points_earned integer not null default 0 check (points_earned >= 0),
  attempted_at timestamptz not null default now(),
  constraint attempt_context_check check (
    (learning_session_id is not null and mock_exam_id is null)
    or (learning_session_id is null and mock_exam_id is not null)
    or (learning_session_id is null and mock_exam_id is null)
  )
);

create index attempts_user_idx on public.user_question_attempts (user_id, attempted_at desc);
create index attempts_question_idx on public.user_question_attempts (question_id);

-- ---------------------------------------------------------------------------
-- wrong_answers (auto-saved on incorrect attempts)
-- ---------------------------------------------------------------------------
create table public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_answer smallint not null check (selected_answer between 1 and 4),
  attempt_count integer not null default 1 check (attempt_count > 0),
  last_wrong_at timestamptz not null default now(),
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint wrong_answers_user_question_unique unique (user_id, question_id)
);

create index wrong_answers_user_unresolved_idx
  on public.wrong_answers (user_id, last_wrong_at desc)
  where is_resolved = false;

-- ---------------------------------------------------------------------------
-- Helpers: level from total points
-- ---------------------------------------------------------------------------
create or replace function public.calculate_level(p_total_points integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(p_total_points / 100.0)::integer + 1);
$$;

create or replace function public.sync_profile_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.total_points := new.learning_points + new.mock_exam_points;
  new.level := public.calculate_level(new.total_points);
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_points_sync
  before insert or update of learning_points, mock_exam_points
  on public.profiles
  for each row
  execute function public.sync_profile_points();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_nickname text;
  final_nickname text;
  suffix integer := 0;
begin
  base_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    '드라이버' || substr(replace(new.id::text, '-', ''), 1, 6)
  );
  final_nickname := base_nickname;

  while exists (select 1 from public.profiles where nickname = final_nickname) loop
    suffix := suffix + 1;
    final_nickname := base_nickname || suffix::text;
  end loop;

  insert into public.profiles (id, nickname)
  values (new.id, final_nickname);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Save wrong answer on incorrect attempt
create or replace function public.handle_wrong_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_correct = false then
    insert into public.wrong_answers (user_id, question_id, selected_answer, attempt_count, last_wrong_at, is_resolved)
    values (new.user_id, new.question_id, new.selected_answer, 1, new.attempted_at, false)
    on conflict (user_id, question_id) do update
      set selected_answer = excluded.selected_answer,
          attempt_count = public.wrong_answers.attempt_count + 1,
          last_wrong_at = excluded.last_wrong_at,
          is_resolved = false;
  elsif new.is_correct = true then
    update public.wrong_answers
      set is_resolved = true
    where user_id = new.user_id and question_id = new.question_id;
  end if;
  return new;
end;
$$;

create trigger on_attempt_recorded
  after insert on public.user_question_attempts
  for each row
  execute function public.handle_wrong_attempt();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.mock_exams enable row level security;
alter table public.user_question_attempts enable row level security;
alter table public.wrong_answers enable row level security;

-- profiles: own row full access; others read public fields only (no email — stored in auth only)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can view public profile fields for ranking"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- questions: read-only for authenticated users
create policy "Authenticated users can read active questions"
  on public.questions for select
  to authenticated
  using (is_active = true);

-- learning_sessions
create policy "Users manage own learning sessions"
  on public.learning_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- mock_exams
create policy "Users manage own mock exams"
  on public.mock_exams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_question_attempts
create policy "Users manage own attempts"
  on public.user_question_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- wrong_answers
create policy "Users manage own wrong answers"
  on public.wrong_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Ranking view (public leaderboard — no email)
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard as
select
  id,
  nickname,
  avatar_url,
  total_points,
  level,
  learning_points,
  mock_exam_points,
  best_mock_exam_score,
  rank() over (order by total_points desc, created_at asc) as rank
from public.profiles
order by total_points desc, created_at asc;

grant select on public.leaderboard to authenticated;
