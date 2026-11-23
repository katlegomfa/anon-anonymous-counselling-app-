-- Anon secure core. Apply only to the dedicated Anon Supabase project.
create extension if not exists pgcrypto;
create type public.app_role as enum ('client','counsellor','admin');
create type public.appointment_status as enum ('requested','confirmed','declined','cancelled','completed');
create type public.conversation_status as enum ('requested','active','closed');
create type public.message_kind as enum ('text','system');
create table public.profiles(user_id uuid primary key references auth.users(id) on delete cascade,role public.app_role not null default 'client',display_name text not null default 'Guest' check(char_length(display_name) between 1 and 60),is_counsellor_verified boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.service_catalog(id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,description text not null default '',is_active boolean not null default true,created_at timestamptz not null default now());
create table public.counsellor_services(counsellor_id uuid not null references public.profiles(user_id) on delete cascade,service_id uuid not null references public.service_catalog(id) on delete cascade,primary key(counsellor_id,service_id));
create table public.appointments(id uuid primary key default gen_random_uuid(),client_id uuid not null references public.profiles(user_id),counsellor_id uuid references public.profiles(user_id),service_id uuid not null references public.service_catalog(id),requested_start timestamptz not null,duration_minutes smallint not null default 50 check(duration_minutes between 15 and 180),delivery_method text not null check(delivery_method in ('text','video','in_person','group')),status public.appointment_status not null default 'requested',client_timezone text not null default 'Africa/Gaborone',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(counsellor_id is null or counsellor_id<>client_id));
create index appointments_client_time_idx on public.appointments(client_id,requested_start desc);
create index appointments_counsellor_time_idx on public.appointments(counsellor_id,requested_start) where counsellor_id is not null;
create table public.conversations(id uuid primary key default gen_random_uuid(),client_id uuid not null references public.profiles(user_id),counsellor_id uuid references public.profiles(user_id),appointment_id uuid references public.appointments(id),service_id uuid not null references public.service_catalog(id),status public.conversation_status not null default 'requested',created_at timestamptz not null default now(),closed_at timestamptz,check(counsellor_id is null or counsellor_id<>client_id));
create index conversations_client_idx on public.conversations(client_id,created_at desc);
create index conversations_counsellor_idx on public.conversations(counsellor_id,created_at desc);
create table public.messages(id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations(id) on delete cascade,sender_id uuid not null references public.profiles(user_id),kind public.message_kind not null default 'text',body text not null check(char_length(body) between 1 and 10000),created_at timestamptz not null default now(),read_at timestamptz);
create index messages_conversation_time_idx on public.messages(conversation_id,created_at);
create table public.consents(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(user_id) on delete cascade,notice_version text not null,consent_type text not null check(consent_type in ('privacy_notice','service_terms','messaging_notice')),accepted_at timestamptz not null default now(),withdrawn_at timestamptz);
create index consents_user_idx on public.consents(user_id,accepted_at desc);
create table public.audit_events(id bigint generated always as identity primary key,actor_id uuid references public.profiles(user_id),event_type text not null,target_type text not null,target_id uuid,created_at timestamptz not null default now());
create index audit_events_created_idx on public.audit_events(created_at desc);
insert into public.service_catalog(slug,title,description) values
('online-therapy','Online therapy','Online counselling access pathway.'),
('depression-therapy','Depression therapy','Support pathway for depression-related concerns.'),
('ocd-therapy','Therapy for OCD','Support pathway for obsessive-compulsive concerns.'),
('anxiety-therapy','Anxiety therapy','Support pathway for anxiety-related concerns.'),
('mens-therapy','Men''s therapy','Support pathway for men''s wellbeing.'),
('relationship-counselling','Relationship counselling','Relationship counselling pathway.'),
('self-esteem-therapy','Self-esteem therapy','Support pathway for self-esteem concerns.'),
('grief-counselling','Grief counselling','Support pathway for grief and bereavement.'),
('maternal-mental-health','Maternal mental health','Support pathway for maternal mental health.'),
('lgbtqia-therapy','LGBTQIA+ therapy','Affirming support pathway.'),
('addiction-counselling','Addiction counselling','Support pathway for addiction-related concerns.'),
('mental-health-tests','Mental-health tests','Screening/assessment pathway; not a diagnosis.'),
('hiv-aids-counselling','HIV/AIDS counselling','Confidential counselling pathway.'),
('gambling-addiction','Gambling addiction','Support pathway for gambling-related harm.'),
('relationship-therapy','Relationship therapy','CBT, emotion-focused and communication-based approaches.'),
('veterans-support','Veterans','Support pathway for veterans.'),
('postpartum-mental-health','Postpartum mental health','Support pathway for postpartum mental health.')
on conflict(slug) do nothing;
create or replace function public.current_app_role() returns public.app_role language sql stable security invoker set search_path='' as $$ select p.role from public.profiles p where p.user_id=(select auth.uid()) $$;
alter table public.profiles enable row level security;
alter table public.service_catalog enable row level security;
alter table public.counsellor_services enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.consents enable row level security;
alter table public.audit_events enable row level security;
create policy "active services are readable" on public.service_catalog for select to anon,authenticated using(is_active=true);
create policy "profile owner reads profile" on public.profiles for select to authenticated using(user_id=(select auth.uid()));
create policy "profile owner updates display name" on public.profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and role=(select public.current_app_role()));
create policy "verified counsellor services visible" on public.counsellor_services for select to authenticated using(exists(select 1 from public.profiles p where p.user_id=counsellor_id and p.role='counsellor' and p.is_counsellor_verified=true));
create policy "client creates own appointment" on public.appointments for insert to authenticated with check(client_id=(select auth.uid()) and counsellor_id is null and status='requested');
create policy "appointment participants read" on public.appointments for select to authenticated using(client_id=(select auth.uid()) or counsellor_id=(select auth.uid()) or (select public.current_app_role())='admin');
create policy "assigned counsellor updates appointment" on public.appointments for update to authenticated using(counsellor_id=(select auth.uid()) and (select public.current_app_role())='counsellor' and exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.is_counsellor_verified)) with check(counsellor_id=(select auth.uid()) and status in('confirmed','declined','cancelled','completed'));
create policy "client creates own conversation request" on public.conversations for insert to authenticated with check(client_id=(select auth.uid()) and counsellor_id is null and status='requested');
create policy "conversation participants read" on public.conversations for select to authenticated using(client_id=(select auth.uid()) or counsellor_id=(select auth.uid()) or (select public.current_app_role())='admin');
create policy "participants read messages" on public.messages for select to authenticated using(exists(select 1 from public.conversations c where c.id=conversation_id and c.status='active' and (c.client_id=(select auth.uid()) or c.counsellor_id=(select auth.uid()))));
create policy "participants send messages" on public.messages for insert to authenticated with check(sender_id=(select auth.uid()) and kind='text' and exists(select 1 from public.conversations c where c.id=conversation_id and c.status='active' and (c.client_id=(select auth.uid()) or c.counsellor_id=(select auth.uid()))));
create policy "users read own consents" on public.consents for select to authenticated using(user_id=(select auth.uid()));
create policy "users record own consents" on public.consents for insert to authenticated with check(user_id=(select auth.uid()));
revoke all on public.audit_events from anon,authenticated;
revoke insert,update,delete on public.profiles from anon,authenticated;
revoke insert,update,delete on public.service_catalog from anon,authenticated;
revoke insert,update,delete on public.counsellor_services from anon,authenticated;
revoke delete on public.appointments from anon,authenticated;
revoke update,delete on public.conversations from anon,authenticated;
revoke update,delete on public.messages from anon,authenticated;
revoke update,delete on public.consents from anon,authenticated;
grant select on public.service_catalog to anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select on public.counsellor_services to authenticated;
grant select,insert on public.appointments to authenticated;
grant update(status) on public.appointments to authenticated;
grant select,insert on public.conversations to authenticated;
grant select,insert on public.messages to authenticated;
grant select,insert on public.consents to authenticated;
