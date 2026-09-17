from users.schemas import UserBase, UserLogin
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from utils import hash_password, verify_password
from db.models import Users, Expense


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

    if not verify_password(user.password , loginuser.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Password"
        )

    return loginuser
