import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStoreProvider } from "../store/appStore";
import { ToastProvider } from "@/components/AppToast";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="products/[id]"
              options={{
                headerShown: true,
                title: "Product Detail",
              }}
            />
          </Stack>
        </ToastProvider>
      </AppStoreProvider>
    </QueryClientProvider>
  );
}
