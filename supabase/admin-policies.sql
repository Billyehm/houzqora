-- HOUZQORA admin write path: service role, NOT open policies.
--
-- SUPERSEDES the earlier open-policy version of this file. Do NOT
-- run open insert/update/delete policies for the publishable key:
-- that key is public in the app bundle, so anyone could write.
--
-- How admin writes work now:
-- 1. The admin panel login (ADMIN_USERNAME / ADMIN_PASSWORD in
--    .env.local) is checked on the server.
-- 2. Only then does a server action write with the service role
--    key (SUPABASE_SERVICE_ROLE_KEY, server only, never in the
--    browser), which bypasses row level security.
-- 3. Public readers still only get the select policy from
--    supabase/schema.sql. No write policy for the publishable key
--    is needed, or wanted.
--
-- Run this once in the Supabase SQL editor, or via the Management
-- API. It removes any open write policies if they were ever run,
-- and grants the service role the table access it needs. The
-- service role bypasses row level security, but it still needs
-- table grants, otherwise writes fail with permission denied.

drop policy if exists "properties insert" on public.properties;
drop policy if exists "properties update" on public.properties;
drop policy if exists "properties delete" on public.properties;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
