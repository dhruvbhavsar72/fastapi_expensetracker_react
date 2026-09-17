from fastapi import APIRouter, Depends, HTTPException, status, Request
from expense.service import (
    create_expense,
    get_expenses,
    edit_expense,
    delete_expense,
    get_expense_by_category,
)
from expense.schemas import ExpenseUpdate
from db.config import SessionDep
from fastapi.responses import JSONResponse
from decouple import config
from utils import get_current_user

router = APIRouter()

@router.post("/create_expense")
async def new_expense(
    session: SessionDep, expense: ExpenseUpdate, user_id=Depends(get_current_user)
):
    return await create_expense(session, expense, user_id.id)


@router.get("/all_expense")
async def all_expense(session: SessionDep, user=Depends(get_current_user)):
    return await get_expenses(session, user.id)

@router.get("/expense_by_category/{item_id}")
async def exp_cat(session: SessionDep, item_id: int, user=Depends(get_current_user)):
    return await get_expense_by_category(session, item_id, user.id)


@router.put("/edit_item/{item_id}")
async def update_item(
    session: SessionDep,
    item_id: int,
    expenses: ExpenseUpdate,
    user=Depends(get_current_user),
):
    return await edit_expense(session, item_id, expenses, user.id)


@router.delete("/delete_item/{item_id}")
async def delete_item(
    session: SessionDep, item_id: int, user=Depends(get_current_user)
):
    return await delete_expense(session, item_id, user.id)



