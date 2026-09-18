import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { updatePassword } from "../api";
import toast from "react-hot-toast";

type UpdatePasswordForm = {
  new_password: string;
  confirm_password: string;
};

const PASSWORD_ERROR =
  "Password must be 8-16 characters with one uppercase letter, one number, and one special character";

const passwordValidation = {
  required: "Password is required",
  minLength: { value: 8, message: PASSWORD_ERROR },
  maxLength: { value: 16, message: PASSWORD_ERROR },
  pattern: {
    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    message: PASSWORD_ERROR,
  },
} as const;

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>();

  const onSubmit = async (data: UpdatePasswordForm) => {
    try {
      await updatePassword(data.new_password);
      toast.success("Password updated successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to update password:", err);
      toast.error("Failed to update password");
    }
  };

  const input =
    "w-full rounded-xl border border-[#30453b] bg-[#1d2d25] px-3 py-2.5 text-sm text-[#d0ded5] outline-none placeholder:text-[#849b8e] focus:border-[#6a9b7a] focus:ring-4 focus:ring-[#6a9b7a]/10";
  const label = "mb-1.5 block text-xs font-semibold text-[#afc0b5]";

  return (
    <AuthCard title="Update password" footer={null}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className={label}>New password</span>
          <input
            type="password"
            className={input}
            placeholder="Enter a new password"
            {...register("new_password", passwordValidation)}
          />
          {errors.new_password && (
            <span className="mt-1 block text-xs text-[#e59a70]">
              {errors.new_password.message}
            </span>
          )}
        </label>
        <label className="block">
          <span className={label}>Confirm password</span>
          <input
            type="password"
            className={input}
            placeholder="Repeat the new password"
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (value) =>
                value === getValues("new_password") || "Passwords do not match",
            })}
          />
          {errors.confirm_password && (
            <span className="mt-1 block text-xs text-[#e59a70]">
              {errors.confirm_password.message}
            </span>
          )}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-[#2c5a43] px-5 py-3 text-sm font-semibold text-[#f2f8ed] disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}