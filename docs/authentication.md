# Authentication

## Overview

Scout9 implements **JWT-based authentication** with a **stub/minimal implementation** in the current version. The architecture is designed to support full authentication in future releases.

**Current Status**: 🟡 **Stubs Only** - Endpoints exist but not enforced

---

## Authentication Flow

### Planned Flow (Full Implementation)

```
┌─────────┐
│ Browser │
└────┬────┘
     │ 1. POST /api/auth/signup
     │    {email, password, full_name}
     ↓
┌──────────────┐
│   FastAPI    │ → 2. Hash password (bcrypt)
│   Backend    │ → 3. Store user in database
└──────┬───────┘ → 4. Return user_id
       │
       ↓
┌─────────┐
│ Browser │ ← 5. Redirect to email verification
└────┬────┘
     │ 6. POST /api/auth/login
     │    {email, password}
     ↓
┌──────────────┐
│   FastAPI    │ → 7. Verify password
│   Backend    │ → 8. Generate JWT token
└──────┬───────┘ → 9. Return {access_token, token_type}
       │
       ↓
┌─────────┐
│ Browser │ ← 10. Store token in localStorage
└────┬────┘
     │ 11. GET /api/report/
     │     Headers: Authorization: Bearer <token>
     ↓
┌──────────────┐
│   FastAPI    │ → 12. Verify JWT token
│   Backend    │ → 13. Decode user_id from token
└──────┬───────┘ → 14. Return user-specific data
       │
       ↓
┌─────────┐
│ Browser │ ← 15. Display data
└─────────┘
```

---

## Current Implementation

### JWT Utilities
**File**: `backend/app/core/auth.py`

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-here"  # From env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generate JWT token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain, hashed)

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency for protected routes"""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload
```

---

## Authentication Endpoints

### 1. Sign Up (Stub)
**Endpoint**: `POST /api/auth/signup`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** (201):
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Doe",
  "message": "Account created successfully. Please verify your email."
}
```

**Current Implementation**:
```python
@router.post("/signup")
async def signup(request: SignupRequest):
    # TODO: Implement user creation
    # TODO: Send verification email
    return {
        "user_id": str(uuid.uuid4()),
        "email": request.email,
        "message": "Stub: Account created"
    }
```

---

### 2. Login (Stub)
**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Current Implementation**:
```python
@router.post("/login")
async def login(request: LoginRequest):
    # TODO: Verify credentials
    # TODO: Check email verification status
    token = create_access_token({"sub": "stub-user-id"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

---

### 3. Get Current User (Stub)
**Endpoint**: `GET /api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-10T08:00:00Z",
  "email_verified": true
}
```

**Current Implementation**:
```python
@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    # TODO: Query user from database
    return {
        "id": current_user.get("sub"),
        "email": "stub@example.com",
        "message": "Stub: User info"
    }
```

---

## Protected Routes

### Current: Unprotected
All routes currently accessible without authentication.

### Future: Protected with Dependency
```python
from app.core.auth import get_current_user

@router.get("/report/{report_id}")
async def get_report(
    report_id: UUID,
    current_user = Depends(get_current_user)  # Enforce auth
):
    # Verify user owns this report
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user["sub"]  # User isolation
    ).first()
    
    if not report:
        raise HTTPException(status_code=404)
    
    return report
```

---

## User Model (Not Yet Implemented)

### Planned Schema
```python
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    reports = relationship("Report", back_populates="user")
```

### Add to Reports
```python
class Report(Base):
    # ... existing fields
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Relationship
    user = relationship("User", back_populates="reports")
```

---

## JWT Token Structure

### Payload
```json
{
  "sub": "user-uuid-here",          // Subject (user ID)
  "email": "user@example.com",      // User email
  "exp": 1705334400,                // Expiration timestamp
  "iat": 1705330800                 // Issued at timestamp
}
```

### Token Lifecycle
1. **Issue**: User logs in, receive token
2. **Use**: Include in `Authorization` header for API calls
3. **Refresh**: Token expires after 24 hours (re-login required)
4. **Revoke**: No server-side revocation (stateless JWT)

---

## Password Security

### Hashing with bcrypt
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password on signup
hashed = pwd_context.hash("plain_password")
# Store hashed in database

# Verify on login
is_valid = pwd_context.verify("plain_password", hashed)
```

### Password Requirements (Future)
```python
import re

def validate_password(password: str) -> bool:
    """
    Requirements:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True
