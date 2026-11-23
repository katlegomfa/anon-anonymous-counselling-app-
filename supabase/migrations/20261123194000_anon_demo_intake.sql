-- Minimal Anon demonstration intake. No identity, contact details, or counselling narrative.
create table public.demo_pathway_requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.service_catalog(id),
  consent_version text not null check (char_length(consent_version) between 1 and 40),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index demo_pathway_requests_expiry_idx on public.demo_pathway_requests(expires_at);
alter table public.demo_pathway_requests enable row level security;
revoke all on public.demo_pathway_requests from anon, authenticated, public;
grant insert on public.demo_pathway_requests to service_role;
create or replace function public.submit_anon_demo_request(p_service_title text, p_consent_version text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_service_id uuid;
  v_request_id uuid;
begin
  if p_service_title is null or length(p_service_title) > 180 then
    raise exception 'Invalid support pathway';
  end if;
  if p_consent_version is null or length(p_consent_version) < 1 or length(p_consent_version) > 40 then
    raise exception 'Consent version is required';
  end if;
  select s.id into v_service_id
  from public.service_catalog s
  where s.title = p_service_title and s.is_active = true
  limit 1;
  if v_service_id is null then
    raise exception 'Choose an active support pathway';
  end if;
  insert into public.demo_pathway_requests(service_id, consent_version)
  values (v_service_id, p_consent_version)
  returning id into v_request_id;
  return v_request_id;
end;
$$;
revoke all on function public.submit_anon_demo_request(text, text) from public, anon, authenticated;
grant execute on function public.submit_anon_demo_request(text, text) to service_role;
