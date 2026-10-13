-- Run in the dedicated Supabase project. No anonymous/authenticated client writes.
create table if not exists public.saints_receipts (
 session_id text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 sku text not null,
 created_at timestamptz not null default now()
);
create index if not exists saints_receipts_user on public.saints_receipts(user_id);
create table if not exists public.saints_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 episode_id text not null,
 position double precision not null check(position >= 0 and position <= 86400),
 updated_at timestamptz not null default now(),
 primary key(user_id,episode_id)
);
alter table public.saints_receipts enable row level security;
alter table public.saints_progress enable row level security;
revoke all on public.saints_receipts, public.saints_progress from anon, authenticated;
grant select,insert,update on public.saints_receipts, public.saints_progress to service_role;

-- One pending checkout per account/product, shared by all server instances.
-- The immutable parameters and UUID allow safe retry even if Stripe succeeded
-- but saving its Session ID failed. Each Session expires with this reservation.
create table if not exists public.saints_checkouts (
 user_id uuid not null references auth.users(id) on delete cascade,
 sku text not null,
 id uuid not null unique default gen_random_uuid(),
 params jsonb not null,
 expires_at bigint not null,
 session_id text,
 primary key(user_id,sku)
);
alter table public.saints_checkouts enable row level security;
revoke all on public.saints_checkouts from anon, authenticated;
grant select,insert,update,delete on public.saints_checkouts to service_role;

create or replace function public.saints_reserve_checkout(p_user_id uuid,p_sku text,p_params jsonb)
returns setof public.saints_checkouts
language plpgsql security invoker set search_path = '' as $$
declare
 current_time_seconds bigint := floor(extract(epoch from now()));
begin
 return query
 insert into public.saints_checkouts as existing(user_id,sku,params,expires_at)
 values(p_user_id,p_sku,p_params,current_time_seconds + 3600)
 on conflict(user_id,sku) do update set sku=existing.sku
 returning existing.*;
end;
$$;
revoke all on function public.saints_reserve_checkout(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.saints_reserve_checkout(uuid,text,jsonb) to service_role;
