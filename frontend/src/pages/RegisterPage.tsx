import { AuthCard } from "../components/AuthCard";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { register as registerApi } from "../api";
import type { RegisterForm } from "../types";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerApi(data);
      navigate("/login");
    } catch (err) {
      console.error("Failed to register:", err);
    }
  };

  const input =
    "w-full rounded-xl border border-[#30453b] bg-[#1d2d25] px-3 py-2.5 text-sm text-[#d0ded5] outline-none placeholder:text-[#849b8e] focus:border-[#6a9b7a] focus:ring-4 focus:ring-[#6a9b7a]/10";
  const label = "mb-1.5 block text-xs font-semibold text-[#afc0b5]";
  return (
    <AuthCard
      title="Create account"
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-[#bc6548]">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>First name</span>
            <input 
              className={input} 
              placeholder="Alex" 
              {...register("first_name", { required: "First name is required" })}
            />
            {errors.first_name && <span className="text-xs text-[#e59a70] mt-1 block">{errors.first_name.message}</span>}
          </label>
          <label className="block">
            <span className={label}>Last name</span>
            <input 
              className={input} 
              placeholder="Morgan" 
              {...register("last_name", { required: "Last name is required" })}
            />
            {errors.last_name && <span className="text-xs text-[#e59a70] mt-1 block">{errors.last_name.message}</span>}
          </label>
        </div>
        <label className="block">
          <span className={label}>Email</span>
          <input 
            type="email" 
            className={input} 
            placeholder="alex@example.com" 
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && <span className="text-xs text-[#e59a70] mt-1 block">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className={label}>Username</span>
          <input 
            className={input} 
            placeholder="alexmorgan" 
            {...register("user_name", { required: "Username is required" })}
          />
          {errors.user_name && <span className="text-xs text-[#e59a70] mt-1 block">{errors.user_name.message}</span>}
        </label>
        <label className="block">
          <span className={label}>Password</span>
          <input
            type="password"
            className={input}
            placeholder="Create a password"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
          />
          {errors.password && <span className="text-xs text-[#e59a70] mt-1 block">{errors.password.message}</span>}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-[#2c5a43] px-5 py-3 text-sm font-semibold text-[#f2f8ed] disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
