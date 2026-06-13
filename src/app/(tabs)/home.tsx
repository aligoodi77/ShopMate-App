import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProducts } from "../../api/productsApi";
import { Product, ProductCategory } from "../../data/products";
import { useAppStore } from "../../store/appStore";
// import { useCartStore } from "../../store/cartStore";

type IconName = keyof typeof Ionicons.glyphMap;

const userAvatarImage = require("../../assets/images/user-avatar.png");

const categoryIcons: Record<ProductCategory | "All", IconName> = {
  All: "grid",
  Laptops: "laptop",
  Phones: "phone-portrait",
  Audio: "headset",
  Gaming: "game-controller",
  Keyboards: "keypad",
  Printers: "cube",
};

const categoryPalettes: Record<
  ProductCategory | "All",
  { accent: string; surface: string }
> = {
  All: { accent: "#0B63F6", surface: "#EAF3FF" },
  Laptops: { accent: "#2563EB", surface: "#EAF2FF" },
  Phones: { accent: "#0891B2", surface: "#E8FAFF" },
  Audio: { accent: "#EA580C", surface: "#FFF1E8" },
  Gaming: { accent: "#DC2626", surface: "#FFECEC" },
  Keyboards: { accent: "#059669", surface: "#E9FBF4" },
  Printers: { accent: "#7C3AED", surface: "#F3ECFF" },
};

const drawerItems: {
  label: string;
  icon: IconName;
  route: "/home" | "/favorites" | "/cart" | "/profile";
}[] = [
  { label: "Home", icon: "home", route: "/home" },
  { label: "Favorites", icon: "heart", route: "/favorites" },
  { label: "Cart", icon: "cart", route: "/cart" },
  { label: "Profile", icon: "person", route: "/profile" },
];

