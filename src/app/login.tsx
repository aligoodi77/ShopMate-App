import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { loginUser, registerUser } from "../lib/auth";
import { colors, radius, spacing } from "../theme";

type AuthMode = "login" | "register";

export default function LoginScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const isRegisterMode = mode === "register";

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
        await registerUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });

        Alert.alert("Account created", "Your account has been created.");
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

  function toggleMode() {
    setMode((currentMode) => (currentMode === "login" ? "register" : "login"));
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
            disabled={isLoading}
            style={[styles.submitButton, isLoading && styles.disabledButton]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isRegisterMode ? "Register" : "Login"}
              </Text>
            )}
          </Pressable>

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

const styles = StyleSheet.create({
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
