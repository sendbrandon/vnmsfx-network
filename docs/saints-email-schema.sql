-- Additive migration. Existing purchase receipts and permissions stay intact.
create table if not exists public.saints_purchase_emails (
 session_id text primary key references public.saints_receipts(session_id) on delete cascade,
 payload jsonb not null,
 first_attempt_at timestamptz,
 lease_until timestamptz,
 lease_token uuid,
 provider_id text,
 sent_at timestamptz
);
alter table public.saints_purchase_emails enable row level security;
revoke all on public.saints_purchase_emails from public,anon,authenticated;
grant select,insert,update on public.saints_purchase_emails to service_role;

create or replace function public.saints_claim_purchase_email(p_session_id text,p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 entry public.saints_purchase_emails;
 claim_token uuid := gen_random_uuid();
begin
 insert into public.saints_purchase_emails(session_id,payload)
 values(p_session_id,p_payload) on conflict(session_id) do nothing;
 select * into entry from public.saints_purchase_emails where session_id=p_session_id for update;
 if entry.sent_at is not null then return jsonb_build_object('state','sent'); end if;
 if entry.first_attempt_at < now() - interval '23 hours' then
  return jsonb_build_object('state','needs_review');
 end if;
 if entry.lease_until > now() then return jsonb_build_object('state','busy'); end if;
 update public.saints_purchase_emails set first_attempt_at=coalesce(first_attempt_at,now()),
 lease_until=now()+interval '2 minutes',lease_token=claim_token where session_id=p_session_id;
 return jsonb_build_object('state','claimed','payload',entry.payload,'token',claim_token);
end;
$$;
revoke all on function public.saints_claim_purchase_email(text,jsonb) from public,anon,authenticated;
grant execute on function public.saints_claim_purchase_email(text,jsonb) to service_role;
