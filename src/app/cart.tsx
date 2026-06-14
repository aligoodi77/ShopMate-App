import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../store/appStore";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function CartScreen() {
  const {
    cartItems,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalCount,
  } = useAppStore();

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </Pressable>

          <Text style={styles.headerTitle}>My Cart</Text>

          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.emptyBox}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cart-outline" size={54} color="#0B63F6" />
          </View>

          <Text style={styles.emptyTitle}>Your cart is empty</Text>

          <Text style={styles.emptySubtitle}>
            Start adding products and they will appear here.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{totalCount} items</Text>
        </View>

        <Pressable style={styles.clearButton} onPress={clearCart}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.imageBox}>
              <Image source={item.product.image} style={styles.image} />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.product.title}
              </Text>

              <Text style={styles.itemPrice}>
                {formatPrice(item.product.price)}
              </Text>

              <View style={styles.itemBottom}>
                <View style={styles.quantityBox}>
                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => decreaseQuantity(item.product.id)}
                  >
                    <Ionicons name="remove" size={18} color="#0F172A" />
                  </Pressable>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <Pressable
                    style={styles.quantityButton}
                    onPress={() => addToCart(item.product)}
                  >
                    <Ionicons name="add" size={18} color="#0F172A" />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.product.id)}
                >
                  <Ionicons name="trash-outline" size={19} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.freeText}>Free</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <Pressable
          style={styles.checkoutButton}
          onPress={() => console.log("checkout demo")}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonPlaceholder: {
    width: 44,
    height: 44,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  clearButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "900",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 14,
  },

  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  imageBox: {
    width: 104,
    height: 104,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: "#0F172A",
  },

  itemPrice: {
    marginTop: 7,
    fontSize: 17,
    fontWeight: "900",
    color: "#0B63F6",
  },

  itemBottom: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    padding: 4,
  },

  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    minWidth: 34,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },

  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },

  freeText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#22C55E",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0B63F6",
  },

  checkoutButton: {
    marginTop: 4,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B63F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0B63F6",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EAF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },

  emptySubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    textAlign: "center",
  },

  shopButton: {
    marginTop: 24,
    height: 56,
    paddingHorizontal: 30,
    borderRadius: 28,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
