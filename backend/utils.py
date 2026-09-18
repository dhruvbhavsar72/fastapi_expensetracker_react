from email.message import EmailMessage
import uuid
import aiosmtplib
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from decouple import config
from jose import jwt, ExpiredSignatureError, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.config import SessionDep
from db.models import RefreshTokens, Users
from fastapi import HTTPException, Request, status

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = config("SECRET_KEY")

EMAIL_HOST = config("EMAIL_HOST")
EMAIL_HOST_USER = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")
EMAIL_PORT = config("EMAIL_PORT")
EMAIL_SENDER = config("EMAIL_SENDER")


def hash_password(password: str) -> str:
    return pwd.hash(password)


def verify_password(old_password: str, new_password: str) -> bool:
    return pwd.verify(old_password, new_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encode_jwt


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms="HS256")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def create_tokens(session: AsyncSession, user: Users):
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_tkn_str = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=7)

    refresh_token = RefreshTokens(
        user_id=user.id, refresh_token=refresh_tkn_str, expires_at=expire
    )

    session.add(refresh_token)
    await session.commit()

    return {"access_token": access_token, "refresh_token": refresh_tkn_str}


async def verify_token(session: AsyncSession, token: str):
    stmt = select(RefreshTokens).where(RefreshTokens.refresh_token == token)
    res = await session.execute(stmt)
    tkn = res.scalar_one_or_none()

    if tkn and not tkn.revoked:
        exp = tkn.expires_at
        if exp.tzinfo is None:
            expire = exp.replace(timezone.utc)
        else:
            expire = exp

        if expire > datetime.now(timezone.utc):
            user_exp = select(Users).where(Users.id == tkn.user_id)
            user_result = await session.scalars(user_exp)
            return user_result.first()

    return None


async def revoke_token(session: AsyncSession, token: str):
    stmt = select(RefreshTokens).where(RefreshTokens.refresh_token == token)
    result = await session.execute(stmt)
    refresh_token = result.scalar_one_or_none()

    if refresh_token is not None:
        refresh_token.revoked = True
        session.add(refresh_token)
        await session.commit()


async def get_current_user(session: SessionDep, request: Request):
    tkn = request.cookies.get("access_token")
    if tkn is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(tkn)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    userid = payload.get("sub")
    if userid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(userid)

    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(Users).where(Users.id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def create_reset_password_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(minutes=120)
    to_encode = {"sub": str(user_id), "type": "reset_password", "exp": expire}
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encode_jwt

def verify_email_token(token:str,token_type:str):
    payload = decode_token(token)
    if not payload or payload.get("type") != token_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    return int(payload.get("sub"))

async def send_mail(
    subject: str, recepients: list[str], body: str, sender: str = EMAIL_SENDER
):
    msg = EmailMessage()
    msg["From"] = sender
    msg["To"] = ", ".join(recepients)
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        await aiosmtplib.send(
            msg,
            hostname=EMAIL_HOST,
            username=EMAIL_HOST_USER,
            password=EMAIL_HOST_PASSWORD,
            port=EMAIL_PORT,
        )
    except Exception as e:
        print(f"failed to email send {recepients}: {e}")
