create table if not exists public.oddstable_reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Cheap table', 'Good odds', 'Bad data')),
  venue text not null,
  game text not null,
  value text not null,
  note text not null default 'No extra notes.',
  trust integer not null default 62 check (trust between 0 and 100),
  status text not null default 'Pending moderation',
  confirmations integer not null default 1 check (confirmations >= 0),
  created_at timestamptz not null default now()
);

alter table public.oddstable_reports enable row level security;

drop policy if exists "Oddstable reports are readable" on public.oddstable_reports;
create policy "Oddstable reports are readable"
on public.oddstable_reports for select
using (true);

drop policy if exists "Anyone can submit oddstable reports" on public.oddstable_reports;
create policy "Anyone can submit oddstable reports"
on public.oddstable_reports for insert
with check (
  char_length(trim(venue)) between 2 and 120
  and char_length(trim(value)) between 2 and 160
  and char_length(trim(game)) between 2 and 80
);
