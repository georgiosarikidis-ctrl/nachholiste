-- ─────────────────────────────────────────────────────────────────────────────
-- nachholiste — Supabase Datenbankschema
-- Ausführen in: Supabase Dashboard → SQL Editor → "New Query" → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type task_priority as enum ('niedrig', 'mittel', 'hoch', 'kritisch');
create type task_status   as enum ('offen', 'in_bearbeitung', 'wartet', 'erledigt', 'verschoben');
create type task_category as enum (
  'privat', 'arbeit', 'studium', 'lernen',
  'auto', 'gesundheit', 'finanzen', 'sonstiges'
);
create type repeat_rule as enum ('daily', 'weekly', 'monthly');

-- ─── Tasks table ─────────────────────────────────────────────────────────────

create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,

  title          text not null check (char_length(title) > 0),
  description    text,
  notes          text,

  category       task_category not null default 'sonstiges',
  priority       task_priority not null default 'mittel',
  status         task_status   not null default 'offen',

  due_date       date,
  reminder_date  timestamptz,
  repeat_rule    repeat_rule,

  tags           text[] not null default '{}',

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  completed_at   timestamptz,
  deleted_at     timestamptz   -- soft delete
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index idx_tasks_user_id     on public.tasks(user_id);
create index idx_tasks_status      on public.tasks(status);
create index idx_tasks_due_date    on public.tasks(due_date);
create index idx_tasks_deleted_at  on public.tasks(deleted_at);
create index idx_tasks_priority    on public.tasks(priority);
create index idx_tasks_category    on public.tasks(category);

-- Full-text search
create index idx_tasks_search on public.tasks
  using gin(to_tsvector('german', title || ' ' || coalesce(description, '')));

-- ─── updated_at trigger ───────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.tasks
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.tasks enable row level security;

-- Each user can only see, insert, update, delete their own tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ─── Realtime ─────────────────────────────────────────────────────────────────

-- Enable realtime for the tasks table
alter publication supabase_realtime add table public.tasks;

-- ─── Sample data (optional — zum Testen) ─────────────────────────────────────
-- Erst nach dem ersten Login ausführen, dann deine user_id einsetzen:
--
-- insert into public.tasks (user_id, title, category, priority, status, due_date, tags)
-- values
--   ('DEINE-USER-ID', 'Differentialgleichungen wiederholen', 'lernen', 'hoch', 'offen', current_date, array['Mathe']),
--   ('DEINE-USER-ID', 'Werkstatttermin vereinbaren', 'auto', 'mittel', 'offen', current_date + 3, array[]::text[]),
--   ('DEINE-USER-ID', 'Rechnung bezahlen', 'finanzen', 'kritisch', 'offen', current_date - 1, array['dringend']);
