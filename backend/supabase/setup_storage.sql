-- =====================================================
-- Scout9 Storage Buckets Setup
-- =====================================================
-- Run this script in Supabase SQL Editor to create storage buckets
-- Navigate to: Project Dashboard → SQL Editor → New Query

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Reports bucket for exported reports (HTML/JSON/PDF)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'reports',
    'reports',
    false,  -- Private bucket (requires authentication)
    10485760,  -- 10MB max file size
    ARRAY['application/pdf', 'text/html', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Report exports bucket (publicly accessible exports)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-exports',
    'report-exports',
    true,  -- Public bucket (accessible via URL)
    10485760,  -- 10MB max file size
    ARRAY['application/pdf', 'text/html', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Team logos bucket (for custom team branding)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'team-logos',
    'team-logos',
    true,  -- Public bucket
    2097152,  -- 2MB max file size
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- Reports bucket: Service role can upload, authenticated users can read
CREATE POLICY "Service role can upload reports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated users can read reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

CREATE POLICY "Service role can delete reports"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'reports');

-- Report exports bucket: Public read, service role write
CREATE POLICY "Public read access to exports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'report-exports');

CREATE POLICY "Service role can upload exports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'report-exports');

CREATE POLICY "Service role can delete exports"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'report-exports');

-- Team logos bucket: Public read, authenticated write
CREATE POLICY "Public read access to team logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-logos');

CREATE POLICY "Users can delete their own team logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- 3. VERIFY BUCKETS
-- =====================================================

-- List all buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE name IN ('reports', 'report-exports', 'team-logos');

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Upload file from backend (Python):
-- from supabase import create_client
-- supabase = create_client(url, service_role_key)
-- with open('report.pdf', 'rb') as f:
--     supabase.storage.from_('reports').upload(
--         f'reports/{report_id}/report.pdf',
--         f
--     )

-- Get public URL:
-- url = supabase.storage.from_('report-exports').get_public_url(
--     f'{report_id}/report.pdf'
-- )

-- Download file:
-- data = supabase.storage.from_('reports').download(
--     f'reports/{report_id}/report.pdf'
-- )

-- =====================================================
-- COMPLETE!
-- =====================================================
-- Storage buckets are now ready for use
-- Access URLs: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
