from fastapi import FastAPI
from users.router import router as accounts_router
from expense.router import router as expense_router
from category.router import router as category_router
from dashboard.router import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from decouple import config

app = FastAPI(
    title="Expense API",
    description="This is a sample Expense FastAPI application.",
    version="1.0.0",
)

frontend_url = config("FRONTEND_URL", default="http://localhost:5173").rstrip("/")
allowed_origins = list({frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/")
# def read_root():
#     return {"message": "Welcome to the TodoApp API!"}


app.include_router(accounts_router, prefix="/users", tags=["Users"])
app.include_router(expense_router, prefix="/expense", tags=["Expense"])
app.include_router(category_router, prefix="/category", tags=["Category"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
