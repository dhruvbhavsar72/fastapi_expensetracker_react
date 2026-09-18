from datetime import date
from typing import Literal

from expense.schemas import ExpenseBase, ExpenseUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from db.models import Category, Expense


async def create_expense(session: AsyncSession, expense: ExpenseUpdate, user_id: int):

    new_cat = Expense(
        title=expense.title,
        description=expense.description,
        amount=expense.amount,
        date=expense.date,
        category_id=expense.category_id,
        user_id=user_id,
    )
    session.add(new_cat)
    await session.commit()
    return new_cat


async def get_expenses(session: AsyncSession, user_id: int):
    stmt = select(Expense).where(Expense.user_id == user_id).order_by(Expense.id)
    res = await session.execute(stmt)
    result = res.scalars().all()
    return result


async def get_expense_by_category(session: AsyncSession, cate_id: int, user_id: int):
    stmt = select(Expense).where(
        Expense.category_id == cate_id, Expense.user_id == user_id
    )
    res = await session.execute(stmt)
    result = res.scalars().all()
    return result


async def edit_expense(
    session: AsyncSession, expense_id: int, expenses: ExpenseUpdate, user_id: int
):
    stmt = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == user_id,
    )
    res = await session.execute(stmt)
    result = res.scalar_one_or_none()
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Item NOt Found"
        )

    result.title = expenses.title
    result.description = expenses.description
    result.amount = expenses.amount
    result.date = expenses.date
    result.category_id = expenses.category_id

    await session.commit()
    await session.refresh(result)

    return result


async def delete_expense(session: AsyncSession, expense_id: int, user_id: int):
    stmt = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == user_id,
    )
    res = await session.execute(stmt)
    result = res.scalar_one_or_none()
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    await session.delete(result)
    await session.commit()


async def filter_sorting(
    session: AsyncSession,
    user_id: int,
    category_id: int | None,
    start_date: date | None = None,
    end_date: date | None = None,
    sort_by: Literal["date", "amount"] | None = None,
    sort_order: Literal["asc", "desc"] | None = None,
):
    query = select(Expense).where(Expense.user_id == user_id)

    if category_id is not None:
        query = query.where(Expense.category_id == category_id)

    if start_date is not None:
        query = query.where(Expense.date >= start_date)

    if end_date is not None:
        query = query.where(Expense.date <= end_date)

    sort_column = Expense.date if sort_by == "date" else Expense.amount
    query = query.order_by(
        sort_column.asc() if sort_order == "asc" else sort_column.desc()
    )

    result = await session.execute(query)

    return result.scalars().all()
