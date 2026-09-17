import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function LandingPage(): ReactElement {
  return (
    <div className="relative flex h-[calc(100dvh-70px)] text-center flex-col justify-center items-center overflow-hidden bg-[#101915] text-[#dce8d7]">
      <p
        className="mb-6 font-mono text-[10px] uppercase tracking-[.35em] text-[#d99570] animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.1s" }}
      >
        A quieter way to keep track
      </p>
      <h1
        className="font-serif text-6xl leading-[.92] tracking-tight text-[#f2f8ed] sm:text-8xl animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.3s" }}
      >
        Make room
        <br />
        <em className="font-normal text-[#d99570] transition-colors duration-700 hover:text-[#e5a07c]">
          for what matters.
        </em>
      </h1>
      <p
        className="mx-auto mt-8 max-w-md text-base leading-7 text-[#9fb3a7] animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.5s" }}
      >
        A simple place to bring your everyday spending into focus.
      </p>
      <div
        className="mt-9 flex flex-wrap justify-center gap-3 animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.7s" }}
      >
        <Link
          to="/register"
          className="group rounded-xl bg-[#83b494] px-5 py-3 text-sm font-semibold text-[#102017] transition-all hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(131,180,148,0.3)] hover:bg-[#a5c9af] flex items-center"
        >
          Get started{" "}
          <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
