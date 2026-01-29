from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import scout, report, players, strategies, compositions, system, settings, support

app = FastAPI(
    title="Scout9 API",
    description="Automated esports scouting tool API",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scout.router)
app.include_router(report.router)
app.include_router(players.router)
app.include_router(strategies.router)
app.include_router(compositions.router)
app.include_router(system.router)
app.include_router(settings.router)
app.include_router(support.router)

@app.get("/")
def read_root():
    return {
        "name": "Scout9 API",
        "version": "0.1.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
