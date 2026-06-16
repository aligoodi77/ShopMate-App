import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  loginUser,
  registerUser,
  signInWithSocialProvider,
  SocialAuthProvider,
} from "../lib/auth";
import { useAuthStore } from "../store/authStore";
import { colors, radius, spacing } from "../theme";

type AuthMode = "login" | "register";
type IconName = keyof typeof Ionicons.glyphMap;

export default function LoginScreen() {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] =
    useState<SocialAuthProvider | null>(null);

  const isRegisterMode = mode === "register";
  const isSubmitting = isLoading || loadingProvider !== null;

  async function handleSubmit() {
    if (isRegisterMode && !fullName.trim()) {
      Alert.alert("Full name required", "Please enter your full name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      if (isRegisterMode) {
        const data = await registerUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });

        if (!data.session) {
          Alert.alert(
            "Check your email",
            "Your account was created. Confirm your email to finish signing in.",
          );
          return;
        }
      } else {
        await loginUser({
          email: email.trim(),
          password,
        });
      }

      router.replace("/home" as never);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      Alert.alert("Auth error", message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialAuth(provider: SocialAuthProvider) {
    try {
      setLoadingProvider(provider);
      const session = await signInWithSocialProvider(provider);

      if (session) {
        router.replace("/home" as never);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      Alert.alert("Auth error", message);
    } finally {
      setLoadingProvider(null);
    }
  }

  function toggleMode() {
    setMode((currentMode) => (currentMode === "login" ? "register" : "login"));
  }

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          <View style={styles.logoBox}>
            <Ionicons name="bag-handle" size={36} color="#fff" />
          </View>

          <Text style={styles.title}>
            {isRegisterMode ? "Create Account" : "Welcome Back"}
          </Text>

          <Text style={styles.subtitle}>
            {isRegisterMode
              ? "Register to start shopping with ShopMate."
              : "Login to continue to your ShopMate account."}
          </Text>

          {isRegisterMode && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ali Goudarzi"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ali@example.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isRegisterMode ? "Register" : "Login"}
              </Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <SocialButton
              icon="logo-google"
              label={
                isRegisterMode ? "Sign up with Google" : "Continue with Google"
              }
              iconColor="#EA4335"
              disabled={isSubmitting}
              isLoading={loadingProvider === "google"}
              onPress={() => handleSocialAuth("google")}
            />

            <SocialButton
              icon="logo-github"
              label={
                isRegisterMode ? "Sign up with GitHub" : "Continue with GitHub"
              }
              iconColor={colors.text}
              disabled={isSubmitting}
              isLoading={loadingProvider === "github"}
              onPress={() => handleSocialAuth("github")}
            />
          </View>

          <Pressable onPress={toggleMode} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isRegisterMode
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({
  icon,
  label,
  iconColor,
  disabled,
  isLoading,
  onPress,
}: {
  icon: IconName;
  label: string;
  iconColor: string;
  disabled: boolean;
  isLoading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.socialButton, disabled && styles.disabledButton]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <Ionicons name={icon} size={21} color={iconColor} />
          <Text style={styles.socialButtonText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  inputWrapper: {
    marginBottom: spacing.md,
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
  },

  submitButton: {
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },

  disabledButton: {
    opacity: 0.7,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: spacing.lg,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  socialButtons: {
    gap: spacing.sm,
  },

  socialButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },

  socialButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  switchButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  switchText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});
