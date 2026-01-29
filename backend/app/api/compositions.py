from fastapi import APIRouter

router = APIRouter(prefix="/api/compositions", tags=["compositions"])


@router.get("/")
async def list_compositions(skip: int = 0, limit: int = 10):
    """List analyzed compositions"""
    return {
        "compositions": [],
        "total": 0
    }


@router.get("/{composition_id}")
async def get_composition(composition_id: int):
    """Get composition analysis details"""
    return {
        "id": composition_id,
        "name": "Composition Name",
        "win_rate": 0.0,
        "pick_rate": 0.0
    }


@router.post("/analyze")
async def analyze_composition(match_id: str):
    """Analyze compositions from a match"""
    return {
        "message": "Composition analysis started",
        "match_id": match_id,
        "status": "processing"
    }
