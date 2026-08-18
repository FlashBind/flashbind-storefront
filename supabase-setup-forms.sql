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

-- Enable RLS but allow inserting from our server
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role (admin) to do everything
CREATE POLICY "Enable all access for service role"
ON public.contact_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Create the Storage Bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'attachments' );

-- Allow service role to insert/upload objects
CREATE POLICY "Service Role Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'attachments' );

-- Allow service role to update/delete objects
CREATE POLICY "Service Role Update/Delete" 
ON storage.objects FOR ALL 
USING ( bucket_id = 'attachments' );
