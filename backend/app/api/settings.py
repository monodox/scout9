from fastapi import APIRouter

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/")
async def get_settings():
    """Get user/app settings"""
    return {
        "theme": "light",
        "notifications": True,
        "language": "en"
    }


@router.put("/")
async def update_settings(theme: str = None, notifications: bool = None):
    """Update user/app settings"""
    return {
        "message": "Settings updated successfully",
        "theme": theme,
        "notifications": notifications
    }
