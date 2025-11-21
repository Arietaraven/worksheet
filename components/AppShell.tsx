"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

const navLinks = [
  { href: "/secret-page-1", label: "Secret Page 1" },
  { href: "/secret-page-2", label: "Secret Page 2" },
  { href: "/secret-page-3", label: "Secret Page 3" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { session } = useSupabase();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-8">
        <header className="mb-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Secret Page App
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Applicant Worksheet
            </h1>
          </div>
          {session ? (
            <nav className="flex flex-wrap gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    pathname === href
                      ? "bg-white text-slate-900"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : (
            <p className="text-sm text-slate-400">
              Login or register to unlock the secret pages.
            </p>
          )}
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-10 text-center text-xs text-slate-500">
          Built with Next.js + Supabase
        </footer>
      </div>
    </div>
  );
}


