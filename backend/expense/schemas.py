from datetime import date

from pydantic import BaseModel

class ExpenseBase(BaseModel):
    title:str
    description:str
    amount: float
    date: date

    class Config:
        from_attributes = True

class ExpenseUpdate(ExpenseBase):
    category_id:int