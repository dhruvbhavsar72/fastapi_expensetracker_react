export type User = {
  id: number
  first_name: string
  last_name: string
}

export type Category = {
  id: number
  category_name: string
}

export type Expense = {
  id: number
  title: string
  description: string
  amount: number
  date: string
  category_id: number
}

export type ExpenseForm = Omit<Expense, 'id'>

export type CategoryForm = {
  category_name: string
}

export type Credentials = {
  user_name: string
  password: string
}

export type RegisterForm = {
  first_name: string
  last_name: string
  email: string
  user_name: string
  password: string
}

// Dashboard types — matches GET /dashboard response
export type RecentExpense = {
  title: string
  description: string
  amount: number
  date: string
}

export type CategoryAmount = {
  category_id: number | null
  category_name: string
  amount: number
}

export type DashboardData = {
  weekly_amount: number
  monthly_amount: number
  yearly_amount: number
  recent_expenses: RecentExpense[]
  amount_by_category: CategoryAmount[]
}
