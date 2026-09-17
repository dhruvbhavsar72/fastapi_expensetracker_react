import { Link } from "react-router-dom";
import { Navigation } from "./Navigation";

export function Header() {
  return (
    <header className="border-b border-[#30453b] bg-[#101915]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/expenses"
          className="font-serif text-2xl font-semibold text-[#dce8d7]"
        >
          Morrow
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
