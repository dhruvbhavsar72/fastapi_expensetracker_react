import axios from 'axios'
import type { Category, CategoryForm, Credentials, DashboardData, Expense, ExpenseForm, RegisterForm, User } from './types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
})

const AUTH_SESSION_KEY = "expense_tracker";

const hasAuthSession = () =>
  localStorage.getItem(AUTH_SESSION_KEY) === "true";

export const setAuthSession = () => {
  localStorage.setItem(AUTH_SESSION_KEY, "true");
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

export async function loadDashboard(): Promise<DashboardData> {
  const response = await api.get<DashboardData>('/dashboard')
  return response.data
}

export async function login(credentials: Credentials): Promise<User> {
  await api.post('/users/login', credentials)
  setAuthSession()
  const user = await getCurrentUser()
  if (!user) {
    clearAuthSession()
    throw new Error('Unable to load the authenticated user')
  }
  return user
}

export async function register(data: RegisterForm): Promise<void> {
  await api.post('/users/register', data)
}

export async function logout(): Promise<void> {
  await api.post('/users/logout')
}

// POST /users/update_password — updates the authenticated user's password
export async function updatePassword(new_password: string): Promise<void> {
  await api.post('/users/update_password', { new_password })
}

// GET /expense/all_expense — returns all expenses for the current user
export async function allExpenses(): Promise<Expense[]> {
  const response = await api.get<Expense[]>('/expense/all_expense')
  return response.data
}

// GET /expense/?category_id=&start_date=&end_date=&sort_by=date|amount&sort_order=asc|desc
export async function filterExpenses(params: {
  category_id?: number | null
  start_date?: string | null
  end_date?: string | null
  sort_by?: 'date' | 'amount'
  sort_order?: 'asc' | 'desc'
}): Promise<Expense[]> {
  const query = new URLSearchParams()
  if (params.category_id != null) query.set('category_id', String(params.category_id))
  if (params.start_date) query.set('start_date', params.start_date)
  if (params.end_date) query.set('end_date', params.end_date)
  if (params.sort_by) query.set('sort_by', params.sort_by)
  if (params.sort_order) query.set('sort_order', params.sort_order)
  const response = await api.get<Expense[]>(`/expense/?${query.toString()}`)
  return response.data
}

// POST /expense/create_expense
export async function createExpense(expense: ExpenseForm): Promise<void> {
  await api.post('/expense/create_expense', {
    ...expense,
    amount: Number(expense.amount),
    category_id: Number(expense.category_id),
  })
}

// PUT /expense/edit_item/{id}
export async function updateExpense({
  item_id,
  expense,
}: {
  item_id: number
  expense: ExpenseForm
}): Promise<Expense> {
  const response = await api.put<Expense>(`/expense/edit_item/${item_id}`, {
    ...expense,
    amount: Number(expense.amount),
    category_id: Number(expense.category_id),
  })
  return response.data
}

// DELETE /expense/delete_item/{id}
export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expense/delete_item/${id}`)
}

export async function createCategory(category: CategoryForm): Promise<void> {
  await api.post('/category/create_category', category)
}

export async function allCategory(): Promise<Category[]> {
  const response = await api.get<Category[]>('/category/all_category')
  return response.data
}

export const update_category = async ({ item_id, category }: { item_id: number; category: CategoryForm }) => {
  const response = await api.put(`/category/edit_item/${item_id}`, category);
  return response.data;
};

export async function delete_category(item_id: number) {
  const response = await api.delete(`/category/delete_item/${item_id}`);
  return response.data;
};


export const getCurrentUser = async () => {
  if (!hasAuthSession()) {
    return null
  }

  try {
    const response = await api.get('/users/me');
    return response.data
  }
  catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error
    }

    try {
      await api.get('/users/refresh')
      const response = await api.get('/users/me')
      return response.data
    }
    catch {
      clearAuthSession()
      return null
    }
  }
}