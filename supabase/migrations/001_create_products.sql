create table public.products (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  brand       text        not null,
  category    text        not null,
  rating      text        not null check (rating in ('clean', 'mixed', 'avoid')),
  score       integer     check (score between 0 and 100),
  summary     text,
  image_url   text,
  created_at  timestamptz not null default now()
);
