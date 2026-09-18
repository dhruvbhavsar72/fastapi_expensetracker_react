from pydantic import BaseModel, Field, field_validator, EmailStr
import re


def password_checker(value):
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must have One Uppercase Letter")

    if len(value) < 8 or len(value) > 16:
        raise ValueError("Password must be between 8 and 16 characters long")

    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one number")

    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError("Password must contain at least one special character")
    return value


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    user_name:str = Field(...,example="johndoe")
    password:str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        if not re.fullmatch(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", email):
            raise ValueError("Invalid email format")
        return email.lower()

    @field_validator('password')
    @classmethod
    def check_password(cls,value):
        return password_checker(value)

class UserLogin(BaseModel):
    user_name:str
    password:str

    @field_validator('password')
    @classmethod
    def check_password(cls,value):
        return password_checker(value)


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    user_name: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    msg: str
    loginUser: UserResponse
class PasswordUpdate(BaseModel):
    new_password:str

    @field_validator('new_password')
    @classmethod
    def check_password(cls,value):
        return password_checker(value)

class ForgotPassword(BaseModel):
    email:EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip()
        if not re.fullmatch(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", email):
            raise ValueError("Invalid email format")
        return email.lower()
