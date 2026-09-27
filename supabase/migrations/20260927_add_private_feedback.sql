-- Google Review "Dual Choice" + private feedback inbox (SUB-001).
-- Plan: Command Center engineering/PLAN_DUAL_CHOICE_FEEDBACK.md.
--
-- All three tables are server-only, like tag_batches: RLS on, no anon or
-- authenticated privileges; the storefront reaches them with the service
-- role and enforces ownership in code (owner_email filters).
--
-- Per-stand settings (location label, alert email, Dual Choice on/off) live
-- in tags.settings, so a business with many branches keeps one account that
-- owns one review stand per branch.

BEGIN;

-- 1. Subscription entitlement + account-level business profile.
CREATE TABLE public.business_entitlements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email text NOT NULL UNIQUE CHECK (char_length(owner_email) BETWEEN 3 AND 254),
    plan text NOT NULL DEFAULT 'growth' CHECK (plan IN ('growth')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'shopify')),
    shopify_subscription_id text CHECK (char_length(shopify_subscription_id) <= 100),
    current_period_end timestamp with time zone,
    business_name text CHECK (char_length(business_name) <= 120),
    logo_data_url text CHECK (
        logo_data_url IS NULL OR (
            logo_data_url ~ '^data:image/(jpeg|png);base64,'
            AND char_length(logo_data_url) <= 700000
        )
    ),
    notes text CHECK (char_length(notes) <= 500),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Private feedback left through a review stand's Dual Choice page.
CREATE TABLE public.private_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_id text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    -- Snapshot of the stand's owner when the feedback arrived. The inbox
    -- filters on this, so a stand that is later reset and re-activated by
    -- someone else never exposes earlier feedback to the new owner.
    owner_email text NOT NULL CHECK (char_length(owner_email) BETWEEN 3 AND 254),
    location_label text CHECK (char_length(location_label) <= 80),
    message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
    contact_name text CHECK (char_length(contact_name) <= 100),
    contact_email text CHECK (char_length(contact_email) <= 254),
    contact_phone text CHECK (char_length(contact_phone) <= 40),
    contact_consent boolean NOT NULL DEFAULT false,
    alert_sent_at timestamp with time zone,
    read_at timestamp with time zone,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Contact details are only stored with the visitor's consent.
    CONSTRAINT private_feedback_contact_needs_consent CHECK (
        contact_consent
        OR (contact_name IS NULL AND contact_email IS NULL AND contact_phone IS NULL)
    )
);

CREATE INDEX private_feedback_owner_created_idx ON public.private_feedback (owner_email, created_at DESC);
CREATE INDEX private_feedback_tag_created_idx ON public.private_feedback (tag_id, created_at DESC);
CREATE INDEX private_feedback_created_idx ON public.private_feedback (created_at);

-- 3. Daily counts per stand (no personal data, no cookies).
CREATE TABLE public.review_stand_stats (
    tag_id text NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    day date NOT NULL,
    page_views integer NOT NULL DEFAULT 0 CHECK (page_views >= 0),
    google_clicks integer NOT NULL DEFAULT 0 CHECK (google_clicks >= 0),
    feedback_count integer NOT NULL DEFAULT 0 CHECK (feedback_count >= 0),
    PRIMARY KEY (tag_id, day)
);

-- Atomic counter increment (avoids read-then-write races).
CREATE FUNCTION public.record_review_stand_event(p_tag_id text, p_event text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF p_event NOT IN ('view', 'google', 'feedback') THEN
        RAISE EXCEPTION 'unknown review stand event';
    END IF;

    INSERT INTO public.review_stand_stats AS s (tag_id, day, page_views, google_clicks, feedback_count)
    VALUES (
        p_tag_id,
        (now() AT TIME ZONE 'utc')::date,
        (p_event = 'view')::int,
        (p_event = 'google')::int,
        (p_event = 'feedback')::int
    )
    ON CONFLICT (tag_id, day) DO UPDATE SET
        page_views = s.page_views + excluded.page_views,
        google_clicks = s.google_clicks + excluded.google_clicks,
        feedback_count = s.feedback_count + excluded.feedback_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_review_stand_event(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_review_stand_event(text, text) TO service_role;

-- 4. Lock the tables down (same pattern as tag_batches).
ALTER TABLE public.business_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_stand_stats ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.business_entitlements FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.private_feedback FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.review_stand_stats FROM PUBLIC, anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE public.business_entitlements TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.private_feedback TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.review_stand_stats TO service_role;

CREATE POLICY "Deny anon and authenticated access to business_entitlements"
ON public.business_entitlements FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "Service Role Access"
ON public.business_entitlements FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Deny anon and authenticated access to private_feedback"
ON public.private_feedback FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "Service Role Access"
ON public.private_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Deny anon and authenticated access to review_stand_stats"
ON public.review_stand_stats FOR ALL TO anon, authenticated USING (false);
CREATE POLICY "Service Role Access"
ON public.review_stand_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMIT;
