import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "../store/authStore";

type IconName = keyof typeof Ionicons.glyphMap;

type Slide = {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  mainIcon: IconName;
  floatingIcons: {
    name: IconName;
    style: ViewStyle;
  }[];
};

const slides: Slide[] = [
  {
    id: "1",
    title: "Everything you love,",
    highlight: "all in one place.",
    subtitle:
      "Discover top products, exclusive deals, and a better way to shop.",
    mainIcon: "bag-handle",
    floatingIcons: [
      { name: "headset", style: { top: 25, right: 34 } },
      { name: "shirt", style: { top: 42, left: 36 } },
      { name: "watch", style: { bottom: 82, left: 18 } },
      { name: "camera", style: { bottom: 82, right: 18 } },
    ],
  },
  {
    id: "2",
    title: "Find products",
    highlight: "faster and easier.",
    subtitle:
      "Browse, search, filter, and discover items with a clean shopping flow.",
    mainIcon: "search",
    floatingIcons: [
      { name: "grid", style: { top: 30, left: 36 } },
      { name: "pricetag", style: { top: 35, right: 36 } },
      { name: "star", style: { bottom: 78, left: 28 } },
      { name: "flash", style: { bottom: 78, right: 28 } },
    ],
  },
  {
    id: "3",
    title: "Save your",
    highlight: "favorite items.",
    subtitle:
      "Keep the products you like and access them anytime from favorites.",
    mainIcon: "heart",
    floatingIcons: [
      { name: "heart-circle", style: { top: 30, right: 36 } },
      { name: "bookmark", style: { top: 42, left: 36 } },
      { name: "albums", style: { bottom: 78, right: 28 } },
      { name: "checkmark-circle", style: { bottom: 78, left: 28 } },
    ],
  },
  {
    id: "4",
    title: "Manage orders",
    highlight: "and your profile.",
    subtitle:
      "Track cart items, checkout demo orders, and manage your shopping profile.",
    mainIcon: "person-circle",
    floatingIcons: [
      { name: "cart", style: { top: 30, left: 34 } },
      { name: "receipt", style: { top: 40, right: 36 } },
      { name: "settings", style: { bottom: 78, left: 28 } },
      { name: "shield-checkmark", style: { bottom: 78, right: 28 } },
    ],
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const { session, isLoading } = useAuthStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 60,
    }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;

      if (typeof index === "number") {
        setActiveIndex(index);
      }
    },
    [],
  );

  function handleGetStarted() {
    router.replace({
      pathname: "/home",
    });
  }

  function handleLogin() {
    router.push({
      pathname: "/login",
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#0B63F6" />
      </SafeAreaView>
    );
  }

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="bag-handle" size={28} color="#fff" />
              </View>

              <Text style={styles.logoText}>
                Shop<Text style={styles.logoHighlight}>Mate</Text>
              </Text>
            </View>

            <View style={styles.illustration}>
              <View style={styles.bigCircle} />

              <View style={styles.mainIconBox}>
                <Ionicons name={item.mainIcon} size={70} color="#fff" />
              </View>

              {item.floatingIcons.map((icon, index) => (
                <View
                  key={`${icon.name}-${index}`}
                  style={[styles.bubble, icon.style]}
                >
                  <Ionicons name={icon.name} size={25} color="#0B63F6" />
                </View>
              ))}

              <View style={[styles.smallDot, styles.dotOne]} />
              <View style={[styles.smallDot, styles.dotTwo]} />
              <View style={[styles.smallDot, styles.dotThree]} />
            </View>

            <View style={styles.textBox}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.highlight}>{item.highlight}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

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
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  slide: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
  },

  logoHighlight: {
    color: "#0B63F6",
  },

  illustration: {
    width: 270,
    height: 270,
    marginTop: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  bigCircle: {
    position: "absolute",
    width: 245,
    height: 245,
    borderRadius: 130,
    backgroundColor: "#EAF3FF",
  },
  mainIconBox: {
    width: 132,
    height: 132,
    borderRadius: 32,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B63F6",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  bubble: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },

  smallDot: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#0B63F6",
  },

  dotOne: {
    top: 100,
    right: 95,
  },

  dotTwo: {
    bottom: 92,
    left: 72,
  },

  dotThree: {
    bottom: 105,
    right: 72,
  },

  textBox: {
    marginTop: 10,
    alignItems: "center",
  },

  title: {
    marginTop: 2,
    fontSize: 29,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  highlight: {
    marginTop: 2,
    fontSize: 29,
    fontWeight: "900",
    color: "#0B63F6",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 330,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 18,
    gap: 14,
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#CFE1F8",
  },

  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0B63F6",
  },

  primaryButton: {
    height: 62,
    borderRadius: 30,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0B63F6",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  secondaryButton: {
    height: 58,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#0B63F6",
    fontSize: 17,
    fontWeight: "900",
  },
});
