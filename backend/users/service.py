from users.schemas import ForgotPassword, UserBase, UserLogin
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks, HTTPException, status
from utils import (
    create_reset_password_token,
    hash_password,
    send_mail,
    verify_email_token,
    verify_password,
)
from db.models import Users, Expense
from decouple import config

FRONTEND_URL = config("FRONTEND_URL")


async def create_user(session: AsyncSession, new_user: UserBase):

    stmt = select(Users).where(Users.email == new_user.email)
    res = await session.execute(stmt)
    result = res.first()

    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already regitered with same email",
        )

    checkusername = select(Users).where(Users.user_name == new_user.user_name)
    username = await session.execute(checkusername)
    resultuser = username.first()

    if resultuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already regitered with same email",
        )

    user = Users(
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email,
        user_name=new_user.user_name,
        password=hash_password(new_user.password),
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def user_login(session: AsyncSession, user: UserLogin):
    stmt = select(Users).where(Users.user_name == user.user_name)
    result = await session.execute(stmt)
    loginuser = result.scalar_one_or_none()

    if not loginuser:
        raise HTTPException(
            status_code=status.HTTP_404_BAD_REQUEST, detail="Useer Not Found"
        )

    if not verify_password(user.password, loginuser.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Password"
        )

    return loginuser


async def update_password(session: AsyncSession, user: Users, new_password: str):
    if verify_password(new_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="new password can not same as old password",
        )

    user.password = hash_password(new_password)
    session.add(user)
    await session.commit()
    return {"message": "Password updated successfully."}


async def send_reset_email(
    session: AsyncSession, data: ForgotPassword, bg_tasks: BackgroundTasks
):
    user = select(Users).where(Users.email == data.email)
    res = await session.execute(user)
    resultUser = res.scalars().first()

    if resultUser is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="user not found"
        )

    token = create_reset_password_token(user_id = int (resultUser.id))
    link = f"{FRONTEND_URL}/forgot-password?token={token}"
    subject = "Forgot Password"
    body = f"Hi {resultUser.email},\n\nPlease update the password via this link:\n{link}\n\nThank you!"
    bg_tasks.add_task(send_mail, subject, [resultUser.email], body)


async def forgot_password(session: AsyncSession, token: str, new_password: str):
    user_id = verify_email_token(token, "reset_password")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token"
        )

    stmt = select(Users).where(Users.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User is not fount"
        )

    if verify_password(new_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="you can not keep samepassword",
        )

    user.password = hash_password(new_password)
    session.add(user)
    await session.commit()
    return {"message": "Password reset successfully."}
