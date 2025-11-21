"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export function AccountActions() {
  const { supabase, session } = useSupabase();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"logout" | "delete" | null>(null);

  const handleLogout = async () => {
    setLoading("logout");
    setStatus(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setStatus(err.message ?? "Unable to logout.");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;
    setLoading("delete");
    setStatus(null);
    try {
      const token = session.access_token;
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete account.");
      }

      await supabase.auth.signOut();
      setStatus("Account deleted.");
    } catch (error: unknown) {
      const err = error as { message?: string };
      setStatus(err.message ?? "Unable to delete account.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <p className="text-white">Account controls</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleLogout}
          disabled={loading === "logout"}
          className="rounded-full bg-white/20 px-4 py-2 font-medium text-white transition hover:bg-white/30 disabled:opacity-50"
        >
          {loading === "logout" ? "Logging out…" : "Sign out"}
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={loading === "delete"}
          className="rounded-full bg-red-500/70 px-4 py-2 font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {loading === "delete" ? "Deleting…" : "Delete account"}
        </button>
      </div>
      {status && <p className="text-xs text-white/60">{status}</p>}
    </div>
  );
}


