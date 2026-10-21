-- TEST-ONLY merch foundation. Additive migration; film commerce untouched.
-- Review/apply in an isolated Supabase test project before enabling test checkout.
create table if not exists public.merch_editions (
 product_id text primary key check(product_id in ('nix','rook')),
 environment text not null default 'test' check(environment='test'),
 cap integer not null default 100 check(cap=100),
 reserved integer not null default 0 check(reserved>=0),
 sold integer not null default 0 check(sold>=0),
 check(reserved+sold<=cap)
);
insert into public.merch_editions(product_id) values ('nix'),('rook') on conflict do nothing;
create table if not exists public.merch_orders (
 id uuid primary key default gen_random_uuid(),
 order_number bigint generated always as identity unique,
 request_id uuid not null unique,
 environment text not null default 'test' check(environment='test'),
 cart jsonb not null,
 subtotal integer not null check(subtotal>0),
 currency text not null default 'usd' check(currency='usd'),
 status text not null default 'reserved' check(status in ('reserved','expired','paid_hold','submitting','submitted','shipped','needs_review')),
 session_id text unique,
 payment_intent text,
 customer jsonb,
 provider_order_id text unique,
 tracking jsonb,
 expires_at timestamptz not null default(now()+interval '35 minutes'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.merch_stripe_events (
 event_id text primary key,
 event_type text not null,
 order_id uuid references public.merch_orders(id),
 created_at timestamptz not null default now()
);
alter table public.merch_editions enable row level security;
alter table public.merch_orders enable row level security;
alter table public.merch_stripe_events enable row level security;
revoke all on public.merch_editions,public.merch_orders,public.merch_stripe_events from public,anon,authenticated;
grant all on public.merch_editions,public.merch_orders,public.merch_stripe_events to service_role;
grant usage,select on sequence public.merch_orders_order_number_seq to service_role;

create or replace function public.merch_reserve(p_request_id uuid,p_cart jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o merch_orders; line jsonb; totals record; subtotal integer:=0; count_items integer:=0;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select * into o from merch_orders where request_id=p_request_id for update;
 if found then
  if o.cart<>p_cart then raise exception 'request_conflict'; end if;
  if o.status='expired' then raise exception 'request_expired'; end if;
  return to_jsonb(o);
 end if;
 if jsonb_typeof(p_cart)<>'array' or jsonb_array_length(p_cart) not between 1 and 12 then raise exception 'invalid_cart'; end if;
 for line in select value from jsonb_array_elements(p_cart) loop
  if coalesce(line->>'id','') not in ('nix','rook') or coalesce(line->>'size','') not in ('S','M','L','XL','2XL','3XL') or jsonb_typeof(line->'qty') is distinct from 'number' or coalesce(line->>'qty','') !~ '^[1-9][0-9]*$' then raise exception 'invalid_cart'; end if;
  count_items:=count_items+(line->>'qty')::integer;
 end loop;
 if count_items not between 1 and 10 then raise exception 'invalid_quantity'; end if;
 perform product_id from merch_editions where product_id in(select value->>'id' from jsonb_array_elements(p_cart)) order by product_id for update;
 for totals in select value->>'id' as id,sum((value->>'qty')::integer)::integer as qty from jsonb_array_elements(p_cart) group by value->>'id' loop
  if not exists(select 1 from merch_editions where product_id=totals.id and reserved+sold+totals.qty<=cap) then raise exception 'edition_sold_out'; end if;
  update merch_editions set reserved=reserved+totals.qty where product_id=totals.id;
 end loop;
 subtotal:=count_items*15000;
 insert into merch_orders(request_id,cart,subtotal) values(p_request_id,p_cart,subtotal) returning * into o;
 return to_jsonb(o);
end $$;

create or replace function public.merch_bind_session(p_order_id uuid,p_session_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o merch_orders;
begin
 select * into strict o from merch_orders where id=p_order_id for update;
 if p_session_id is null or p_session_id='' or (o.session_id is not null and o.session_id<>p_session_id) then raise exception 'session_conflict'; end if;
 update merch_orders set session_id=p_session_id,updated_at=now() where id=o.id returning * into o;
 return to_jsonb(o);
end $$;

create or replace function public.merch_mark_paid(p_order_id uuid,p_session_id text,p_subtotal integer,p_customer jsonb,p_payment_intent text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o merch_orders; totals record;
begin
 select * into strict o from merch_orders where id=p_order_id for update;
 if p_session_id is null or p_session_id='' or (o.session_id is not null and o.session_id<>p_session_id) or o.subtotal<>p_subtotal then raise exception 'payment_conflict'; end if;
 if o.status in ('paid_hold','submitting','submitted','shipped','needs_review') then return to_jsonb(o); end if;
 if o.status<>'reserved' then raise exception 'payment_after_release'; end if;
 perform product_id from merch_editions where product_id in(select value->>'id' from jsonb_array_elements(o.cart)) order by product_id for update;
 for totals in select value->>'id' as id,sum((value->>'qty')::integer)::integer as qty from jsonb_array_elements(o.cart) group by value->>'id' loop
  update merch_editions set reserved=reserved-totals.qty,sold=sold+totals.qty where product_id=totals.id;
 end loop;
 update merch_orders set session_id=p_session_id,status='paid_hold',customer=p_customer,payment_intent=p_payment_intent,updated_at=now() where id=o.id returning * into o;
 return to_jsonb(o);
end $$;

-- Call only after re-fetching a signed event's EXPIRED, UNPAID Stripe session.
create or replace function public.merch_release(p_order_id uuid,p_session_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o merch_orders; totals record;
begin
 select * into strict o from merch_orders where id=p_order_id for update;
 if p_session_id is null or p_session_id='' or (o.session_id is not null and o.session_id<>p_session_id) then raise exception 'session_conflict'; end if;
 if o.status<>'reserved' then return to_jsonb(o); end if;
 perform product_id from merch_editions where product_id in(select value->>'id' from jsonb_array_elements(o.cart)) order by product_id for update;
 for totals in select value->>'id' as id,sum((value->>'qty')::integer)::integer as qty from jsonb_array_elements(o.cart) group by value->>'id' loop
  update merch_editions set reserved=reserved-totals.qty where product_id=totals.id;
 end loop;
 update merch_orders set session_id=p_session_id,status='expired',updated_at=now() where id=o.id returning * into o;
 return to_jsonb(o);
end $$;

revoke all on function public.merch_reserve(uuid,jsonb),public.merch_bind_session(uuid,text),public.merch_mark_paid(uuid,text,integer,jsonb,text),public.merch_release(uuid,text) from public,anon,authenticated;
grant execute on function public.merch_reserve(uuid,jsonb),public.merch_bind_session(uuid,text),public.merch_mark_paid(uuid,text,integer,jsonb,text),public.merch_release(uuid,text) to service_role;
