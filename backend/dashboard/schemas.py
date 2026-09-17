from pydantic import BaseModel
from expense.schemas import ExpenseBase


class CategoryAmount(BaseModel):
    category_id: int | None
    category_name: str
    amount: float


class DashBoardBase(BaseModel):
    weekly_amount: float
    monthly_amount: float
    yearly_amount: float
    recent_expenses: list[ExpenseBase]
    amount_by_category: list[CategoryAmount]