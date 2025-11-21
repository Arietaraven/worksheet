"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Session,
  SupabaseClient,
} from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type SupabaseContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        setSession(initialSession);
        setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(
    () => ({ supabase, session, loading }),
    [supabase, session, loading],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = (): SupabaseContextValue => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};


