import { type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { allCategory, createExpense } from "../api";
import type { ExpenseForm } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function AddExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExpenseForm>();
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories"],
    queryFn: allCategory,
  });
  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      navigate("/expenses");
    },
  });

  const onSubmit = (data: ExpenseForm) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <Page title="Add expense" subtitle="Record the details of your spending.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
            Title
          </span>
          <input 
            className={field} 
            placeholder="Groceries" 
            {...register("title", { required: "Title is required" })} 
          />
          {errors.title && <span className="text-xs text-[#e59a70] mt-1">{errors.title.message}</span>}
        </label>
        
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
            Description
          </span>
          <textarea
            className={`${field} min-h-24 resize-none`}
            placeholder="Optional description"
            {...register("description")}
          />
        </label>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
              Amount
            </span>
            <input 
              type="number" 
              step="0.01"
              className={field} 
              placeholder="0.00" 
              {...register("amount", { required: "Amount is required" })} 
            />
            {errors.amount && <span className="text-xs text-[#e59a70] mt-1">{errors.amount.message}</span>}
          </label>
          
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
              Date
            </span>
            <input 
              type="date" 
              className={field} 
              {...register("date", { required: "Date is required" })} 
            />
            {errors.date && <span className="text-xs text-[#e59a70] mt-1">{errors.date.message}</span>}
          </label>
        </div>
        
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
            Category
          </span>
          <select 
            className={field} 
            disabled={loading}
            {...register("category_id", { required: "Category is required", valueAsNumber: true })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          {errors.category_id && <span className="text-xs text-[#e59a70] mt-1">{errors.category_id.message}</span>}
        </label>
        
        <button
          type="submit"
          disabled={isSubmitting || createExpenseMutation.isPending}
          className="mt-6 rounded-xl bg-[#2c5a43] px-5 py-3 text-sm font-semibold text-[#f2f8ed] disabled:opacity-50"
        >
          {isSubmitting || createExpenseMutation.isPending ? "Saving..." : "Save expense"}
        </button>
      </form>
    </Page>
  );
}

function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
        Morrow finance
      </p>
      <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">{title}</h1>
      <p className="mt-2 text-sm text-[#9fb3a7]">{subtitle}</p>
      <div className="mt-8 rounded-2xl border border-[#30453b] bg-[#17251f] p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </section>
  );
}
const field =
  "w-full rounded-xl border border-[#30453b] bg-[#1d2d25] px-3 py-2.5 text-sm text-[#d0ded5] outline-none placeholder:text-[#849b8e] focus:border-[#6a9b7a] focus:ring-4 focus:ring-[#6a9b7a]/10";
