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

