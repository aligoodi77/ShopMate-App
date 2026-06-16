import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radius, spacing } from "../../../theme";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { PaginationDots } from "../components/PaginationDots";
import { onboardingSlides } from "../data/slides";

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 60,
    }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const currentIndex = viewableItems[0]?.index;

      if (typeof currentIndex === "number") {
        setActiveIndex(currentIndex);
      }
    },
    [],
  );

  function handleGetStarted() {
    router.replace("/(tabs)/home");
  }

  function handleLogin() {
    router.push("/login");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={onboardingSlides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <OnboardingSlide slide={item} width={width} />
        )}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <View style={styles.footer}>
        <PaginationDots
          total={onboardingSlides.length}
          activeIndex={activeIndex}
        />

        <Pressable style={styles.primaryButton} onPress={handleGetStarted}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  primaryButton: {
    height: 62,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  secondaryButton: {
    height: 58,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
});
