from fastapi import APIRouter, Depends, HTTPException, status, Request
from utils import create_tokens, get_current_user, revoke_token, verify_token
from users.service import create_user, user_login
from users.schemas import LoginResponse, UserBase, UserLogin
from db.config import SessionDep
from fastapi.responses import JSONResponse
from decouple import config

router = APIRouter()

COOKIE_SECURE = config("FRONTEND_URL", default="http://localhost:5173").startswith(
    "https://"
)


@router.post("/register")
async def new_user(session: SessionDep, user: UserBase):
    try:
        new_user = await create_user(session, user)
        return {"msg": "User Registered", "user": new_user}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/login", response_model=LoginResponse)
async def login(session: SessionDep, user: UserLogin):
    user = await user_login(session, user)
    tokens = await create_tokens(session, user)
    response = JSONResponse(content={"msg": "Login Sucess"})
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 1,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 7,
    )
    return response


@router.get("/refresh")
async def refresh(session: SessionDep, request: Request):
    rft = request.cookies.get("refresh_token")

    if not rft:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh Token Missing",
        )

    user = await verify_token(session, rft)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired Refresh Token",
        )

    tokens = await create_tokens(session, user)

    response = JSONResponse(content={"MSG": "Token refreshed"})

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 1,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=60 * 60 * 24 * 7,
    )
    return response


@router.post("/logout")
async def logout(session: SessionDep, request: Request):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        await revoke_token(session, refresh_token)

    response = JSONResponse(content={"MSG": "Logout Success"})

    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return response


@router.get("/me")
async def get_user(cu=Depends(get_current_user)):
    return {
        "id": cu.id,
        "first_name": cu.first_name,
        "last_name": cu.last_name,
        "user_name": cu.user_name,
        "email": cu.email,
    }
