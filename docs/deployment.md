# Deployment

## Overview

Scout9 is designed for modern cloud deployment with separate hosting for frontend and backend. This guide covers production deployment best practices.

---

## Architecture

```
┌──────────────────┐
│   Static CDN     │  Frontend (React build)
│ Vercel/Netlify   │  
└────────┬─────────┘
         │ HTTPS
         ↓
┌──────────────────┐
│  Container Host  │  Backend (FastAPI)
│ Render/Railway   │
└────────┬─────────┘
         │
         ├─→ Supabase (PostgreSQL)
         └─→ GRID API
```

---

## Frontend Deployment

### Recommended Platforms
- **Vercel** (Recommended)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### Build Configuration

#### 1. Environment Variables
```bash
# .env.production
VITE_API_URL=https://api.scout9.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. Build Script
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 3. Build Settings
```yaml
# vercel.json or netlify.toml
build:
  command: npm run build
  publish: dist

# Redirects for SPA routing
[[redirects]]
  from: "/*"
  to: "/index.html"
  status: 200
```

### Vercel Deployment

#### Option 1: GitHub Integration
1. Connect Vercel to GitHub repo
2. Import project
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy

#### Option 2: CLI
```bash
cd frontend
npm install -g vercel
vercel

# Follow prompts
# Set environment variables:
vercel env add VITE_API_URL
```

### Custom Domain
```bash
# Vercel
vercel domains add scout9.com
vercel domains add www.scout9.com

# Add DNS records:
# A record: @ → 76.76.21.21
# CNAME: www → cname.vercel-dns.com
```

---

## Backend Deployment

### Recommended Platforms
- **Render** (Recommended)
- Railway
- Fly.io
- Google Cloud Run
- AWS ECS/Fargate

### Prerequisites
1. Supabase project created
2. GRID API key obtained
3. Container registry access (Docker Hub)

---

## Render Deployment

### 1. Create Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install weasyprint dependencies
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libgdk-pixbuf2.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY app/ app/

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Create render.yaml
```yaml
# render.yaml
services:
  - type: web
    name: scout9-backend
    env: python
    region: oregon
    plan: starter
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_DB_URL
        sync: false
      - key: GRID_API_KEY
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: CORS_ORIGINS
        value: https://scout9.com,https://www.scout9.com
```

### 3. Deploy via Dashboard
1. Sign up at render.com
2. New Web Service → Connect GitHub repo
3. Configure:
   - **Name**: scout9-backend
   - **Region**: Choose closest to users
   - **Branch**: main
   - **Root Directory**: `backend/`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Create Web Service

### 4. Add Environment Variables
```bash
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
GRID_API_KEY=your_grid_api_key
SECRET_KEY=your-super-secret-jwt-key-minimum-32-chars
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://scout9.com,https://www.scout9.com
CACHE_ENABLED=True
CACHE_TTL=3600
```

### 5. Custom Domain
```bash
# In Render dashboard:
# Settings → Custom Domains → Add custom domain
# Add: api.scout9.com

# DNS Configuration:
# CNAME: api → your-service.onrender.com
```

---

## Railway Deployment

### Deploy via CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Set environment variables
railway variables set SUPABASE_DB_URL="postgresql://..."
railway variables set GRID_API_KEY="your_key"
railway variables set SECRET_KEY="your_secret"

# Deploy
railway up
```

---

## Docker Compose (Self-Hosted)

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_DB_URL=${SUPABASE_DB_URL}
      - GRID_API_KEY=${GRID_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - DEBUG=False
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Deploy
```bash
# Set environment variables
export SUPABASE_DB_URL="postgresql://..."
export GRID_API_KEY="your_key"
export SECRET_KEY="your_secret"

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Environment Variables

### Backend (Required)
```bash
SUPABASE_DB_URL=postgresql://...         # Database connection
GRID_API_KEY=your_grid_api_key           # GRID API access
SECRET_KEY=super-secret-key-32-chars     # JWT signing
ENVIRONMENT=production                    # Environment name
DEBUG=False                               # Disable debug mode
CORS_ORIGINS=https://scout9.com          # Allowed origins
```

### Backend (Optional)
```bash
CACHE_ENABLED=True                        # Enable caching
CACHE_TTL=3600                           # Cache time-to-live (seconds)
LOG_LEVEL=INFO                           # Logging level
SENTRY_DSN=https://...                   # Error tracking
```

### Frontend (Required)
```bash
VITE_API_URL=https://api.scout9.com     # Backend API URL
```

### Frontend (Optional)
```bash
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SENTRY_DSN=https://...              # Frontend error tracking
```

---

## Database Setup

### Initialize Tables
```bash
# SSH into backend container or use Render shell
python -c "from app.core.database import init_db; init_db()"
```

### Run Migrations (Future)
```bash
# When using Alembic
alembic upgrade head
```

---

## Health Checks

### Backend Health Endpoint
```python
# app/api/system.py
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": check_database_connection(),
        "grid_api": check_grid_api_status()
    }
