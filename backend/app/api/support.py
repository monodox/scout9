from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/support", tags=["support"])


class SupportRequest(BaseModel):
    subject: str
    category: str
    message: str
    email: str = None


@router.post("/")
async def submit_support_request(request: SupportRequest):
    """Submit a support request"""
    return {
        "message": "Support request submitted successfully",
        "ticket_id": "TICKET-001",
        "status": "pending"
    }


@router.get("/")
async def get_support_tickets(skip: int = 0, limit: int = 10):
    """Get support tickets"""
    return {
        "tickets": [],
        "total": 0
    }
