"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type SecretState = {
  content: string | null;
  loading: boolean;
  error: string | null;
};

const SECRET_EVENT = "secret-updated";

export function SecretViewer({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [{ content, loading, error }, setState] = useState<SecretState>({
    content: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const fetchSecret = async () => {
      if (!active) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase
        .from("secrets")
        .select("content")
        .eq("user_id", userId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setState({ content: null, loading: false, error: error.message });
      } else {
        setState({
          content: data?.content ?? null,
          loading: false,
          error: null,
        });
      }
    };

    fetchSecret();

    const handler = () => {
      fetchSecret();
    };

    window.addEventListener(SECRET_EVENT, handler);

    return () => {
      active = false;
      window.removeEventListener(SECRET_EVENT, handler);
    };
  }, [supabase, userId]);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">
            Secret message
          </p>
          <h3 className="text-2xl font-semibold">Page 1 view</h3>
        </div>
      </header>
      {loading ? (
        <p className="text-sm text-white/60">Loading your secret…</p>
      ) : error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : content ? (
        <p className="rounded-2xl bg-black/50 p-6 text-lg font-medium">
          {content}
        </p>
      ) : (
        <p className="text-sm text-white/60">
          No secret yet. Visit Secret Page 2 to write one.
        </p>
      )}
    </article>
  );
}

export function SecretEditor({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExisting() {
      const { data } = await supabase
        .from("secrets")
        .select("content")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.content) {
        setSecret(data.content);
      }
    }

    fetchExisting();
  }, [supabase, userId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    const { error } = await supabase.from("secrets").upsert({
      user_id: userId,
      content: secret,
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Secret saved!");
      window.dispatchEvent(new CustomEvent(SECRET_EVENT));
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white"
    >
      <header className="mb-4">
        <p className="text-sm uppercase tracking-wide text-white/60">
          Secret message
        </p>
        <h3 className="text-2xl font-semibold">Create or overwrite</h3>
      </header>
      <textarea
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        placeholder="Write something mysterious…"
        className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-white/90 px-4 py-2 font-semibold text-slate-900 hover:bg-white disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save secret"}
      </button>
      {status && <p className="mt-2 text-sm text-white/70">{status}</p>}
    </form>
  );
}

