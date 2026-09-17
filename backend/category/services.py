from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from db.models import Category


class CategoryBase(BaseModel):
    category_name: str


async def create_category(session: AsyncSession, category: CategoryBase, user_id: int):
    stmt = select(Category).where(
        func.lower(Category.category_name) == category.category_name.strip().lower(),
        Category.user_id == user_id,
    )
    res = await session.execute(stmt)
    result = res.first()
    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Same name not allowed"
        )

    new_cate = Category(category_name=category.category_name, user_id=user_id)

    session.add(new_cate)
    await session.commit()
    await session.refresh(new_cate)
    return new_cate


async def edit_category(
    session: AsyncSession, cate_id: int, cat: CategoryBase, user_id: int
):
    stmt = await session.get(Category, cate_id)
    if stmt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    stmt.category_name = cat.category_name

    await session.commit()
    await session.refresh(stmt)

    return stmt


async def delete_category(session: AsyncSession, cate_id: int, user_id: int):
    stmt = await session.get(Category, cate_id)
    if not stmt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    await session.delete(stmt)
    await session.commit()

async def get_categories(session:AsyncSession,user_id:int):
    stmt = (
        select(Category)
        .where(Category.user_id == user_id)
        .order_by(Category.id)
    )
    res = await session.execute(stmt)
    result = res.scalars().all()
    return result
