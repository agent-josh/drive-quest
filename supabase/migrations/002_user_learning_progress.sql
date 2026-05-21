-- 학습 진행(오답·코스·이어하기) 클라우드 저장 — 앱 DemoStorage JSON 동기화

create table if not exists public.user_learning_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists user_learning_progress_updated_idx
  on public.user_learning_progress (updated_at desc);

alter table public.user_learning_progress enable row level security;

create policy "Users manage own learning progress"
  on public.user_learning_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Google 로그인 시 닉네임: full_name / name 메타데이터 활용
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
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    '드라이버' || substr(replace(new.id::text, '-', ''), 1, 6)
  );
  final_nickname := left(base_nickname, 20);

  while exists (select 1 from public.profiles where nickname = final_nickname) loop
    suffix := suffix + 1;
    final_nickname := left(base_nickname, 17) || suffix::text;
  end loop;

  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    final_nickname,
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  );

  insert into public.user_learning_progress (user_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
