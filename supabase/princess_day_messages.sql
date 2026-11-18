create table if not exists public.princess_day_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 1 and 2000),
  mood text,
  created_at timestamptz not null default now(),
  status text not null default 'unread'
);

alter table public.princess_day_messages enable row level security;
