-- =====================================================
-- Scout9 Database Schema Setup
-- =====================================================
-- Run this script in Supabase SQL Editor to create all tables
-- Navigate to: Project Dashboard → SQL Editor → New Query

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. REPORTS TABLE
-- =====================================================
-- Core scouting reports - one per scout run
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    match_range JSONB,
    summary_json JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_team_name ON reports(team_name);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_game ON reports(game);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- =====================================================
-- 2. REPORT_PLAYERS TABLE
-- =====================================================
-- Player performance analysis per report
CREATE TABLE IF NOT EXISTS report_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    team VARCHAR(255),
    metrics_json JSONB NOT NULL,
    tendencies_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for report_players
CREATE INDEX IF NOT EXISTS idx_report_players_report_id ON report_players(report_id);
CREATE INDEX IF NOT EXISTS idx_report_players_player_name ON report_players(player_name);
CREATE INDEX IF NOT EXISTS idx_report_players_team ON report_players(team);

-- =====================================================
-- 3. REPORT_STRATEGIES TABLE
-- =====================================================
-- Identified strategic patterns per report
CREATE TABLE IF NOT EXISTS report_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    frequency INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0.0,
    details_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for report_strategies
CREATE INDEX IF NOT EXISTS idx_report_strategies_report_id ON report_strategies(report_id);
CREATE INDEX IF NOT EXISTS idx_report_strategies_category ON report_strategies(category);

-- =====================================================
-- 4. REPORT_COMPOSITIONS TABLE
-- =====================================================
-- Team composition analysis per report
CREATE TABLE IF NOT EXISTS report_compositions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    comp_key VARCHAR(500) NOT NULL,
    picks_json JSONB NOT NULL,
    win_rate FLOAT DEFAULT 0.0,
    pick_rate FLOAT DEFAULT 0.0,
    sample_size INTEGER DEFAULT 0,
    map_performance JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for report_compositions
CREATE INDEX IF NOT EXISTS idx_report_compositions_report_id ON report_compositions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_compositions_comp_key ON report_compositions(comp_key);

-- =====================================================
-- 5. UPDATED_AT TRIGGER
-- =====================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. OPTIONAL: ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Uncomment below if you want to enable RLS for multi-user support
-- Currently, Scout9 uses service_role key which bypasses RLS

-- Enable RLS on all tables
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE report_players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE report_strategies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE report_compositions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service_role to do everything
-- CREATE POLICY "Service role has full access" ON reports
--     FOR ALL
--     TO service_role
--     USING (true)
--     WITH CHECK (true);

-- Repeat for other tables...

-- =====================================================
-- 7. VERIFY TABLES
-- =====================================================
-- Check that all tables were created successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('reports', 'report_players', 'report_strategies', 'report_compositions')
    ) THEN
        RAISE NOTICE '✅ All tables created successfully!';
    ELSE
        RAISE EXCEPTION '❌ Table creation failed!';
    END IF;
END $$;

-- Show table counts
SELECT 
    'reports' as table_name,
    COUNT(*) as row_count
FROM reports
UNION ALL
SELECT 
    'report_players' as table_name,
    COUNT(*) as row_count
FROM report_players
UNION ALL
SELECT 
    'report_strategies' as table_name,
    COUNT(*) as row_count
FROM report_strategies
UNION ALL
SELECT 
    'report_compositions' as table_name,
    COUNT(*) as row_count
FROM report_compositions;

-- =====================================================
-- COMPLETE!
-- =====================================================
-- Tables are now ready for use by Scout9 backend
-- Connection string: postgresql://postgres.[project-ref]:[password]@...pooler.supabase.com:6543/postgres?sslmode=require
