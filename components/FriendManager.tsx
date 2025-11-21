"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export type Relationship = {
  id: string;
  status: "pending" | "accepted";
  requester_id: string;
  addressee_id: string;
  requester?: Profile;
  addressee?: Profile;
};

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
};

export function FriendManager({ relationships, refresh }: { relationships: Relationship[]; refresh: () => Promise<void>; }) {
  const { supabase, session } = useSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [secretView, setSecretView] = useState<string | null>(null);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);

  const acceptedIds = useMemo(() => {
    if (!session) return [];
    return relationships
      .filter((relationship) => relationship.status === "accepted")
      .map((relationship) =>
        relationship.requester_id === session.user.id
          ? relationship.addressee_id
          : relationship.requester_id,
      );
  }, [relationships, session]);

  const pendingIncoming = relationships.filter(
    (relationship) =>
      relationship.status === "pending" &&
      relationship.addressee_id === session?.user.id,
  );

  const handleSendRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) return;
    setStatus(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setStatus("Enter an email.");
      return;
    }
    if (normalized === session.user.email?.toLowerCase()) {
      setStatus("You cannot add yourself.");
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email")
      .eq("email", normalized)
      .maybeSingle();
    if (profileError || !profile) {
      setStatus(profileError?.message ?? "User not found.");
      return;
    }

    const { error } = await supabase.from("friends").insert({
      requester_id: session.user.id,
      addressee_id: profile.id,
      status: "pending",
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Request sent!");
      setEmail("");
      await refresh();
    }
  };

  const handleAccept = async (id: string) => {
    setStatus(null);
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", id);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Friend request accepted.");
      await refresh();
    }
  };

  const handleViewSecret = async (friendId: string) => {
    if (!session) return;
    setSecretView(friendId);
    setSecretMessage(null);
    setStatus(null);
    setLoadingSecret(true);
    try {
      const response = await fetch("/api/friends/secret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.status === 401) {
        setStatus("401 Not authorized to view this message.");
        setSecretMessage(null);
      } else if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatus(payload.error ?? "Unable to fetch secret.");
      } else {
        const payload = await response.json();
        setSecretMessage(payload.secret ?? "No secret yet.");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setStatus(err.message ?? "Unable to fetch secret.");
    } finally {
      setLoadingSecret(false);
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <header>
        <p className="text-sm uppercase tracking-wide text-white/60">
          Secret Page 3
        </p>
        <h3 className="text-2xl font-semibold">Friend network</h3>
        <p className="text-sm text-white/60">
          Send requests, accept new friends, and unlock their secrets.
        </p>
      </header>

      <form onSubmit={handleSendRequest} className="flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="friend@example.com"
          className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          required
        />
        <button
          type="submit"
          className="rounded-2xl bg-white/90 px-4 py-3 font-semibold text-slate-900 hover:bg-white"
        >
          Send request
        </button>
      </form>

      {pendingIncoming.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-white/5 bg-black/30 p-4">
          <p className="text-sm font-medium text-white/80">Pending requests</p>
          {pendingIncoming.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">
                  {request.requester?.display_name ?? request.requester?.email}
                </p>
                <p className="text-xs text-white/60">{request.requester?.email}</p>
              </div>
              <button
                onClick={() => handleAccept(request.id)}
                className="rounded-full bg-green-400/90 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium text-white/80">
          Accepted friends ({acceptedIds.length})
        </p>
        {acceptedIds.length === 0 ? (
          <p className="text-sm text-white/60">
            No friends yet. Send or accept a request to start sharing secrets.
          </p>
        ) : (
          relationships
            .filter((relationship) => relationship.status === "accepted")
            .map((relationship) => {
              const profile =
                relationship.requester_id === session?.user.id
                  ? relationship.addressee
                  : relationship.requester;
              if (!profile) return null;
              return (
                <div
                  key={relationship.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {profile.display_name ?? profile.email}
                    </p>
                    <p className="text-xs text-white/60">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => handleViewSecret(profile.id)}
                    className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    View secret
                  </button>
                </div>
              );
            })
        )}
      </div>

      {secretView && (
        <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
          <p className="text-sm uppercase tracking-wide text-white/60">
            Friend&apos;s secret
          </p>
          {loadingSecret ? (
            <p className="text-sm text-white/60">Fetching secret…</p>
          ) : secretMessage ? (
            <p className="mt-2 whitespace-pre-wrap text-lg font-medium">
              {secretMessage}
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/60">No secret to display.</p>
          )}
        </div>
      )}

      {status && <p className="text-sm text-white/70">{status}</p>}
    </section>
  );
}


