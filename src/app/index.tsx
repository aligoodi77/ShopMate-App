import { fetchProducts } from "@/api/productsApi";
import { searchProducts } from "@/utils/searchProducts";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { products } from "@/data/products";
export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error occurred</Text>
      </View>
    );
  }
  const searchedProducts = useMemo(
    () => searchProducts(data, search),
    [data, search],
  );

  function addToCart(products: any) {
    setToastMessage("Added to cart!");
    setTimeout(() => setToastMessage(""), 2000);
  }

  return (
    <View style={styles.screen}>
      <TextInput
        placeholder="Search products..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={searchedProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/products/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => addToCart(item)}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </Pressable>
            </Pressable>
          </Link>
        )}
      />
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  image: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },

  description: {
    color: "#6b7280",
    marginTop: 6,
  },

  price: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
  },
});
