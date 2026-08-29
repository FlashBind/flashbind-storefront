-- Verification Queries for public table lockdown

-- 1. Verify RLS is enabled
SELECT tablename AS table_name, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('tags', 'redirects', 'contact_messages', 'rate_limits');

-- 2. Verify no anon/authenticated privileges on the four tables
-- Ensure table_privileges doesn't return rows for anon or authenticated
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('tags', 'redirects', 'contact_messages', 'rate_limits')
  AND grantee IN ('anon', 'authenticated');

-- 3. Verify service_role retains privileges
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('tags', 'redirects', 'contact_messages', 'rate_limits')
  AND grantee = 'service_role';

-- 4. Verify no policies remain assigned to PUBLIC, anon, or authenticated on these tables
SELECT tablename AS table_name, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tags', 'redirects', 'contact_messages', 'rate_limits')
  AND (
    roles::text ILIKE '%public%' OR 
    roles::text ILIKE '%anon%' OR 
    roles::text ILIKE '%authenticated%'
  );
