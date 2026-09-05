BEGIN;

-- Quote artwork may contain confidential customer designs. Keep the bucket
-- private and let the server issue time-limited signed URLs when necessary.
UPDATE storage.buckets
SET public = false
WHERE id = 'attachments';

-- These legacy policies were created without role restrictions and exposed the
-- bucket to anonymous clients. The server uses the service role and does not
-- require storage object policies.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Update/Delete" ON storage.objects;

COMMIT;
