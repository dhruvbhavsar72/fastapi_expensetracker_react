import { NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { clearAuthSession, getCurrentUser, logout } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-[#2c5a43] text-[#f2f8ed]" : "text-[#9fb3a7] hover:bg-[#20382c] hover:text-[#dce8d7]"}`;

export function Navigation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const currentUser = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const isAuthenticated = Boolean(currentUser.data);

  const logoutUser = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearAuthSession();
      queryClient.setQueryData(["current-user"], null);
      toast.success("Logout");
    },
  });

  const handleLogout = () => {
    if (isAuthenticated) {
      logoutUser.mutate();
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav
      aria-label="Main navigation"
      className="flex gap-1 overflow-x-auto items-center"
    >
      {isAuthenticated ? (
        <>
          <NavLink to="/expenses" className={linkClass}>
            Expenses
          </NavLink>
          <NavLink to="/add-expense" className={linkClass}>
            Add expense
          </NavLink>
          <NavLink to="/add-category" className={linkClass}>
            Add category
          </NavLink>
          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold text-[#bc6548] transition hover:bg-[#49302b] hover:text-[#e4a09a]"
            title="Logout"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold text-[#bc6548] transition hover:bg-[#49302b] hover:text-[#e4a09a]"
          title="Login"
        >
          <LogIn className="size-4" />
          Login
        </button>
      )}
    </nav>
  );
}
