import { NavLink, Link, useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogIn, LogOut } from "lucide-react";
import { clearAuthSession, getCurrentUser, logout } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import type { User } from "../types";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-[#2c5a43] text-[#f2f8ed]" : "text-[#9fb3a7] hover:bg-[#20382c] hover:text-[#dce8d7]"}`;

const menuItemClass =
  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-[#9fb3a7] transition hover:bg-[#20382c] hover:text-[#dce8d7]";

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = user.first_name || user.user_name;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-2 flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-[#9fb3a7] transition hover:bg-[#20382c] hover:text-[#dce8d7]"
        title="Account menu"
      >
        <span className="grid size-7 place-items-center rounded-full bg-[#2c5a43] font-mono text-xs text-[#f2f8ed]">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-xl border border-[#30453b] bg-[#17251f] p-1 shadow-xl shadow-black/30">
          <div className="border-b border-[#30453b] px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#dce8d7]">
              {displayName}
            </p>
          </div>
          <div className="p-1">
            <Link
              to="/update-password"
              onClick={() => setOpen(false)}
              className={menuItemClass}
            >
              <KeyRound className="size-4" />
              Update password
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className={`${menuItemClass} w-full text-left text-[#bc6548] hover:bg-[#49302b] hover:text-[#e4a09a]`}
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navigation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const currentUser = useQuery<User | null>({
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
      className="flex gap-1 overflow-x-auto overflow-visible items-center"
    >
      {isAuthenticated ? (
        <>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/expenses" className={linkClass}>
            Expenses
          </NavLink>
          <NavLink to="/add-expense" className={linkClass}>
            Add expense
          </NavLink>
          <NavLink to="/add-category" className={linkClass}>
            Add category
          </NavLink>
          {currentUser.data && (
            <UserMenu user={currentUser.data} onLogout={handleLogout} />
          )}
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
