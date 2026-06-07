-- Таблица аналитических событий (без авторизации, insert от anon)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Если таблица была создана со столбцом payload:
-- alter table public.events rename column payload to properties;

create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_event_name_idx on public.events (event_name);
create index if not exists events_created_at_idx on public.events (created_at desc);

alter table public.events enable row level security;

drop policy if exists "anon_insert_events" on public.events;
create policy "anon_insert_events"
  on public.events
  for insert
  to anon
  with check (true);

-- MVP: чтение для /admin через anon key.
-- Для production закрыть чтение events и делать admin через server-side + auth.
drop policy if exists "anon_select_events_mvp" on public.events;
create policy "anon_select_events_mvp"
  on public.events
  for select
  to anon
  using (true);
