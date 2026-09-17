# Expense Tracking API

FastAPI backend for the expense tracking system. It uses PostgreSQL, SQLAlchemy, and Alembic.

## Setup

1. Create and activate a virtual environment:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

3. Create a `.env` file in this directory:

   ```env
   DB_USER=postgres
   DB_PASS=your_password
   DB_NAME=expense_tracking
   DB_HOST=localhost
   DB_PORT=5432
   FRONTEND_URL=http://localhost:5173
   ```

   Ensure the PostgreSQL database exists before starting the API.

## Database migrations

Run migrations from the `backend` directory:

```powershell
alembic upgrade head
```

To create a new migration after changing the models:

```powershell
alembic revision --autogenerate -m "describe the change"
```

## Run the API

Start the development server from the `backend` directory:

```powershell
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`. Interactive documentation is available at `http://localhost:8000/docs`.
