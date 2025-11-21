"use client";

import { AuthPanel } from "@/components/AuthPanel";
import { Dashboard } from "@/components/Dashboard";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export default function Home() {
  const { session, loading } = useSupabase();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-white/70">
        Loading session…
      </div>
    );
  }

  return session ? <Dashboard /> : <AuthPanel />;
}
