from pydantic import BaseModel, EmailStr
from typing import Optional, List

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    car_name: Optional[str] = None
    car_company: Optional[str] = None
    fleet_size: Optional[int] = None
    primary_use_case: List[str] = []
    newsletter: bool = False

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    car_name: Optional[str] = None
    car_company: Optional[str] = None
    fleet_size: Optional[int] = None
    primary_use_case: List[str] = []
    newsletter: bool = False
    created_at: Optional[str] = None