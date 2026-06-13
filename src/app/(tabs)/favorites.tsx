import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { products } from "../../data/products";
import { useAppStore } from "../../store/appStore";

export default function FavoritesScreen() {
  const { favoriteIds, isDarkMode, toggleFavorite } = useAppStore();
  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(product.id),
  );
  const theme = {
    background: isDarkMode ? "#0B1120" : "#F8FAFC",
    surface: isDarkMode ? "#111827" : "#FFFFFF",
    surfaceSoft: isDarkMode ? "#172033" : "#F1F5F9",
    text: isDarkMode ? "#F8FAFC" : "#0F172A",
    muted: isDarkMode ? "#94A3B8" : "#64748B",
    border: isDarkMode ? "#263244" : "#E2E8F0",
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {favoriteProducts.length} saved products
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: isDarkMode ? "#1E293B" : "#EAF3FF" },
              ]}
            >
              <Ionicons name="heart" size={34} color="#0B63F6" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No favorites yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Tap the heart icon on any product to save it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.favoriteCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() =>
              router.push({
                pathname: "/products/[id]",
                params: { id: item.id },
              })
            }
          >
            <View
              style={[
                styles.imageBox,
                { backgroundColor: theme.surfaceSoft },
              ]}
            >
              <Image source={item.image} style={styles.productImage} />
            </View>

            <View style={styles.cardCopy}>
              <Text style={[styles.productTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.productDescription, { color: theme.muted }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.productPrice}>${item.price}</Text>
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={(event) => {
                event.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              <Ionicons name="heart" size={21} color="#EF4444" />
            </Pressable>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 28,
  },

  header: {
    marginTop: 8,
    marginBottom: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
  },

  favoriteCard: {
    minHeight: 128,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  imageBox: {
    width: 104,
    height: 104,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productImage: {
    width: "96%",
    height: "96%",
    resizeMode: "contain",
  },

  cardCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    paddingRight: 8,
  },

  productTitle: {
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },

  productDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  productPrice: {
    marginTop: 9,
    color: "#0B63F6",
    fontSize: 17,
    fontWeight: "900",
  },

  removeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyBox: {
    alignItems: "center",
    paddingTop: 110,
    paddingHorizontal: 24,
  },

  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "600",
  },
});