function filterProductsByCategory(products: Product[], category: string) {
  if (category === "All") {
    return products;
  }

  return products.filter((product) => product.category === category);
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { isDarkMode, setIsDarkMode, isFavorite, toggleFavorite } = useAppStore();

  // const cartCount = useCartStore((state) => state.getTotalCount?.() ?? 0);
  const cartCount = 0;
  const trendCardWidth = width - 36;
  const drawerWidth = Math.min(width * 0.8, 320);
  const [drawerProgress] = useState(() => new Animated.Value(0));
  const theme = useMemo(
    () => ({
      background: isDarkMode ? "#0B1120" : "#F8FAFC",
      surface: isDarkMode ? "#111827" : "#FFFFFF",
      surfaceSoft: isDarkMode ? "#172033" : "#F1F5F9",
      text: isDarkMode ? "#F8FAFC" : "#0F172A",
      muted: isDarkMode ? "#94A3B8" : "#64748B",
      border: isDarkMode ? "#263244" : "#E2E8F0",
      iconSurface: isDarkMode ? "#1E3A5F" : "#EAF3FF",
      drawer: isDarkMode ? "#0F172A" : "#FFFFFF",
    }),
    [isDarkMode],
  );
  const viewabilityConfig = useMemo(() => ({
    viewAreaCoveragePercentThreshold: 60,
  }), []);

  const onTrendViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;

      if (typeof index === "number") {
        setActiveTrendIndex(index);
      }
    },
    [],
  );

  const {
    data = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(data, activeCategory);
    const q = search.trim().toLowerCase();

    if (!q) {
      return byCategory;
    }

    return byCategory.filter((product) =>
      product.title.toLowerCase().includes(q),
    );
  }, [data, search, activeCategory]);

  const trendProducts = useMemo(() => {
    const featured = data.filter((product) => product.isTrending);

    return featured.length > 0 ? featured : data.slice(0, 4);
  }, [data]);

  const categories = useMemo(() => {
    const productCategories = data.map((product) => product.category);
    return ["All", ...Array.from(new Set(productCategories))];
  }, [data]);

  function handleOpenCart() {
    router.push("/cart");
  }

  function openDrawer() {
    drawerProgress.stopAnimation();
    drawerProgress.setValue(0);
    setIsDrawerVisible(true);

    requestAnimationFrame(() => {
      Animated.timing(drawerProgress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }

  function closeDrawer() {
    drawerProgress.stopAnimation();

    Animated.timing(drawerProgress, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsDrawerVisible(false);
      }
    });
  }

  function handleOpenSidebar() {
    openDrawer();
  }

  function handleDrawerItemPress(
    route: "/home" | "/favorites" | "/cart" | "/profile",
  ) {
    closeDrawer();
    router.push(route);
  }

  function handleVoiceSearch() {
    console.log("start voice search");
  }

  function handleLogout() {
    closeDrawer();
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0B63F6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle" size={42} color="#EF4444" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView
        style={[styles.screen, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={isFetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Pressable
                  style={[
                    styles.iconButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  onPress={handleOpenSidebar}
                >
                  <Ionicons name="menu" size={26} color={theme.text} />
                </Pressable>

                <View style={styles.logoRow}>
                  <View style={styles.logoIcon}>
                    <Ionicons name="bag-handle" size={22} color="#fff" />
                  </View>

                  <Text style={[styles.logoText, { color: theme.text }]}>
                    Shop<Text style={styles.logoHighlight}>Mate</Text>
                  </Text>
                </View>

                <Pressable
                  style={[
                    styles.cartButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  onPress={handleOpenCart}
                >
                  <Ionicons name="cart" size={25} color={theme.text} />

                  {cartCount > 0 ? (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>

              <View
                style={[
                  styles.searchBox,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Ionicons name="search" size={22} color={theme.muted} />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search products..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.searchInput, { color: theme.text }]}
                />

                <Pressable style={styles.voiceButton} onPress={handleVoiceSearch}>
                  <Ionicons name="mic" size={22} color="#0B63F6" />
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Trending Now
                </Text>
                <Text style={styles.sectionLink}>Summer Sale</Text>
              </View>

              <FlatList
                data={trendProducts}
                horizontal
                pagingEnabled
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onTrendViewableItemsChanged}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.trendCard, { width: trendCardWidth }]}
                    onPress={() =>
                      router.push({
                        pathname: "/products/[id]",
                        params: { id: item.id },
                      })
                    }
                  >
                    <View style={styles.trendTextBox}>
                      <Text style={styles.trendEyebrow}>Summer Sale</Text>
                      <Text style={styles.trendTitle}>Up to 40% OFF</Text>
                      <Text style={styles.trendSubtitle} numberOfLines={1}>
                        {item.category} deals from ${item.price}
                      </Text>

                      <View style={styles.trendCta}>
                        <Text style={styles.trendCtaText}>Shop now</Text>
                        <Ionicons name="arrow-forward" size={14} color="#0B63F6" />
                      </View>
                    </View>

                    <View style={styles.trendImageBox}>
                      <Image source={item.image} style={styles.trendImage} />
                    </View>
                  </Pressable>
                )}
              />

              <View style={styles.trendDotsRow}>
                {trendProducts.map((product, index) => (
                  <View
                    key={product.id}
                    style={[
                      styles.trendDot,
                      index === activeTrendIndex && styles.trendDotActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Categories
                </Text>
                <Text style={styles.sectionLink}>See all</Text>
              </View>

              <FlatList
                data={categories}
                horizontal
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesRow}
                renderItem={({ item: category }) => {
                  const typedCategory = category as ProductCategory | "All";
                  const isActive = category === activeCategory;
                  const icon = categoryIcons[typedCategory];
                  const palette = categoryPalettes[typedCategory];

                  return (
                    <Pressable
                      key={category}
                      style={styles.categoryItem}
                      onPress={() => setActiveCategory(category)}
                    >
                      <View
                        style={[
                          styles.categoryIconTile,
                          {
                            backgroundColor: isActive
                              ? palette.accent
                              : palette.surface,
                            borderColor: isActive ? palette.accent : "#FFFFFF",
                          },
                        ]}
                      >
                        <Ionicons
                          name={icon}
                          size={21}
                          color={isActive ? "#FFFFFF" : palette.accent}
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.categoryText,
                          { color: theme.muted },
                          isActive && { color: theme.text },
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Popular Products
                </Text>
                <Text style={styles.sectionLink}>
                  {filteredProducts.length} items
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                Try another search or category.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.productCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Pressable
                style={styles.productTapArea}
                onPress={() =>
                  router.push({
                    pathname: "/products/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View
                  style={[
                    styles.productImageBox,
                    { backgroundColor: theme.surfaceSoft },
                  ]}
                >
                  <Image source={item.image} style={styles.productImage} />
                </View>

                <Text
                  style={[styles.productTitle, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <Text
                  style={[styles.productDescription, { color: theme.muted }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>${item.price}</Text>

                  <View style={styles.addSmallButton}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </View>
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.favoriteButton,
                  {
                    backgroundColor: isFavorite(item.id)
                      ? "#FEE2E2"
                      : theme.surface,
                  },
                ]}
                onPress={() => toggleFavorite(item.id)}
              >
                <Ionicons
                  name={isFavorite(item.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite(item.id) ? "#EF4444" : theme.muted}
                />
              </Pressable>
            </View>
          )}
        />
      </SafeAreaView>

      <Modal
        visible={isDrawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerRoot}>
          <Pressable style={styles.drawerOverlayButton} onPress={closeDrawer}>
            <Animated.View
              style={[
                styles.drawerScrim,
                {
                  opacity: drawerProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.42],
                  }),
                },
              ]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                backgroundColor: theme.drawer,
                transform: [
                  {
                    translateX: drawerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-drawerWidth, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <SafeAreaView style={styles.drawerSafeArea} edges={["top", "bottom"]}>
              <View style={styles.drawerHeader}>
                <Image source={userAvatarImage} style={styles.drawerAvatar} />

                <View style={styles.drawerTitleBox}>
                  <Text style={[styles.drawerTitle, { color: theme.text }]}>
                    John Doe
                  </Text>
                  <Text style={[styles.drawerSubtitle, { color: theme.muted }]}>
                    john.doe@email.com
                  </Text>
                </View>

                <Pressable
                  style={[
                    styles.drawerCloseButton,
                    { backgroundColor: theme.surfaceSoft, borderColor: theme.border },
                  ]}
                  onPress={closeDrawer}
                >
                  <Ionicons name="close" size={21} color={theme.text} />
                </Pressable>
              </View>

              <View style={styles.drawerMenu}>
                {drawerItems.map((item) => (
                  <Pressable
                    key={item.route}
                    style={[
                      styles.drawerMenuItem,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => handleDrawerItemPress(item.route)}
                  >
                    <View style={styles.drawerMenuIcon}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color="#0B63F6"
                      />
                    </View>

                    <Text style={[styles.drawerMenuText, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.drawerPreferences}>
                <Text style={[styles.drawerPreferenceTitle, { color: theme.muted }]}>
                  Preferences
                </Text>

                <View style={styles.drawerPremiumCard}>
                  <View style={styles.drawerPremiumIcon}>
                    <Ionicons name="moon" size={25} color="#FFFFFF" />
                  </View>

                  <View style={styles.drawerPremiumCopy}>
                    <View style={styles.drawerPremiumTitleRow}>
                      <Text style={styles.drawerPremiumTitle}>Dark Mode</Text>
                      <View style={styles.drawerPremiumBadge}>
                        <Text style={styles.drawerPremiumBadgeText}>
                          Premium
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.drawerPremiumHint}>
                      Switch to a sleek dark theme
                    </Text>
                  </View>

                  <Switch
                    value={isDarkMode}
                    onValueChange={setIsDarkMode}
                    trackColor={{ false: "#CBD5E1", true: "#60A5FA" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.drawerBottom}>
                <Pressable style={styles.drawerLogoutButton} onPress={handleLogout}>
                  <View style={styles.drawerLogoutIcon}>
                    <Ionicons name="log-out-outline" size={24} color="#DC2626" />
                  </View>

                  <Text style={styles.drawerLogoutText}>Log Out</Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: "#64748B",
    fontSize: 15,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  retryButton: {
    backgroundColor: "#0B63F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },

  retryText: {
    color: "#fff",
    fontWeight: "800",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  header: {
    marginTop: 8,
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
  },

  logoHighlight: {
    color: "#0B63F6",
  },

  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cartBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#F8FAFC",
  },

  cartBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  searchBox: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: "#0F172A",
  },

  voiceButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  sectionLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0B63F6",
  },

  trendCard: {
    minHeight: 150,
    borderRadius: 20,
    backgroundColor: "#0B63F6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#0B63F6",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  trendTextBox: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  trendEyebrow: {
    color: "#EAF3FF",
    fontSize: 13,
    fontWeight: "800",
  },

  trendTitle: {
    marginTop: 5,
    color: "#fff",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
  },

  trendSubtitle: {
    marginTop: 6,
    color: "#DBEAFE",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },

  trendCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 13,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  trendCtaText: {
    color: "#0B63F6",
    fontSize: 12,
    fontWeight: "900",
  },

  trendImageBox: {
    width: 126,
    height: 116,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transform: [{ rotate: "-4deg" }],
  },

  trendImage: {
    width: "108%",
    height: "108%",
    resizeMode: "contain",
    transform: [{ rotate: "4deg" }],
  },

  trendDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  trendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },

  trendDotActive: {
    width: 22,
    backgroundColor: "#0B63F6",
  },

  categoriesRow: {
    gap: 13,
    paddingRight: 18,
  },

  categoryItem: {
    width: 64,
    alignItems: "center",
  },

  categoryIconTile: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  categoryText: {
    marginTop: 7,
    color: "#475569",
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
    width: "100%",
  },

  categoryTextActive: {
    color: "#0F172A",
  },

  productRow: {
    gap: 14,
  },

  productCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  productTapArea: {
    flex: 1,
  },

  productImageBox: {
    height: 135,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  productTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    minHeight: 36,
  },

  productDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    minHeight: 34,
  },

  productFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0B63F6",
  },

  addSmallButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
  },

  drawerRoot: {
    flex: 1,
  },

  drawerOverlayButton: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  drawerScrim: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  drawerPanel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
    elevation: 10,
  },

  drawerSafeArea: {
    flex: 1,
    paddingHorizontal: 22,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 28,
  },

  drawerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAF3FF",
  },

  drawerTitleBox: {
    flex: 1,
    marginLeft: 16,
  },

  drawerTitle: {
    color: "#0F172A",
    fontSize: 23,
    fontWeight: "900",
  },

  drawerSubtitle: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },

  drawerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  drawerMenu: {
    gap: 14,
  },

  drawerMenuItem: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },

  drawerMenuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  drawerMenuText: {
    flex: 1,
    marginLeft: 15,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },

  drawerPreferences: {
    marginTop: 28,
  },

  drawerPreferenceTitle: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },

  drawerPremiumCard: {
    minHeight: 78,
    borderRadius: 16,
    backgroundColor: "#162238",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  drawerPremiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#243553",
    alignItems: "center",
    justifyContent: "center",
  },

  drawerPremiumCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },

  drawerPremiumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  drawerPremiumTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  drawerPremiumBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  drawerPremiumBadgeText: {
    color: "#BFDBFE",
    fontSize: 9,
    fontWeight: "900",
  },

  drawerPremiumHint: {
    marginTop: 4,
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
  },

  drawerBottom: {
    marginTop: "auto",
    paddingTop: 20,
    paddingBottom: 8,
  },

  drawerLogoutButton: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  drawerLogoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  drawerLogoutText: {
    flex: 1,
    marginLeft: 15,
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "900",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptySubtitle: {
    marginTop: 6,
    color: "#64748B",
  },
});
