import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

let client: SupabaseClient | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (client) {
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      storageKey: "secret-page-app-auth",
    },
  });

  return client;
};


