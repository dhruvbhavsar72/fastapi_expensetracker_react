import { Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  allCategory,
  allExpenses,
  deleteExpense as deleteExpenseRequest,
  updateExpense as updateExpenseRequest,
} from "../api";
import type { Expense, ExpenseForm, Category } from "../types";

export function ExpensesPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading: loading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: allExpenses,
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: allCategory,
  });
  const updateExpense = useMutation({
    mutationFn: ({ item_id, expense }: { item_id: number; expense: ExpenseForm }) =>
      updateExpenseRequest({ item_id, expense }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
  const deleteExpense = useMutation({
    mutationFn: deleteExpenseRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const getCategoryName = (id: number) =>
    categories.find((category) => category.id === id)?.category_name ?? "Uncategorized";

  const handleEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExpense) return;
    const formData = new FormData(event.currentTarget);
    const { id, ...expenseForm } = editingExpense;
    updateExpense.mutate({
      item_id: id,
      expense: {
        ...expenseForm,
        title: String(formData.get("title") ?? "").trim(),
        amount: Number(formData.get("amount")),
        description: String(formData.get("description") ?? ""),
      },
    });
    setEditingExpense(null);
  };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
            Your records
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">
            All expenses
          </h1>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-[#9fb3a7]">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="text-[#9fb3a7]">No expenses found. Add some!</p>
        ) : (
          expenses.map((expense) => (
            <article
              key={expense.id}
              className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] text-[#8fc29d]">
                  $
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Edit expense"
                    onClick={() => setEditingExpense(expense)}
                    disabled={updateExpense.isPending}
                    className="rounded-lg p-2 text-[#9fb3a7] hover:bg-[#20382c] transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete expense"
                    onClick={() => {
                      if (window.confirm("Delete this expense?"))
                        deleteExpense.mutate(expense.id);
                    }}
                    disabled={deleteExpense.isPending}
                    className="rounded-lg p-2 text-[#9fb3a7] hover:bg-[#49302b] hover:text-[#e4a09a] transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {editingExpense?.id === expense.id && (
                <form
                  onSubmit={handleEdit}
                  className="mt-4 space-y-3 border-t border-[#30453b] pt-4"
                >
                  <input
                    name="title"
                    defaultValue={expense.title}
                    required
                    placeholder="Title"
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7]"
                  />
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={expense.amount}
                    required
                    placeholder="Amount"
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7]"
                  />
                  <textarea
                    name="description"
                    defaultValue={expense.description}
                    placeholder="Description"
                    rows={3}
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingExpense(null)}
                      className="rounded-lg px-3 py-2 text-sm text-[#9fb3a7] hover:bg-[#20382c]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateExpense.isPending}
                      className="rounded-lg bg-[#8fc29d] px-3 py-2 text-sm text-[#17251f] disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
              <h2 className="mt-6 text-lg font-semibold text-[#d0ded5]">
                {expense.title}
              </h2>
              <p className="mt-1 min-h-10 text-sm text-[#93a89b]">
                {expense.description}
              </p>
              <div className="mt-5 flex items-end justify-between border-t border-[#30453b] pt-4">
                <div>
                  <p className="text-xs text-[#9fb3a7]">
                    {getCategoryName(expense.category_id)}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[#849b8e]">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-mono text-lg font-semibold text-[#dce8d7]">
                  ${Number(expense.amount).toFixed(2)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
