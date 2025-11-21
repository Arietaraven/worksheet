import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anon key environment variables.");
}

if (!supabaseServiceKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Account deletion will fail until it is provided.",
  );
}

const resolvedSupabaseUrl = supabaseUrl;
const resolvedSupabaseAnonKey = supabaseAnonKey;
const resolvedSupabaseServiceKey = supabaseServiceKey;

export async function DELETE(request: Request) {
  if (!resolvedSupabaseServiceKey) {
    return NextResponse.json(
      { error: "Account deletion is unavailable." },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");

  const userClient = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message ?? "Invalid user token." },
      { status: 401 },
    );
  }

  const adminClient = createClient(resolvedSupabaseUrl, resolvedSupabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}


