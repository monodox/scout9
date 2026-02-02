# Supabase Setup Scripts

SQL scripts for setting up Scout9's database schema and storage buckets in Supabase.

## 📋 Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project credentials:
   - Project URL: `https://[project-ref].supabase.co`
   - Service role key: From Project Settings → API → `service_role` secret
   - Database password: Set during project creation

## 🚀 Quick Setup

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Go to **SQL Editor** (left sidebar)

2. **Create Tables**
   - Click **New Query**
   - Copy entire contents of `setup_tables.sql`
   - Paste into editor
   - Click **Run** (or press F5)
   - ✅ Verify success message: "All tables created successfully!"

3. **Create Storage Buckets**
   - Click **New Query**
   - Copy entire contents of `setup_storage.sql`
   - Paste into editor
   - Click **Run**
   - ✅ Check Storage section to verify buckets created

### Option 2: Command Line (psql)

```bash
# Set connection string
export SUPABASE_DB_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run table setup
psql "$SUPABASE_DB_URL" -f setup_tables.sql

# Run storage setup
psql "$SUPABASE_DB_URL" -f setup_storage.sql
```

### Option 3: Python Script

```python
# backend/scripts/init_db.py
from app.core.database import Base, engine

# Create all tables using SQLAlchemy
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully!")
```

Run it:
```bash
cd backend
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Tables created!')"
```

## 📊 Database Schema

### Tables Created

1. **reports** - Core scouting reports
   - `id` (UUID, PK)
   - `team_name` (VARCHAR)
   - `game` (VARCHAR)
   - `status` (VARCHAR)
   - `match_range` (JSONB)
   - `summary_json` (JSONB)
   - `error_message` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **report_players** - Player analysis
   - `id` (UUID, PK)
   - `report_id` (UUID, FK → reports)
   - `player_name` (VARCHAR)
   - `role`, `team` (VARCHAR)
   - `metrics_json` (JSONB)
   - `tendencies_json` (JSONB)

3. **report_strategies** - Strategy patterns
   - `id` (UUID, PK)
   - `report_id` (UUID, FK → reports)
   - `category`, `label` (VARCHAR)
   - `confidence`, `success_rate` (FLOAT)
   - `frequency` (INTEGER)
   - `details_json` (JSONB)

4. **report_compositions** - Team compositions
   - `id` (UUID, PK)
   - `report_id` (UUID, FK → reports)
   - `comp_key` (VARCHAR)
   - `picks_json`, `map_performance` (JSONB)
   - `win_rate`, `pick_rate` (FLOAT)
   - `sample_size` (INTEGER)

### Indexes
- Team name lookups
- Status filtering
- Created date sorting
- Foreign key relationships

### Features
- ✅ UUID primary keys
- ✅ JSONB columns for flexible data
- ✅ Cascade deletes (delete report → delete related records)
- ✅ Auto-updated timestamps
- ✅ Optimized indexes

## 💾 Storage Buckets

### Buckets Created

1. **reports** (Private)
   - Exported report files
   - Max size: 10MB
   - Types: PDF, HTML, JSON
   - Access: Service role + authenticated users

2. **report-exports** (Public)
   - Publicly shareable exports
   - Max size: 10MB
   - Types: PDF, HTML, JSON
   - Access: Public read, service role write

3. **team-logos** (Public)
   - Custom team branding
   - Max size: 2MB
   - Types: PNG, JPEG, SVG, WebP
   - Access: Public read, authenticated write

## 🔒 Security

### Row Level Security (RLS)

Currently **disabled** - Scout9 uses service role key which bypasses RLS.

To enable multi-user RLS:
1. Uncomment RLS section in `setup_tables.sql`
2. Create user policies
3. Switch to anon key + JWT authentication

### Storage Policies

- **Service role** has full access (backend operations)
- **Authenticated users** can read private reports
- **Public** can access public exports and logos

## ✅ Verification

### Check Tables
```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'report%';

-- Count rows in each table
SELECT 'reports' as table, COUNT(*) as rows FROM reports
UNION ALL
SELECT 'report_players', COUNT(*) FROM report_players
UNION ALL
SELECT 'report_strategies', COUNT(*) FROM report_strategies
UNION ALL
SELECT 'report_compositions', COUNT(*) FROM report_compositions;
```

### Check Storage Buckets
```sql
-- List buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets
WHERE name IN ('reports', 'report-exports', 'team-logos');

-- List policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects';
```

### Via Supabase Dashboard
1. **Tables**: Database → Tables (should see 4 tables)
2. **Storage**: Storage → Buckets (should see 3 buckets)

## 🔄 Migrations (Future)

For production, use Alembic for versioned migrations:

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

## 🧹 Cleanup (Danger Zone)

**⚠️ WARNING:** This will delete ALL data!

```sql
-- Drop all tables
DROP TABLE IF EXISTS report_compositions CASCADE;
DROP TABLE IF EXISTS report_strategies CASCADE;
DROP TABLE IF EXISTS report_players CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

-- Delete all buckets (via Dashboard only)
-- Storage → Select bucket → Settings → Delete bucket
```

## 📚 Related Documentation

- [Database Schema](../../docs/database-schema.md) - Detailed schema documentation
- [Supabase Usage](../../docs/supabase-usage.md) - Connection and usage guide
- [Backend README](../README.md) - Backend setup instructions

## 🆘 Troubleshooting

### "Permission denied" errors
- Ensure you're using the **service role** key (not anon key)
- Check that RLS is disabled or has proper policies

### "Relation already exists" errors
- Tables already created - this is safe to ignore
- Or drop existing tables first (see Cleanup section)

### Connection refused
- Verify connection string format
- Check that project is not paused (Supabase free tier)
- Ensure `sslmode=require` is in connection string

### Storage upload fails
- Check file size limits
- Verify MIME type is in allowed list
- Ensure bucket exists and policies are correct
