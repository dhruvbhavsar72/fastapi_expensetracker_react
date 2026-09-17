from expense.schemas import ExpenseBase
from dashboard.schemas import CategoryAmount
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from db.models import Category, Expense
from datetime import date, timedelta


async def dash_detail(session: AsyncSession, user_id: int):
    current_day = date.today()

    month_start = current_day.replace(day=1)

    week_start = current_day - timedelta(days=current_day.weekday())

    year_start = current_day.replace(month=1, day=1)

    weekly_amount = (
        select(func.coalesce(func.sum(Expense.amount), 0))
        .where(
            Expense.user_id == user_id,
            Expense.date >= week_start,
            Expense.date <= current_day,
        )
    )

    weekly_result = await session.execute(weekly_amount)
    week_res = weekly_result.scalar()

    monthly_amount = (
        select(func.coalesce(func.sum(Expense.amount), 0))
        .where(
            Expense.user_id == user_id,
            Expense.date >= month_start,
            Expense.date <= current_day,
        )
    )

    monthly_result = await session.execute(monthly_amount)
    month_res = monthly_result.scalar()

    yearly_amount = (
        select(func.coalesce(func.sum(Expense.amount), 0))
        .where(
            Expense.user_id == user_id,
            Expense.date >= year_start,
            Expense.date <= current_day,
        )
    )
    yearly_result = await session.execute(yearly_amount)
    year_res = yearly_result.scalar()

    recent_expense_result = await session.execute(
        select(Expense)
        .where(Expense.user_id == user_id)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .limit(10)
    )
    recent_expense_amount = recent_expense_result.scalars().all()

    amount_by_category = (
        select(
            Expense.category_id,
            Category.category_name,
            func.coalesce(func.sum(Expense.amount), 0).label("amount"),
        )
        .join(Category, Category.id == Expense.category_id)
        .where(
            Expense.user_id == user_id,
            Expense.date >= month_start,
            Expense.date <= current_day,
        )
        .group_by(Expense.category_id, Category.category_name)
    )

    stmt = await session.execute(amount_by_category)
    res = stmt.all()

    return {
        "weekly_amount": week_res,
        "monthly_amount": month_res,
        "yearly_amount": year_res,
        "recent_expenses": [
            ExpenseBase.model_validate(expense)
            for expense in recent_expense_amount
        ],
        "amount_by_category": [
            CategoryAmount(
                category_id=category_id,
                category_name=category_name,
                amount=float(amount),
            )
            for category_id, category_name, amount in res
        ],
    }