```

### Configure in Render
```yaml
# render.yaml
services:
  - type: web
    healthCheckPath: /api/system/health
```

---

## Monitoring

### Sentry Integration

#### Backend
```bash
pip install sentry-sdk
```

```python
# app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    environment=settings.ENVIRONMENT,
    traces_sample_rate=0.1  # 10% of transactions
)
```

#### Frontend
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1
});
```

### Log Aggregation
- **Backend**: Render automatically aggregates logs
- **Frontend**: Use Sentry for client-side errors

---

## SSL/HTTPS

### Automatic (Render/Vercel)
- ✅ SSL certificates automatically provisioned via Let's Encrypt
- ✅ Auto-renewal handled by platform
- ✅ HTTPS enforced

### Manual (Self-Hosted)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d api.scout9.com
```

---

## CORS Configuration

### Production Settings
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ["https://scout9.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)
```

---

## Performance Optimization

### Backend
1. **Connection Pooling**: Configured in SQLAlchemy
2. **Caching**: Enable GRID API response caching
3. **Background Tasks**: Use for long-running operations
4. **Compression**: Enable gzip middleware

```python
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Frontend
1. **Code Splitting**: Vite handles automatically
2. **Asset Optimization**: Images compressed
3. **CDN**: Use Vercel Edge Network
4. **Lazy Loading**: Dynamic imports for routes

---

## Backup Strategy

### Database Backups
- **Automatic**: Supabase daily backups (7-day retention)
- **Manual**: Download SQL dumps from Supabase dashboard

### Application Backups
- **Code**: Stored in Git (GitHub)
- **Environment**: Document all env vars
- **Docker Images**: Tagged and pushed to registry

---

## Rollback Procedure

### Frontend (Vercel)
```bash
# Revert to previous deployment
vercel rollback
```

### Backend (Render)
1. Render Dashboard → Service → Deploys
2. Find working deployment
3. Click "Rollback to this version"

---

## Production Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database connection tested
- [ ] GRID API key valid
- [ ] Secret keys generated (32+ characters)
- [ ] CORS origins configured
- [ ] Debug mode disabled (`DEBUG=False`)
- [ ] Error tracking configured (Sentry)

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Frontend can reach backend API
- [ ] Database tables created
- [ ] Scout run completes successfully
- [ ] Report export works (HTML/JSON/PDF)
- [ ] SSL certificate active
- [ ] Custom domains configured
- [ ] Monitoring dashboards set up

---

## Scaling Considerations

### Horizontal Scaling
```yaml
# Render autoscaling
services:
  - type: web
    scaling:
      minInstances: 1
      maxInstances: 10
      targetCPU: 70
      targetMemory: 80
```

### Database Scaling
- Supabase Pro: Larger instance sizes
- Read replicas for analytics queries
- Connection pooling (Supabase Pooler)

---

## Cost Estimation

### Free Tier
- **Frontend (Vercel)**: Free
- **Backend (Render)**: $7/month (Starter)
- **Database (Supabase)**: Free (500MB)
- **Total**: ~$7/month

### Production Scale
- **Frontend (Vercel Pro)**: $20/month
- **Backend (Render Standard)**: $25/month
- **Database (Supabase Pro)**: $25/month
- **GRID API**: Variable by usage
- **Total**: ~$70-100/month

---

## Related Documentation

- [Architecture](architecture.md) - System design
- [Troubleshooting](troubleshooting.md) - Common issues
- [Supabase Usage](supabase-usage.md) - Database config
- [GRID Integration](grid-integration.md) - API setup
