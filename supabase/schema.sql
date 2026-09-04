-- StudyHub Database Setup
-- Run this entire script in Supabase Dashboard > SQL Editor > New Query

-- ═══════════════ TABLES ═══════════════

create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  subject text,
  priority text default 'Medium',
  due date,
  time text,
  description text,
  type text default 'assignment',
  done boolean default false,
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  subject text,
  content text,
  created_at timestamptz default now()
);

create table if not exists note_files (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade not null,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz default now()
);

create table if not exists schedule_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  subject text,
  event_type text default 'class',
  start_hour int not null,
  start_min int default 0,
  duration int default 60,
  recurring boolean default false,
  day_of_week int,
  date date,
  created_at timestamptz default now()
);

create table if not exists exams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  subject text,
  date date,
  time text,
  duration int,
  venue text,
  syllabus text,
  notes text,
  done boolean default false,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text default 'Personal',
  priority text default 'Medium',
  due date,
  description text,
  done boolean default false,
  created_at timestamptz default now()
);

-- ═══════════════ ROW LEVEL SECURITY ═══════════════

alter table subjects enable row level security;
alter table assignments enable row level security;
alter table notes enable row level security;
alter table note_files enable row level security;
alter table schedule_events enable row level security;
alter table exams enable row level security;
alter table tasks enable row level security;

-- Drop existing policies if re-running
do $$ begin
  drop policy if exists "Users manage own subjects" on subjects;
  drop policy if exists "Users manage own assignments" on assignments;
  drop policy if exists "Users manage own notes" on notes;
  drop policy if exists "Users manage own note_files" on note_files;
  drop policy if exists "Users manage own schedule_events" on schedule_events;
  drop policy if exists "Users manage own exams" on exams;
  drop policy if exists "Users manage own tasks" on tasks;
end $$;

create policy "Users manage own subjects" on subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own assignments" on assignments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own note_files" on note_files
  for all using (note_id in (select id from notes where user_id = auth.uid()))
  with check (note_id in (select id from notes where user_id = auth.uid()));

create policy "Users manage own schedule_events" on schedule_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own exams" on exams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
