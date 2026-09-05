-- Run this script in the Supabase SQL Editor

-- 1. Create the contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL, -- 'contact' or 'quote'
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    has_design BOOLEAN DEFAULT false,
    attachment_url TEXT
);

-- Enable RLS. The server uses the Supabase service role, which bypasses RLS.
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.contact_messages FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.contact_messages TO service_role;

-- 2. Create the Storage Bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Do not add anon/authenticated storage policies for this bucket. Quote files are
-- uploaded with the service role and shared only through short-lived signed URLs.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Update/Delete" ON storage.objects;
