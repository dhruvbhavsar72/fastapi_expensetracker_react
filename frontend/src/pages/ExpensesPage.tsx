import { Pencil, Trash2, Filter, ArrowUpDown } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  allCategory,
  filterExpenses,
  deleteExpense as deleteExpenseRequest,
  updateExpense as updateExpenseRequest,
} from "../api";
import type { Expense, ExpenseForm, Category } from "../types";

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter & sort state — sent directly to the backend
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Categories for the dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: allCategory,
  });

  // Server-side filtered & sorted expenses via GET /expense/
  const {
    data: expenses = [],
    isLoading: loading,
    isFetching,
  } = useQuery<Expense[]>({
    queryKey: ["expenses", filterCategory, filterStartDate, filterEndDate, sortBy, sortOrder],
    queryFn: () =>
      filterExpenses({
        category_id: filterCategory ? Number(filterCategory) : null,
        start_date: filterStartDate || null,
        end_date: filterEndDate || null,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const updateExpense = useMutation({
    mutationFn: ({ item_id, expense }: { item_id: number; expense: ExpenseForm }) =>
      updateExpenseRequest({ item_id, expense }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditingExpense(null);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: deleteExpenseRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.category_name ?? "Uncategorized";

  const handleEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExpense) return;
    const formData = new FormData(event.currentTarget);
    updateExpense.mutate({
      item_id: editingExpense.id,
      expense: {
        title: String(formData.get("title") ?? "").trim(),
        amount: Number(formData.get("amount")),
        description: String(formData.get("description") ?? ""),
        date: String(formData.get("date") ?? editingExpense.date),
        category_id: Number(formData.get("category_id") ?? editingExpense.category_id),
      },
    });
  };

  const hasFilters = !!(filterCategory || filterStartDate || filterEndDate);

  const clearFilters = () => {
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  return (
    <section>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
            Your records
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">All Expenses</h1>
        </div>
        <p className="font-mono text-sm text-[#849b8e]">
          {isFetching && !loading ? (
            <span className="animate-pulse">Refreshing…</span>
          ) : (
            `${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`
          )}
        </p>
      </div>

      {/* Filters & Sort bar */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-[#30453b] bg-[#17251f] p-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[#8fc29d]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#849b8e]">
            Filters
          </span>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#849b8e]">
            Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-1.5 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Start date */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#849b8e]">
            From
          </label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-1.5 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
          />
        </div>

        {/* End date */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#849b8e]">
            To
          </label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-1.5 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
          />
        </div>

        {/* Sort by */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[#849b8e]">
            <ArrowUpDown className="size-3" /> Sort by
          </label>
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split("_") as ["date" | "amount", "asc" | "desc"];
              setSortBy(by);
              setSortOrder(order);
            }}
            className="rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-1.5 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
          >
            <option value="date_desc">Date: Newest first</option>
            <option value="date_asc">Date: Oldest first</option>
            <option value="amount_desc">Amount: High to low</option>
            <option value="amount_asc">Amount: Low to high</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-[#49302b] bg-transparent px-3 py-1.5 text-sm text-[#e4a09a] transition-colors hover:bg-[#49302b]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Expense Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-[#17251f]" />
            ))}
          </>
        ) : expenses.length === 0 ? (
          <p className="col-span-full text-center py-12 text-[#9fb3a7]">
            {hasFilters
              ? "No expenses match your filters."
              : "No expenses yet. Add your first one!"}
          </p>
        ) : (
          expenses.map((expense) => (
            <article
              key={expense.id}
              className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-black/20"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] font-mono font-bold text-[#8fc29d]">
                  $
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Edit expense"
                    onClick={() =>
                      setEditingExpense(editingExpense?.id === expense.id ? null : expense)
                    }
                    disabled={updateExpense.isPending}
                    className="rounded-lg p-2 text-[#9fb3a7] transition-colors hover:bg-[#20382c]"
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
                    className="rounded-lg p-2 text-[#9fb3a7] transition-colors hover:bg-[#49302b] hover:text-[#e4a09a]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
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
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
                  />
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={expense.amount}
                    required
                    placeholder="Amount"
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
                  />
                  <input
                    name="date"
                    type="date"
                    defaultValue={expense.date}
                    required
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
                  />
                  <select
                    name="category_id"
                    defaultValue={expense.category_id}
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="description"
                    defaultValue={expense.description}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full rounded-lg border border-[#30453b] bg-[#20382c] px-3 py-2 text-sm text-[#dce8d7] focus:outline-none focus:ring-1 focus:ring-[#8fc29d]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingExpense(null)}
                      className="rounded-lg px-3 py-2 text-sm text-[#9fb3a7] transition-colors hover:bg-[#20382c]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateExpense.isPending}
                      className="rounded-lg bg-[#8fc29d] px-3 py-2 text-sm font-medium text-[#17251f] transition-opacity disabled:opacity-50"
                    >
                      {updateExpense.isPending ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              )}

              {/* Expense info */}
              <h2 className="mt-4 text-lg font-semibold text-[#d0ded5]">
                {expense.title}
              </h2>
              {expense.description && (
                <p className="mt-1 text-sm text-[#93a89b]">{expense.description}</p>
              )}
              <div className="mt-5 flex items-end justify-between border-t border-[#30453b] pt-4">
                <div>
                  <p className="text-xs font-medium text-[#8fc29d]">
                    {getCategoryName(expense.category_id)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-[#849b8e]">
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
