"use client";

import { AccountActions } from "@/components/AccountActions";
import { SecretEditor, SecretViewer } from "@/components/SecretMessageCard";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function SecretPageTwo() {
  const { loading, session } = useRequireAuth();

  if (loading || !session) {
    return (
      <div className="text-white/70">
        Checking authentication…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/30 via-slate-900/70 to-black/60 p-8 text-white">
        <p className="text-sm uppercase tracking-wide text-white/60">
          Secret Page 2
        </p>
        <h2 className="text-3xl font-semibold">Write your next secret</h2>
        <p className="mt-2 text-white/70">
          Everything from Page 1 plus tools to add or overwrite your classified message.
        </p>
      </div>
      <SecretEditor userId={session.user.id} />
      <SecretViewer userId={session.user.id} />
      <AccountActions />
    </div>
  );
}


