import { useQuery } from "@tanstack/react-query";
import { loadDashboard } from "../api";
import { DollarSign, Tag, TrendingUp, Clock } from "lucide-react";
import type { DashboardData } from "../types";

export function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: loadDashboard,
  });

  const weeklyAmount = data?.weekly_amount ?? 0;
  const monthlyAmount = data?.monthly_amount ?? 0;
  const yearlyAmount = data?.yearly_amount ?? 0;
  const recentExpenses = data?.recent_expenses ?? [];
  const amountByCategory = data?.amount_by_category ?? [];

  // Top spending category this month
  const topCategory = [...amountByCategory].sort((a, b) => b.amount - a.amount)[0];

  if (isLoading) {
    return (
      <section className="min-h-dvh p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-lg bg-[#20382c]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-[#17251f]" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-[#17251f]" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-dvh p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
          Overview
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* This Week */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] text-[#8fc29d]">
              <DollarSign className="size-5" />
            </div>
            <span className="rounded-full bg-[#20382c] px-2 py-0.5 font-mono text-[10px] text-[#8fc29d]">
              THIS WEEK
            </span>
          </div>
          <p className="mt-5 font-mono text-2xl font-bold text-[#dce8d7]">
            ${weeklyAmount.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[#9fb3a7]">Weekly Spend</p>
        </div>

        {/* This Month */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] text-[#e59a70]">
              <TrendingUp className="size-5" />
            </div>
            <span className="rounded-full bg-[#20382c] px-2 py-0.5 font-mono text-[10px] text-[#e59a70]">
              THIS MONTH
            </span>
          </div>
          <p className="mt-5 font-mono text-2xl font-bold text-[#dce8d7]">
            ${monthlyAmount.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[#9fb3a7]">Monthly Spend</p>
        </div>

        {/* This Year */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] text-[#60a5fa]">
              <DollarSign className="size-5" />
            </div>
            <span className="rounded-full bg-[#20382c] px-2 py-0.5 font-mono text-[10px] text-[#60a5fa]">
              THIS YEAR
            </span>
          </div>
          <p className="mt-5 font-mono text-2xl font-bold text-[#dce8d7]">
            ${yearlyAmount.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-[#9fb3a7]">Yearly Spend</p>
        </div>

        {/* Top Category */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-[#20382c] text-[#a78bfa]">
              <Tag className="size-5" />
            </div>
            <span className="rounded-full bg-[#20382c] px-2 py-0.5 font-mono text-[10px] text-[#a78bfa]">
              TOP CATEGORY
            </span>
          </div>
          <p className="mt-5 font-mono text-2xl font-bold text-[#dce8d7]">
            {topCategory ? `$${topCategory.amount.toFixed(2)}` : "—"}
          </p>
          <p className="mt-1 text-sm text-[#9fb3a7]">
            {topCategory ? topCategory.category_name : "No data yet"}
          </p>
        </div>
      </div>

      {/* Bottom section: category breakdown + recent expenses */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Category Breakdown (this month) */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5">
          <h2 className="mb-4 font-serif text-xl text-[#dce8d7]">
            Spending by Category
            <span className="ml-2 font-mono text-xs font-normal text-[#849b8e]">
              (this month)
            </span>
          </h2>

          {amountByCategory.length === 0 ? (
            <p className="text-sm text-[#9fb3a7]">No category data this month.</p>
          ) : (
            <div className="space-y-3">
              {[...amountByCategory]
                .sort((a, b) => b.amount - a.amount)
                .map((cat) => {
                  return (
                    <div key={cat.category_name}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#dce8d7]">
                          {cat.category_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#8fc29d]">
                            ${cat.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="rounded-2xl border border-[#30453b] bg-[#17251f] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-[#dce8d7]">
            <Clock className="size-4 text-[#849b8e]" />
            Recent Expenses
          </h2>

          {recentExpenses.length === 0 ? (
            <p className="text-sm text-[#9fb3a7]">No recent expenses.</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-[#30453b] bg-[#20382c] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#dce8d7]">
                      {exp.title}
                    </p>
                    <p className="font-mono text-[11px] text-[#849b8e]">
                      {new Date(exp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="ml-4 font-mono text-base font-bold text-[#8fc29d]">
                    ${Number(exp.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