```

---

## Email Verification (Future)

### Flow
1. User signs up
2. Generate verification token
3. Send email with verification link
4. User clicks link
5. Verify token and mark email as verified

### Implementation
```python
def create_verification_token(user_id: UUID) -> str:
    """Generate email verification token"""
    return create_access_token(
        {"sub": str(user_id), "type": "email_verification"},
        expires_delta=timedelta(hours=24)
    )

@router.get("/verify-email")
async def verify_email(token: str):
    payload = verify_token(token)
    if not payload or payload.get("type") != "email_verification":
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user_id = payload.get("sub")
    # Update user.is_verified = True
    return {"message": "Email verified successfully"}
```

---

## Password Reset (Future)

### Flow
1. User requests password reset
2. Generate reset token
3. Send email with reset link
4. User enters new password
5. Verify token and update password

### Implementation
```python
@router.post("/forgot-password")
async def forgot_password(email: str):
    # Find user by email
    # Generate reset token
    # Send email
    return {"message": "Reset link sent"}

@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    payload = verify_token(token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Hash new password
    # Update user.hashed_password
    return {"message": "Password reset successfully"}
```

---

## OAuth2 Integration (Future)

### Supported Providers
- Google
- Discord (popular in gaming)
- GitHub

### Implementation Example
```python
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id='...',
    client_secret='...',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    # Create or login user
    # Generate JWT
    return {"access_token": "..."}
```

---

## Frontend Integration

### Store Token
```typescript
// After login
const response = await api.post('/api/auth/login', {
  email, password
})

// Store in localStorage
localStorage.setItem('access_token', response.access_token)
```

### Include in Requests
```typescript
// lib/api.ts
const token = localStorage.getItem('access_token')

const response = await fetch('/api/report/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Handle Expiration
```typescript
// Intercept 401 errors
if (response.status === 401) {
  // Token expired
  localStorage.removeItem('access_token')
  navigate('/auth/login')
}
```

---

## Security Best Practices

### 1. Environment Variables
```bash
# .env.local
SECRET_KEY=super-secret-key-minimum-32-characters
# Generate with: openssl rand -hex 32
```

### 2. HTTPS Only
```python
# Production: Force HTTPS
app.add_middleware(
    HTTPSRedirectMiddleware
)
```

### 3. CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.com"],  # Not "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

### 4. Rate Limiting (Future)
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request):
    pass
```

---

## Testing Authentication

### Unit Tests
```python
def test_create_access_token():
    token = create_access_token({"sub": "test-user"})
    assert token is not None
    
    payload = verify_token(token)
    assert payload["sub"] == "test-user"

def test_password_hashing():
    plain = "password123"
    hashed = hash_password(plain)
    assert verify_password(plain, hashed)
    assert not verify_password("wrong", hashed)
```

### Integration Tests
```python
def test_login_flow(client):
    # Signup
    response = client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    assert response.status_code == 201
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Access protected route
    response = client.get("/api/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
```

---

## Roadmap

### Phase 1: MVP (Current)
- ✅ JWT utilities implemented
- ✅ Stub endpoints created
- ⏳ No enforcement

### Phase 2: Basic Auth
- ⏳ User model and database table
- ⏳ Signup/login implementation
- ⏳ Protected routes with dependencies
- ⏳ User-specific data isolation

### Phase 3: Enhanced Security
- ⏳ Email verification
- ⏳ Password reset flow
- ⏳ Rate limiting
- ⏳ Session management

### Phase 4: OAuth2
- ⏳ Google OAuth
- ⏳ Discord OAuth
- ⏳ Account linking

---

## Related Documentation

- [API Reference](api-reference.md) - Auth endpoints
- [Deployment](deployment.md) - Production security
- [Troubleshooting](troubleshooting.md) - Auth issues
