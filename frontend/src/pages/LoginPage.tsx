
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import type { Credentials } from "../types";
import { useQueryClient } from "@tanstack/react-query";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>();

  const onSubmit = async (data: Credentials) => {
    try {
      const user = await login(data);
      queryClient.setQueryData(["current-user"], user);
      navigate("/expenses");
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  const input =
    "w-full rounded-xl border border-[#30453b] bg-[#1d2d25] px-3 py-2.5 text-sm text-[#d0ded5] outline-none placeholder:text-[#849b8e] focus:border-[#6a9b7a] focus:ring-4 focus:ring-[#6a9b7a]/10";
  return (
    <AuthCard
      title="Welcome back"
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-[#bc6548]">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
            Username
          </span>
          <input
            className={input}
            placeholder="your username"
            {...register("user_name", { required: "Username is required" })}
          />
          {errors.user_name && <span className="text-xs text-[#e59a70] mt-1">{errors.user_name.message}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#afc0b5]">
            Password
          </span>
          <input
            type="password"
            className={input}
            placeholder="your password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <span className="text-xs text-[#e59a70] mt-1">{errors.password.message}</span>}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-[#2c5a43] px-5 py-3 text-sm font-semibold text-[#f2f8ed] disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthCard>
  );
}
