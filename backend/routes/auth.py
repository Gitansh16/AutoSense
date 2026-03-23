from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User
from schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse
from utils.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer_scheme = HTTPBearer()


@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        car_name=body.car_name,
        car_company=body.car_company,
        fleet_size=body.fleet_size,
        primary_use_case=body.primary_use_case,
        newsletter=body.newsletter,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await User.find_one(User.email == body.email)
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
    id=str(user.id),
    name=user.name,
    email=user.email,
    car_name=user.car_name,
    car_company=user.car_company,
    fleet_size=user.fleet_size,
    primary_use_case=user.primary_use_case,
    newsletter=user.newsletter,
    created_at=str(user.created_at),
)