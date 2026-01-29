from fastapi import APIRouter

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/")
async def list_reports(skip: int = 0, limit: int = 10):
    """Fetch all generated reports"""
    return {
        "reports": [],
        "total": 0
    }


@router.get("/{report_id}")
async def get_report(report_id: int):
    """Get specific report data"""
    return {
        "id": report_id,
        "title": "Sample Report",
        "data": {}
    }


@router.post("/generate")
async def generate_report(scout_id: int, template: str = "quick"):
    """Generate a new report from scout data"""
    return {
        "message": "Report generation started",
        "scout_id": scout_id,
        "template": template,
        "status": "processing"
    }
