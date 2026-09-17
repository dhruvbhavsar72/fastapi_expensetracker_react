from fastapi import APIRouter, Depends, HTTPException, status, Request
from dashboard.service import (
    dash_detail
)
from dashboard.schemas import DashBoardBase
from db.config import SessionDep
from utils import get_current_user

router = APIRouter()

@router.get('/', response_model=DashBoardBase)
async def get_info(session:SessionDep,user=Depends(get_current_user)):
    return await dash_detail(session,user.id)