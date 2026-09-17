import axios from 'axios'
import type { Category, CategoryForm, Credentials, Expense, ExpenseForm, RegisterForm, User } from './types'

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

export async function loadDashboard(): Promise<{ user: User; expenses: Expense[]; categories: Category[] }> {
  const [userResponse, expenseResponse, categoryResponse] = await Promise.all([
    api.get<User>('/users/me'),
    api.get<Expense[]>('/expense/all_expense'),
    api.get<Category[]>('/category/all_category'),
  ])

  return {
    user: userResponse.data,
    expenses: expenseResponse.data,
    categories: categoryResponse.data,
  }
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

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expense/delete_item/${id}`)
}

export async function allExpenses(): Promise<Expense[]> {
  const response = await api.get<Expense[]>('/expense/all_expense')
  return response.data
}

export async function saveExpense(expense: ExpenseForm, id?: number): Promise<void> {
  const body = {
    ...expense,
    amount: Number(expense.amount),
    category_id: Number(expense.category_id),
  }

  if (id) {
    await api.put(`/expense/edit_item/${id}`, body)
  } else {
    await api.post('/expense/create_expense', body)
  }
}

export async function createExpense(expense: ExpenseForm): Promise<void> {
  await api.post('/expense/create_expense', {
    ...expense,
    amount: Number(expense.amount),
    category_id: Number(expense.category_id),
  })
}

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