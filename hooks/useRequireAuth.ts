"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export const useRequireAuth = () => {
  const { session, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, router, session]);

  return { session, loading };
};


