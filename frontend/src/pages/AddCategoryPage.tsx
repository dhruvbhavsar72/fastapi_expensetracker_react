import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  createCategory,
  update_category,
  allCategory,
  delete_category,
} from "../api";
import type { Category, CategoryForm } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

export function AddCategoryPage() {
  const navigate = useNavigate();
  const [edit, setEdit] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>();

  const allcategory = useQuery({
    queryKey: ["categories"],
    queryFn: allCategory,
  });

  const categories = Array.isArray(allcategory.data) ? allcategory.data : [];

  const categoryMutate = useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      navigate("/expenses");
      toast.success("Suceessfully Category Created");
    },

    onError: (error: any) => {
      toast.error("Category Notfcreated", error);
    },
  });

  const updateCategory = useMutation({
    mutationFn: update_category,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category Updated");
      setEdit(null);
      reset();
    },

    onError: (error: any) => {
      toast.error("Category not Updated", error);
    },
  });

  const deleteCate = useMutation({
    mutationFn: delete_category,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category Deleted");
    },

    onError: (error: any) => {
      toast.error("Category not Deleted", error);
    },
  });

  const editing = (cate: Category) => {
    setEdit(cate);
    reset({
      category_name: cate.category_name,
    });
  };

  const handleEdit = (cates: CategoryForm) => {
    if (!edit) return;
    updateCategory.mutate({ item_id: edit.id, category: cates });
  };

  const handleDelte = (item_id: number) => {
    if (window.confirm("Delete this category")) {
      deleteCate.mutate(item_id);
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    if (edit) {
      handleEdit(data);
    } else {
      categoryMutate.mutate(data);
    }
  };

  return (
    <>
      <section className="mx-auto max-w-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
          Morrow finance
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">
          Add category
        </h1>
        <p className="mt-2 text-sm text-[#9fb3a7]">
          Create a label for your expenses.
        </p>
        <div className="mt-8 rounded-2xl border border-[#30453b] bg-[#17251f] p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
                Category name
              </span>
              <input
                className={field}
                placeholder="Food"
                {...register("category_name", {
                  required: "Category name is required",
                })}
              />
              {errors.category_name && (
                <span className="text-xs text-[#e59a70] mt-1">
                  {errors.category_name.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 rounded-xl bg-[#2c5a43] px-5 py-3 text-sm font-semibold text-[#f2f8ed] disabled:opacity-50"
            >
              {isSubmitting
                ? edit
                  ? "Updating..."
                  : "Saving..."
                : edit
                  ? "Update category"
                  : "Save category"}
            </button>
          </form>
        </div>
      </section>
      <section className="mx-auto mt-8 max-w-2xl">
        <h2 className="font-serif text-2xl text-[#dce8d7]">Categories</h2>
        <div className="mt-4 space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-[#9fb3a7]">No categories found.</p>
          ) : (
            categories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-[#30453b] bg-[#17251f] px-4 py-3"
              >
                <span className="text-sm text-[#d0ded5]">
                  {category.category_name}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => editing(category)}
                    className="text-xs font-semibold text-[#9fc9a8]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelte(category.id)}
                    className="text-xs font-semibold text-[#e59a70]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
const field =
  "w-full rounded-xl border border-[#30453b] bg-[#1d2d25] px-3 py-2.5 text-sm text-[#d0ded5] outline-none placeholder:text-[#849b8e] focus:border-[#6a9b7a] focus:ring-4 focus:ring-[#6a9b7a]/10";
