import type { ReactNode } from "react";
export function AuthCard({
    title,
    footer,
    children,
}: {
    title: string;
    footer: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="grid place-items-center min-h-[calc(100dvh-70px)] bg-[#101915] p-5">
            <div className="w-full max-w-md rounded-3xl border border-[#30453b] bg-[#17251f] p-8 shadow-xl shadow-black/30">
                <p className="font-mono text-[10px] uppercase tracking-[.25em] text-[#e59a70]">
                    Personal finance
                </p>
                <h1 className="mt-2 font-serif text-4xl text-[#dce8d7]">{title}</h1>
                <div className="mt-8">{children}</div>
                <p className="mt-6 text-center text-sm text-[#9fb3a7]">{footer}</p>
            </div>
        </div>
    );
}