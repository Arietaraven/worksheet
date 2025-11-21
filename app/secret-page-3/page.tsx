"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountActions } from "@/components/AccountActions";
import {
  FriendManager,
  type Profile,
  type Relationship,
} from "@/components/FriendManager";
import { SecretEditor, SecretViewer } from "@/components/SecretMessageCard";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function SecretPageThree() {
  const { loading, session } = useRequireAuth();
  const { supabase } = useSupabase();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(true);

  type RawRelationship = Omit<Relationship, "requester" | "addressee"> & {
    requester?: Profile | Profile[] | null;
    addressee?: Profile | Profile[] | null;
  };

  const normalizeProfile = (
    profile?: Profile | Profile[] | null,
  ): Profile | undefined => {
    if (!profile) return undefined;
    return Array.isArray(profile) ? profile[0] : profile;
  };

  const refreshRelationships = useCallback(async () => {
    if (!session) return;
    setLoadingRelationships(true);
    const { data, error } = await supabase
      .from("friends")
      .select(
        "id,status,requester_id,addressee_id,requester:requester_id(id,email,display_name),addressee:addressee_id(id,email,display_name)",
      )
      .or(
        `requester_id.eq.${session.user.id},addressee_id.eq.${session.user.id}`,
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      const normalized = (data as RawRelationship[]).map((item) => ({
        ...item,
        requester: normalizeProfile(item.requester),
        addressee: normalizeProfile(item.addressee),
      }));
      setRelationships(normalized);
    }
    setLoadingRelationships(false);
  }, [session, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRelationships();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshRelationships]);

  if (loading || !session) {
    return (
      <div className="text-white/70">
        Checking authentication…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/30 via-slate-900/70 to-black/60 p-8 text-white">
        <p className="text-sm uppercase tracking-wide text-white/60">
          Secret Page 3
        </p>
        <h2 className="text-3xl font-semibold">
          Build your trusted network
        </h2>
        <p className="mt-2 text-white/70">
          Everything from Pages 1 & 2 plus friend requests and shared secrets.
        </p>
      </div>

      <SecretEditor userId={session.user.id} />
      <SecretViewer userId={session.user.id} />

      {loadingRelationships ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
          Loading friends…
        </div>
      ) : (
        <FriendManager
          relationships={relationships}
          refresh={refreshRelationships}
        />
      )}

      <AccountActions />
    </div>
  );
}


