-- =====================================================
-- Scout9 Database Cleanup
-- =====================================================
-- ⚠️ WARNING: This will DELETE ALL Scout9 data!
-- Use this script to completely remove Scout9 schema
-- Run this ONLY if you want to start fresh

-- =====================================================
-- CONFIRMATION PROMPT
-- =====================================================
-- Uncomment the line below to confirm you want to delete everything
-- DO $$ BEGIN RAISE NOTICE '⚠️  DELETING ALL SCOUT9 DATA...'; END $$;

-- =====================================================
-- 1. DROP TABLES (CASCADE)
-- =====================================================

-- Drop tables in reverse order (child tables first)
DROP TABLE IF EXISTS report_compositions CASCADE;
DROP TABLE IF EXISTS report_strategies CASCADE;
DROP TABLE IF EXISTS report_players CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- 2. DROP STORAGE POLICIES
-- =====================================================

-- Reports bucket policies
DROP POLICY IF EXISTS "Service role can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read reports" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete reports" ON storage.objects;

-- Report exports policies
DROP POLICY IF EXISTS "Public read access to exports" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload exports" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete exports" ON storage.objects;

-- Team logos policies
DROP POLICY IF EXISTS "Public read access to team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload team logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own team logos" ON storage.objects;

-- =====================================================
-- 3. DELETE STORAGE BUCKETS
-- =====================================================
-- Note: Must delete all files in bucket first via Dashboard
-- Storage → Select bucket → Empty bucket → Delete bucket

-- Delete bucket metadata (files must be deleted manually first)
DELETE FROM storage.buckets WHERE id IN ('reports', 'report-exports', 'team-logos');

-- =====================================================
-- 4. VERIFY CLEANUP
-- =====================================================

-- Check tables (should return empty)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'report%';

-- Check buckets (should return empty)
SELECT id, name FROM storage.buckets 
WHERE name IN ('reports', 'report-exports', 'team-logos');

-- =====================================================
-- COMPLETE!
-- =====================================================
-- All Scout9 data has been removed
-- Run setup_tables.sql and setup_storage.sql to recreate schema
