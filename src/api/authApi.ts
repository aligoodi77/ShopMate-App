import { supabase } from "../lib/supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "user" | "admin";
  avatar_url: string | null;
};

export async function fetchMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
}
