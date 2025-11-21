"use client";

import { FormEvent, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type Mode = "login" | "register";

export function AuthPanel() {
  const { supabase } = useSupabase();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setMessage(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Logged in! Redirecting…");
      } else {
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (user) {
          await supabase
            .from("profiles")
            .upsert({ id: user.id, email: user.email, display_name: displayName || null });
        }

        setMessage("Account created! Please confirm your email if required.");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-full px-3 py-1 ${
              mode === "login" ? "bg-white text-slate-900" : "bg-white/10"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`rounded-full px-3 py-1 ${
              mode === "register" ? "bg-white text-slate-900" : "bg-white/10"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
        </label>

        <label className="text-sm font-medium">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            required
          />
        </label>

        {mode === "register" && (
          <label className="text-sm font-medium">
            Display name (optional)
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Agent 47"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-2xl bg-white/90 px-4 py-3 font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed"
        >
          {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-white/70">
          {message}
        </p>
      )}
    </section>
  );
}


