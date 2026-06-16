import { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { fetchMyProfile, Profile } from "../lib/profile";
import { handleAuthCallbackUrl } from "../lib/auth";

type AuthStore = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthStoreContext = createContext<AuthStore | null>(null);

export function AuthStoreProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProfile() {
    try {
      const myProfile = await fetchMyProfile();
      setProfile(myProfile);
    } catch (error) {
      console.warn("Failed to load profile", error);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    await loadProfile();
  }

  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);

        if (session) {
          await loadProfile();
        }
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    async function handleIncomingUrl(url: string | null) {
      if (!url) {
        return;
      }

      try {
        const session = await handleAuthCallbackUrl(url);

        if (session) {
          setSession(session);
          await loadProfile();
        }
      } catch (error) {
        console.warn("Failed to complete auth callback", error);
      } finally {
        setIsLoading(false);
      }
    }

    Linking.getInitialURL().then(handleIncomingUrl);

    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      handleIncomingUrl(url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session) {
        await loadProfile();
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      urlSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthStoreContext.Provider
      value={{
        session,
        profile,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthStoreContext);

  if (!context) {
    throw new Error("useAuthStore must be used inside AuthStoreProvider");
  }

  return context;
}
