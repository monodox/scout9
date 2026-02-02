"""
Auth API endpoints (stubs for demonstration).

These endpoints provide JWT-based authentication:
- POST /auth/signup - Create new user account
- POST /auth/login - Login and get access token
- GET /auth/me - Get current user info

Note: User model and database integration not included in this stub.
For production, implement:
1. User model in models/
2. User schema in schemas/
3. Database queries for user management
4. Email verification
5. Password reset functionality
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.auth import create_access_token, hash_password, verify_password, get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    username: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: str
    email: str
    username: str


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest):
    """
    Create a new user account.
    
    Stub implementation - in production:
    1. Check if email/username already exists
    2. Hash the password
    3. Create user in database
    4. Generate access token
    5. Send verification email (optional)
    """
    # Stub: In production, create user in database
    # For now, just generate a token for demonstration
    
    hashed_password = hash_password(data.password)
    
    # Stub user ID (in production, this would be from DB)
    user_id = f"user_{data.email}"
    
    access_token = create_access_token(
        data={"sub": user_id, "email": data.email, "username": data.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """
    Login with email and password.
    
    Stub implementation - in production:
    1. Query user by email from database
    2. Verify password hash
    3. Generate access token
    4. Update last login timestamp
    """
    # Stub: In production, query user from database and verify password
    # For demonstration, accept any email/password combination
    
    # Simulate password verification (stub)
    # In production: user = db.query(User).filter(User.email == data.email).first()
    # if not user or not verify_password(data.password, user.hashed_password):
    #     raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user_id = f"user_{data.email}"
    
    access_token = create_access_token(
        data={"sub": user_id, "email": data.email, "username": data.email.split("@")[0]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires: Valid JWT token in Authorization header
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user.get("email", ""),
        username=current_user.get("username", "")
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Refresh access token.
    
    Stub implementation - in production:
    1. Verify refresh token (separate from access token)
    2. Generate new access token
    3. Optionally rotate refresh token
    """
    access_token = create_access_token(
        data={"sub": current_user["id"], "email": current_user.get("email"), "username": current_user.get("username")},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
