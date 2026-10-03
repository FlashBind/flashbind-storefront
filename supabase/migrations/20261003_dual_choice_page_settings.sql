-- Dual Choice page settings per business (SUB-001).
--
-- page_language: default language of the page. The page follows the
--   visitor's phone language when it is Lithuanian or English; otherwise it
--   uses this default. Existing businesses get 'lt'.
-- display_name: the short name shown on the page (e.g. "Stasmila"). Empty
--   means business_name is shown. business_name stays the legal name, used
--   where the controller must be named (privacy note, contact consent).
-- logo_background: the logo's solid background colour, detected in the
--   browser when the logo is uploaded. When set, the page fills the logo
--   tile with it edge to edge; NULL means a transparent or light logo,
--   shown on white.
--
-- Rollback:
--   ALTER TABLE public.business_entitlements
--     DROP COLUMN page_language, DROP COLUMN display_name, DROP COLUMN logo_background;
-- (code from before this change does not read these columns).

ALTER TABLE public.business_entitlements
    ADD COLUMN page_language text NOT NULL DEFAULT 'lt'
        CONSTRAINT business_entitlements_page_language_check CHECK (page_language IN ('lt', 'en')),
    ADD COLUMN display_name text
        CONSTRAINT business_entitlements_display_name_check CHECK (char_length(display_name) <= 120),
    ADD COLUMN logo_background text
        CONSTRAINT business_entitlements_logo_background_check CHECK (logo_background IS NULL OR logo_background ~ '^#[0-9a-f]{6}$');
