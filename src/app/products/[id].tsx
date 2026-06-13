import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProductById } from "../../api/productsApi";
import { useAppStore } from "../../store/appStore";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode, isFavorite, toggleFavorite } = useAppStore();
  const theme = {
    background: isDarkMode ? "#0B1120" : "#F8FAFC",
    surface: isDarkMode ? "#111827" : "#FFFFFF",
    surfaceSoft: isDarkMode ? "#172033" : "#F1F5F9",
    text: isDarkMode ? "#F8FAFC" : "#0F172A",
    muted: isDarkMode ? "#94A3B8" : "#64748B",
    border: isDarkMode ? "#263244" : "#E2E8F0",
  };

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#0B63F6" />
        <Text style={[styles.centerText, { color: theme.muted }]}>
          Loading product...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle" size={44} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Product not found
        </Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(product.id);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            style={[
              styles.headerButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={23} color={theme.text} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Product Detail
          </Text>

          <Pressable
            style={[
              styles.headerButton,
              {
                backgroundColor: favorite ? "#FEE2E2" : theme.surface,
                borderColor: favorite ? "#FCA5A5" : theme.border,
              },
            ]}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={22}
              color={favorite ? "#EF4444" : theme.text}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.imageStage,
              { backgroundColor: theme.surfaceSoft },
            ]}
          >
            <Image source={product.image} style={styles.productImage} />
          </View>

          <View style={styles.heroMetaRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name="pricetag" size={15} color="#0B63F6" />
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>

            <View style={styles.ratingPill}>
              <Ionicons name="star" size={15} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: theme.text }]}>4.8</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={[styles.productTitle, { color: theme.text }]}>
            {product.title}
          </Text>
          <Text style={[styles.productDescription, { color: theme.muted }]}>
            {product.description}
          </Text>
        </View>

        <View
          style={[
            styles.infoGrid,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={22} color="#059669" />
            <Text style={[styles.infoLabel, { color: theme.text }]}>Warranty</Text>
            <Text style={[styles.infoValue, { color: theme.muted }]}>12 months</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Ionicons name="cube" size={22} color="#0B63F6" />
            <Text style={[styles.infoLabel, { color: theme.text }]}>Stock</Text>
            <Text style={[styles.infoValue, { color: theme.muted }]}>Available</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Ionicons name="car" size={22} color="#7C3AED" />
            <Text style={[styles.infoLabel, { color: theme.text }]}>Delivery</Text>
            <Text style={[styles.infoValue, { color: theme.muted }]}>2-4 days</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.priceLabel, { color: theme.muted }]}>Price</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>

        <Pressable style={styles.addButton}>
          <Ionicons name="cart" size={21} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },

  centerText: {
    fontSize: 15,
    fontWeight: "700",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "900",
  },

  retryButton: {
    borderRadius: 14,
    backgroundColor: "#0B63F6",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  header: {
    marginTop: 8,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },

  heroCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 14,
  },

  imageStage: {
    height: 300,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: "94%",
    height: "94%",
    resizeMode: "contain",
  },

  heroMetaRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  categoryBadgeText: {
    color: "#0B63F6",
    fontSize: 13,
    fontWeight: "900",
  },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "900",
  },

  detailBlock: {
    marginTop: 22,
  },

  productTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
  },

  productDescription: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
  },

  infoGrid: {
    marginTop: 22,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },

  infoDivider: {
    width: 1,
    height: 54,
    backgroundColor: "#E2E8F0",
  },

  infoLabel: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "900",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 88,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceLabel: {
    fontSize: 12,
    fontWeight: "800",
  },

  price: {
    marginTop: 3,
    color: "#0B63F6",
    fontSize: 25,
    fontWeight: "900",
  },

  addButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#0B63F6",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
