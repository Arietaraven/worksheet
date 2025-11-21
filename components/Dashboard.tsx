"use client";

import Link from "next/link";
import { AccountActions } from "@/components/AccountActions";
import { useSupabase } from "@/components/providers/SupabaseProvider";

const shortcuts = [
  { title: "Secret Page 1", href: "/secret-page-1", description: "View your secret message" },
  { title: "Secret Page 2", href: "/secret-page-2", description: "Create or update your secret" },
  { title: "Secret Page 3", href: "/secret-page-3", description: "Manage friends & share secrets" },
];

export function Dashboard() {
  const { session } = useSupabase();

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-slate-900/60 p-8 shadow-2xl">
        <p className="text-sm text-white/70">Logged in as</p>
        <h2 className="text-3xl font-semibold text-white">
          {session?.user.email}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Choose a secret page to continue or manage your account below.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
          >
            <p className="text-sm uppercase tracking-wide text-white/70">
              {shortcut.title}
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {shortcut.description}
            </p>
          </Link>
        ))}
      </div>

      <AccountActions />
    </section>
  );
}


