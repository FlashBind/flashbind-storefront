-- Add tag_batches table
CREATE TABLE public.tag_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_reference text NOT NULL UNIQUE CHECK (batch_reference ~ '^[A-Z0-9.\-_]{3,64}$'),
    status text NOT NULL DEFAULT 'generated',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Secure tag_batches table
ALTER TABLE public.tag_batches ENABLE ROW LEVEL SECURITY;

-- Explicitly revoke access
REVOKE ALL PRIVILEGES ON TABLE public.tag_batches FROM PUBLIC, anon, authenticated;

-- Explicitly grant service_role access
GRANT ALL PRIVILEGES ON TABLE public.tag_batches TO service_role;

-- Explicitly deny anon and authenticated users
CREATE POLICY "Deny anon and authenticated access to tag_batches"
ON public.tag_batches
FOR ALL
TO anon, authenticated
USING (false);

-- Explicitly grant service_role privileges
CREATE POLICY "Service Role Access"
ON public.tag_batches
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add new columns to tags table
ALTER TABLE public.tags
ADD COLUMN batch_id uuid REFERENCES public.tag_batches(id) ON DELETE RESTRICT,
ADD COLUMN product_variant text CHECK (
    product_variant IN (
        'digital-menu',
        'guest-wifi',
        'black-pet-tag',
        'white-pet-tag'
    )
),
ADD COLUMN item_number integer CHECK (item_number BETWEEN 1 AND 100);

-- Add unique constraint to ensure no duplicate items in the same batch
ALTER TABLE public.tags
ADD CONSTRAINT tags_batch_id_item_number_key UNIQUE (batch_id, item_number);

-- Add all-or-nothing constraint for new batch columns
ALTER TABLE public.tags
ADD CONSTRAINT tags_batch_all_or_nothing CHECK (
    (batch_id IS NULL AND product_variant IS NULL AND item_number IS NULL) OR
    (batch_id IS NOT NULL AND product_variant IS NOT NULL AND item_number IS NOT NULL)
);

-- Add variant to type pair matching constraint
ALTER TABLE public.tags
ADD CONSTRAINT tags_variant_type_match CHECK (
    (product_variant = 'digital-menu' AND type = 'menu') OR
    (product_variant = 'guest-wifi' AND type = 'wifi') OR
    (product_variant = 'black-pet-tag' AND type = 'pet_tag') OR
    (product_variant = 'white-pet-tag' AND type = 'pet_tag') OR
    (product_variant IS NULL)
);

-- Add PIN constraint: batch-generated orphan tags must have a valid PIN
ALTER TABLE public.tags
ADD CONSTRAINT tags_batch_pin_check CHECK (
    batch_id IS NULL OR
    is_claimed = true OR
    owner_email IS NOT NULL OR
    (COALESCE(settings->>'activation_pin', '') ~ '^[0-9]{6}$')
);
