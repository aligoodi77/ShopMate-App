import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
};

const PROFILE_SELECT = "id, full_name, email, role, avatar_url";

export type ProfileUpdateInput = {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
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

  return fetchOrCreateProfile(user);
}

export async function updateMyProfile({
  fullName,
  email,
  avatarUrl,
}: ProfileUpdateInput): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in to update your profile.");
  }

  await fetchOrCreateProfile(user);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      avatar_url: avatarUrl ?? null,
    })
    .eq("id", user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
}

async function fetchOrCreateProfile(user: User): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data as Profile;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      full_name: getUserFullName(user),
      email: user.email ?? null,
      role: "user" satisfies UserRole,
      avatar_url: getUserAvatarUrl(user),
    })
    .select(PROFILE_SELECT)
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return createdProfile as Profile;
}

function getUserFullName(user: User) {
  return (
    getMetadataString(user, "full_name") ??
    getMetadataString(user, "name") ??
    user.email?.split("@")[0] ??
    null
  );
}

function getUserAvatarUrl(user: User) {
  return (
    getMetadataString(user, "avatar_url") ??
    getMetadataString(user, "picture") ??
    null
  );
}

function getMetadataString(user: User, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim() ? value : null;
}
