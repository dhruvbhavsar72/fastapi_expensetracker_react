from fastapi import APIRouter, Depends, HTTPException, status, Request
from category.services import (
    create_category,
    edit_category,
    delete_category,
    get_categories,
)
from category.services import CategoryBase
from db.config import SessionDep
from fastapi.responses import JSONResponse
from decouple import config
from utils import get_current_user

router = APIRouter()


@router.post("/create_category")
async def new_category(
    session: SessionDep, category: CategoryBase, user_id=Depends(get_current_user)
):
    return await create_category(session, category, user_id.id)


@router.get("/all_category")
async def all_expense(session: SessionDep, user=Depends(get_current_user)):
    return await get_categories(session, user.id)


@router.put("/edit_item/{item_id}")
async def update_item(
    session: SessionDep,
    item_id: int,
    cateory: CategoryBase,
    user=Depends(get_current_user),
):
    return await edit_category(session, item_id, cateory, user.id)


@router.delete("/delete_item/{item_id}")
async def delete_item(
    session: SessionDep, item_id: int, user=Depends(get_current_user)
):
    return await delete_category(session, item_id, user.id)
