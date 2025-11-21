import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const { friendId } = await request.json();

  if (!friendId) {
    return NextResponse.json({ error: "friendId is required" }, { status: 400 });
  }

  const authClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message ?? "Invalid session" },
      { status: 401 },
    );
  }

  const userClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: friendship } = await userClient
    .from("friends")
    .select("status,requester_id,addressee_id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (!friendship) {
    return NextResponse.json(
      { error: "401 Not authorized" },
      { status: 401 },
    );
  }

  const { data: secret, error: secretError } = await userClient
    .from("secrets")
    .select("content")
    .eq("user_id", friendId)
    .maybeSingle();

  if (secretError) {
    return NextResponse.json(
      { error: secretError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ secret: secret?.content ?? null });
}


