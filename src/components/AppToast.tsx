import { Ionicons } from "@expo/vector-icons";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";

type ToastType = "success" | "error" | "info";

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(toastMessage: string, toastType: ToastType = "success") {
    setMessage(toastMessage);
    setType(toastType);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  const iconName =
    type === "success"
      ? "checkmark-circle"
      : type === "error"
        ? "alert-circle"
        : "information-circle";

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.root}>
        {children}

        {message ? (
          <View style={[styles.toast, styles[type]]} pointerEvents="none">
            <Ionicons name={iconName} size={22} color="#fff" />
            <Text style={styles.toastText}>{message}</Text>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 94,
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  success: {
    backgroundColor: "#16A34A",
  },

  error: {
    backgroundColor: "#EF4444",
  },

  info: {
    backgroundColor: "#0F172A",
  },

  toastText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
