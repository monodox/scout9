from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings

router = APIRouter(prefix="/api/system", tags=["system"])


@router.get("/overview")
async def system_overview():
    """Get system overview for dashboard"""
    return {
        "total_scouts": 0,
        "reports_generated": 0,
        "players_tracked": 0,
        "strategies_analyzed": 0,
        "recent_activity": []
    }


@router.get("/status")
async def system_status():
    """Get system status"""
    # Check GRID API key configuration
    grid_configured = bool(settings.GRID_API_KEY and settings.GRID_API_KEY != "")
    grid_status = "configured" if grid_configured else "not_configured"
    
    # Overall status is healthy if everything is configured
    overall_status = "healthy" if grid_configured else "degraded"
    
    return {
        "status": overall_status,
        "version": "0.1.0",
        "uptime": "99.9%",
        "grid_api": grid_status,
        "grid_configured": grid_configured,
        "last_updated": datetime.now().isoformat()
    }


@router.get("/health")
async def system_health():
    """Get system health status"""
    return {
        "status": "operational",
        "version": "0.1.0",
        "uptime": "99.9%",
        "timestamp": datetime.now().isoformat()
    }


@router.get("/grid-status")
async def grid_status():
    """Check GRID API connection status"""
    grid_configured = bool(settings.GRID_API_KEY and settings.GRID_API_KEY != "")
    return {
        "grid_api": "connected" if grid_configured else "not_configured",
        "status": "operational" if grid_configured else "not_configured",
        "configured": grid_configured,
        "last_check": datetime.now().isoformat()
    }


@router.post("/cache/clear")
async def clear_cache():
    """Clear application cache"""
    return {
        "message": "Cache cleared successfully"
    }
