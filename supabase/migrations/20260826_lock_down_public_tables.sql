BEGIN;

-- Ensure RLS is enabled on all four tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Revoke all privileges from anon and authenticated roles
REVOKE ALL PRIVILEGES ON TABLE public.tags FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.redirects FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.contact_messages FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.rate_limits FROM anon, authenticated;

-- Ensure service_role retains all privileges
GRANT ALL PRIVILEGES ON TABLE public.tags TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.redirects TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.contact_messages TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.rate_limits TO service_role;

-- Drop unsafe policies exactly as specified
-- contact_messages
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable all access for service role" ON public.contact_messages;
DROP POLICY IF EXISTS "Service role can read contact messages" ON public.contact_messages;

-- rate_limits
DROP POLICY IF EXISTS "Service role only" ON public.rate_limits;

-- redirects
DROP POLICY IF EXISTS "Service role only for redirects" ON public.redirects;

-- tags
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can view their own tags" ON public.tags;

COMMIT;
