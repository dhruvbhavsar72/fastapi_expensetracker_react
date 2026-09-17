from expense.schemas import ExpenseBase, ExpenseUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from db.models import Category, Expense


async def create_expense(session: AsyncSession, expense: ExpenseUpdate,user_id:int):

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

async def get_expenses(session:AsyncSession,user_id:int):
    stmt = (
        select(Expense)
        .where(Expense.user_id == user_id)
        .order_by(Expense.id)
    )
    res = await session.execute(stmt)
    result = res.scalars().all()
    return result

async def get_expense_by_category(session:AsyncSession,cate_id:int,user_id:int):
    stmt = select(Expense).where(Expense.category_id == cate_id , Expense.user_id == user_id)
    res = await session.execute(stmt)
    result = res.scalars().all()
    return result

async def edit_expense(session:AsyncSession,expense_id:int,expenses:ExpenseUpdate,user_id:int):
    stmt = select(Expense).where(
        Expense.id == expense_id,
        Expense.user_id == user_id,
    )
    res = await session.execute(stmt)
    result = res.scalar_one_or_none()
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item NOt Found"
        )

    result.title = expenses.title
    result.description = expenses.description
    result.amount = expenses.amount
    result.date = expenses.date
    result.category_id = expenses.category_id

    await session.commit()
    await session.refresh(result)
    
    return result

async def delete_expense(session:AsyncSession,expense_id:int,user_id:int):
    stmt = await session.get(Expense,expense_id)
    if not stmt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    await session.delete(stmt)
    await session.commit()
