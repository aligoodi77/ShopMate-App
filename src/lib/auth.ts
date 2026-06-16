import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export type SocialAuthProvider = "google" | "github";

const AUTH_CALLBACK_PATH = "auth/callback";
const NATIVE_SCHEME = "rnlab";
const handledCallbackUrls = new Set<string>();

export function getAuthRedirectUrl() {
  if (Platform.OS === "web") {
    return Linking.createURL(AUTH_CALLBACK_PATH);
  }

  return Linking.createURL(AUTH_CALLBACK_PATH, {
    scheme: NATIVE_SCHEME,
  });
}

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInWithSocialProvider(provider: SocialAuthProvider) {
  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.url) {
    throw new Error("Could not start social login.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success") {
    return null;
  }

  return handleAuthCallbackUrl(result.url);
}

export async function handleAuthCallbackUrl(url: string) {
  const params = getUrlParams(url);
  const hasAuthParams =
    params.has("code") ||
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.has("error") ||
    params.has("error_description");

  if (!hasAuthParams) {
    return null;
  }

  if (handledCallbackUrls.has(url)) {
    return null;
  }

  handledCallbackUrls.add(url);

  const errorDescription = params.get("error_description") ?? params.get("error");

  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const code = params.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  return null;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function getUrlParams(url: string) {
  const params = new URLSearchParams();
  const queryString = url.includes("?")
    ? url.split("?")[1]?.split("#")[0]
    : "";
  const hashString = url.includes("#") ? url.split("#")[1] : "";

  appendParams(params, queryString);
  appendParams(params, hashString);

  return params;
}

function appendParams(target: URLSearchParams, value?: string) {
  if (!value) {
    return;
  }

  new URLSearchParams(value).forEach((paramValue, key) => {
    target.set(key, paramValue);
  });
}
