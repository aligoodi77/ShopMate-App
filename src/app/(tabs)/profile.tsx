import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createProduct,
  fetchProducts,
  ProductInput,
  updateProduct,
  uploadProductImage,
} from "../../api/productsApi";
import {
  products as fallbackProducts,
  Product,
  ProductCategory,
} from "../../data/products";
import { logoutUser, updatePassword } from "../../lib/auth";
import { updateMyProfile, uploadMyProfileAvatar } from "../../lib/profile";
import { CartItem, useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { colors, radius, spacing } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;
type UserSectionId = "orders" | "wishlist" | "shipping" | "payments";
type AdminSectionId = "products" | "orders" | "customers" | "reports";

type ProfileMenuItemType<T extends string> = {
  id: T;
  title: string;
  subtitle: string;
  icon: IconName;
};

type ProfileTheme = {
  background: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  muted: string;
  border: string;
  iconSurface: string;
  inputSurface: string;
  userBadgeSurface: string;
  adminBadgeSurface: string;
  adminBadgeText: string;
  dangerSurface: string;
  adminHero: string;
};

type UserOrder = {
  id: string;
  title: string;
  quantity: number;
  total: number;
  status: string;
  date: string;
};

type AdminOrder = UserOrder & {
  customer: string;
};

type CustomerRecord = {
  name: string;
  email: string;
  orders: number;
  total: number;
  role: string;
};

type SalesPoint = {
  label: string;
  revenue: number;
};

type ProductFormState = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: ProductCategory;
  stock: string;
  isTrending: boolean;
};

const productCategories: ProductCategory[] = [
  "Laptops",
  "Phones",
  "Audio",
  "Gaming",
  "Keyboards",
  "Printers",
];

const emptyProductForm: ProductFormState = {
  title: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "Laptops",
  stock: "12",
  isTrending: false,
};

const userMenuItems: ProfileMenuItemType<UserSectionId>[] = [
  {
    id: "orders",
    title: "My Orders",
    subtitle: "Products currently in your cart",
    icon: "receipt-outline",
  },
  {
    id: "wishlist",
    title: "Wishlist",
    subtitle: "Products you saved for later",
    icon: "heart-outline",
  },
  {
    id: "shipping",
    title: "Shipping Address",
    subtitle: "Manage your delivery address",
    icon: "location-outline",
  },
  {
    id: "payments",
    title: "Payment Methods",
    subtitle: "Cards and checkout settings",
    icon: "card-outline",
  },
];

const adminMenuItems: ProfileMenuItemType<AdminSectionId>[] = [
  {
    id: "products",
    title: "Manage Products",
    subtitle: "Add new products or edit existing ones",
    icon: "cube-outline",
  },
  {
    id: "orders",
    title: "Orders Management",
    subtitle: "Review customer orders and status",
    icon: "bag-check-outline",
  },
  {
    id: "customers",
    title: "Customers",
    subtitle: "Manage users and permissions",
    icon: "people-outline",
  },
  {
    id: "reports",
    title: "Sales Reports",
    subtitle: "Track revenue with a chart",
    icon: "stats-chart-outline",
  },
];

export default function ProfileScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();
  const {
    favoriteIds,
    cartItems,
    isDarkMode,
    setIsDarkMode,
    getTotalCount,
    getTotalPrice,
  } = useAppStore();
  const {
    session,
    profile,
    isLoading: isAuthLoading,
    refreshProfile,
  } = useAuthStore();

  const [detailTop, setDetailTop] = useState(0);
  const [activeUserSection, setActiveUserSection] =
    useState<UserSectionId>("orders");
  const [activeAdminSection, setActiveAdminSection] =
    useState<AdminSectionId>("products");
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editAvatarAsset, setEditAvatarAsset] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shippingAddress, setShippingAddress] = useState(
    "No. 12, Valiasr Street, Tehran",
  );
  const [paymentMethod, setPaymentMethod] = useState("Visa ending 4242");
  const [productForm, setProductForm] =
    useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const theme = useMemo(() => createProfileTheme(isDarkMode), [isDarkMode]);
  const displayName =
    profile?.full_name?.trim() ||
    getMetadataString(session?.user.user_metadata, "full_name") ||
    getMetadataString(session?.user.user_metadata, "name") ||
    session?.user.email?.split("@")[0] ||
    "Guest User";
  const displayEmail = profile?.email?.trim() || session?.user.email || "";
  const displayAvatarUrl =
    profile?.avatar_url?.trim() ||
    getMetadataString(session?.user.user_metadata, "avatar_url") ||
    getMetadataString(session?.user.user_metadata, "picture") ||
    "";
  const isAdmin = profile?.role === "admin";
  const cartCount = getTotalCount();
  const totalPrice = getTotalPrice();

  const {
    data: remoteProducts = [],
    isLoading: isCatalogLoading,
    isError: isCatalogError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: Boolean(session),
  });

  const catalogProducts = remoteProducts.length > 0 ? remoteProducts : fallbackProducts;
  const userOrders = useMemo(() => buildUserOrders(cartItems), [cartItems]);
  const favoriteProducts = useMemo(
    () => catalogProducts.filter((product) => favoriteIds.includes(product.id)),
    [catalogProducts, favoriteIds],
  );
  const adminOrders = useMemo(
    () => buildAdminOrders(userOrders, catalogProducts, displayName),
    [catalogProducts, displayName, userOrders],
  );
  const customers = useMemo(
    () =>
      buildCustomers({
        displayName,
        displayEmail,
        isAdmin,
        orderCount: userOrders.length,
        totalPrice,
        catalogProducts,
      }),
    [catalogProducts, displayEmail, displayName, isAdmin, totalPrice, userOrders.length],
  );
  const salesReport = useMemo(
    () => buildSalesReport(catalogProducts, totalPrice),
    [catalogProducts, totalPrice],
  );

  function scrollToDetail() {
    if (detailTop <= 0) {
      return;
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(detailTop - spacing.sm, 0),
        animated: true,
      });
    });
  }

  function handleUserSectionPress(section: UserSectionId) {
    setActiveUserSection(section);
    scrollToDetail();
  }

  function handleAdminSectionPress(section: AdminSectionId) {
    setActiveAdminSection(section);
    scrollToDetail();
  }

  function handleOpenEdit() {
    setEditFullName(displayName === "Guest User" ? "" : displayName);
    setEditEmail(displayEmail);
    setEditAvatarUrl(displayAvatarUrl);
    setEditAvatarAsset(null);
    setIsEditVisible(true);
  }

  function handleCloseEdit() {
    if (!isSavingProfile) {
      setIsEditVisible(false);
    }
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access required",
        "Please allow photo library access to upload a profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0]?.uri;

      if (pickedUri) {
        setEditAvatarAsset(result.assets[0]);
        setEditAvatarUrl(pickedUri);
      }
    }
  }

  async function handleSaveProfile() {
    const fullName = editFullName.trim();
    const email = editEmail.trim();

    if (!fullName) {
      Alert.alert("Full name required", "Please enter your full name.");
      return;
    }

    if (!email || !email.includes("@")) {
      Alert.alert("Valid email required", "Please enter a valid email address.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const savedAvatarUrl = editAvatarAsset
        ? await uploadMyProfileAvatar({
            uri: editAvatarAsset.uri,
            mimeType: editAvatarAsset.mimeType,
            fileName: editAvatarAsset.fileName,
          })
        : editAvatarUrl.trim();

      await updateMyProfile({
        fullName,
        email,
        avatarUrl: savedAvatarUrl || null,
      });
      await refreshProfile();
      setEditAvatarAsset(null);
      setIsEditVisible(false);
      Alert.alert("Profile updated", "Your profile changes were saved.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update profile.";

      Alert.alert("Profile error", message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSavePassword() {
    if (newPassword.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "Password confirmation does not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordVisible(false);
      Alert.alert("Password updated", "Your password has been changed.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update password.";

      Alert.alert("Password error", message);
    } finally {
      setIsSavingPassword(false);
    }
  }

  function setProductField<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetProductForm() {
    setProductForm(emptyProductForm);
    setEditingProductId(null);
  }

  function handleEditProduct(product: Product) {
    setProductForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      imageUrl: getProductImageUri(product),
      category: product.category,
      stock: "12",
      isTrending: Boolean(product.isTrending),
    });
    setEditingProductId(product.id);
    setActiveAdminSection("products");
    scrollToDetail();
  }

  async function handleSaveProduct() {
    const input = buildProductInput(productForm);

    if (!input) {
      Alert.alert(
        "Product fields required",
        "Please complete title, description, image URL, price, and stock.",
      );
      return;
    }

    try {
      setIsSavingProduct(true);

      if (editingProductId) {
        await updateProduct(editingProductId, input);
      } else {
        await createProduct(input);
      }

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      resetProductForm();
      Alert.alert("Product saved", "Product catalog has been updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save product.";

      Alert.alert("Product error", message);
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handlePickProductImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo access required",
        "Please allow photo library access to upload a product image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.86,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.uri) {
      return;
    }

    try {
      setIsUploadingProductImage(true);
      const imageUrl = await uploadProductImage({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      });

      setProductField("imageUrl", imageUrl);
      Alert.alert("Image uploaded", "Product image URL is ready to save.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not upload image.";

      Alert.alert("Upload error", message);
    } finally {
      setIsUploadingProductImage(false);
    }
  }

  async function performLogout() {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not log out.";

      Alert.alert("Logout error", message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");

      if (confirmed) {
        void performLogout();
      }

      return;
    }

    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  }

  if (isAuthLoading) {
    return (
      <SafeAreaView
        style={[styles.centerScreen, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.centerText, { color: theme.muted }]}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView
        style={[styles.centerScreen, { backgroundColor: theme.background }]}
      >
        <View style={[styles.authCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.authIcon, { backgroundColor: theme.iconSurface }]}>
            <Ionicons name="person-circle" size={42} color={colors.primary} />
          </View>
          <Text style={[styles.authTitle, { color: theme.text }]}>
            Login required
          </Text>
          <Text style={[styles.authText, { color: theme.muted }]}>
            Log in to manage your ShopMate profile and dashboard.
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.pageTitle, { color: theme.text }]}>
              Profile
            </Text>
            <Text style={[styles.pageSubtitle, { color: theme.muted }]}>
              {isAdmin
                ? "Manage your ShopMate dashboard"
                : "Manage your shopping account"}
            </Text>
          </View>

          <Pressable
            style={[
              styles.notificationButton,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.text}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <ProfileAvatar avatarUrl={displayAvatarUrl} name={displayName} />

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {displayName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.muted }]}>
              {displayEmail || "No email"}
            </Text>

            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isAdmin
                    ? theme.adminBadgeSurface
                    : theme.userBadgeSurface,
                },
              ]}
            >
              <Ionicons
                name={isAdmin ? "shield-checkmark" : "person"}
                size={14}
                color={isAdmin ? theme.adminBadgeText : colors.primary}
              />

              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isAdmin ? theme.adminBadgeText : colors.primary },
                ]}
              >
                {isAdmin ? "Admin Panel" : "User Panel"}
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.editButton,
              { backgroundColor: theme.iconSurface },
            ]}
            onPress={handleOpenEdit}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {isAdmin ? (
          <AdminPanel
            productCount={catalogProducts.length}
            orderCount={adminOrders.length}
            revenue={salesReport.reduce((sum, point) => sum + point.revenue, 0)}
            activeSection={activeAdminSection}
            theme={theme}
            onSelect={handleAdminSectionPress}
          />
        ) : (
          <UserPanel
            orderCount={userOrders.length}
            favoriteCount={favoriteProducts.length}
            cartCount={cartCount}
            cartItemsCount={cartItems.length}
            activeSection={activeUserSection}
            theme={theme}
            onSelect={handleUserSectionPress}
          />
        )}

        <View
          onLayout={(event) => setDetailTop(event.nativeEvent.layout.y)}
          style={styles.detailAnchor}
        >
          {isAdmin ? (
            <AdminDetailSection
              activeSection={activeAdminSection}
              theme={theme}
              products={catalogProducts}
              isCatalogLoading={isCatalogLoading}
              isCatalogError={isCatalogError}
              productForm={productForm}
              editingProductId={editingProductId}
              isSavingProduct={isSavingProduct}
              isUploadingProductImage={isUploadingProductImage}
              adminOrders={adminOrders}
              customers={customers}
              salesReport={salesReport}
              onChangeProductField={setProductField}
              onPickProductImage={handlePickProductImage}
              onSaveProduct={handleSaveProduct}
              onResetProduct={resetProductForm}
              onEditProduct={handleEditProduct}
            />
          ) : (
            <UserDetailSection
              activeSection={activeUserSection}
              theme={theme}
              orders={userOrders}
              favoriteProducts={favoriteProducts}
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              onChangeShippingAddress={setShippingAddress}
              onChangePaymentMethod={setPaymentMethod}
            />
          )}
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Settings
          </Text>

          <View style={styles.settingRow}>
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.iconSurface },
              ]}
            >
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
            </View>

            <View style={styles.menuTextWrapper}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
                Change app appearance mode
              </Text>
            </View>

            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#CBD5E1", true: "#60A5FA" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Pressable
            style={[styles.menuItem, { borderTopColor: theme.border }]}
            onPress={() => setIsPasswordVisible(true)}
          >
            <View
              style={[
                styles.menuIcon,
                { backgroundColor: theme.iconSurface },
              ]}
            >
              <Ionicons
                name="key-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.menuTextWrapper}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                Password Recovery
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
                Update your account password
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.logoutButton,
            { backgroundColor: theme.dangerSurface },
            isLoggingOut && styles.disabledButton,
          ]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <EditProfileModal
        visible={isEditVisible}
        theme={theme}
        fullName={editFullName}
        email={editEmail}
        avatarUrl={editAvatarUrl}
        isSaving={isSavingProfile}
        onChangeFullName={setEditFullName}
        onChangeEmail={setEditEmail}
        onPickAvatar={handlePickAvatar}
        onClose={handleCloseEdit}
        onSave={handleSaveProfile}
      />

      <PasswordModal
        visible={isPasswordVisible}
        theme={theme}
        password={newPassword}
        confirmPassword={confirmPassword}
        isSaving={isSavingPassword}
        onChangePassword={setNewPassword}
        onChangeConfirmPassword={setConfirmPassword}
        onClose={() => setIsPasswordVisible(false)}
        onSave={handleSavePassword}
      />
    </SafeAreaView>
  );
}

function UserPanel({
  orderCount,
  favoriteCount,
  cartCount,
  cartItemsCount,
  activeSection,
  theme,
  onSelect,
}: {
  orderCount: number;
  favoriteCount: number;
  cartCount: number;
  cartItemsCount: number;
  activeSection: UserSectionId;
  theme: ProfileTheme;
  onSelect: (section: UserSectionId) => void;
}) {
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard
          title="Orders"
          value={String(orderCount)}
          icon="receipt-outline"
          theme={theme}
        />
        <StatCard
          title="Favorites"
          value={String(favoriteCount)}
          icon="heart-outline"
          theme={theme}
        />
        <StatCard
          title="Cart Qty"
          value={String(cartCount)}
          icon="cart-outline"
          theme={theme}
        />
      </View>

      <View style={styles.userHeroCard}>
        <View>
          <Text style={styles.heroSmallText}>Shopping Summary</Text>
          <Text style={styles.heroTitle}>
            You have {cartItemsCount} product type in cart
          </Text>
        </View>

        <View style={styles.heroIconBox}>
          <Ionicons name="bag-handle" size={26} color="#fff" />
        </View>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          User Panel
        </Text>

        {userMenuItems.map((item) => (
          <ProfileMenuItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            theme={theme}
            onPress={() => onSelect(item.id)}
          />
        ))}
      </View>
    </>
  );
}

function AdminPanel({
  productCount,
  orderCount,
  revenue,
  activeSection,
  theme,
  onSelect,
}: {
  productCount: number;
  orderCount: number;
  revenue: number;
  activeSection: AdminSectionId;
  theme: ProfileTheme;
  onSelect: (section: AdminSectionId) => void;
}) {
  return (
    <>
      <View style={[styles.adminHeroCard, { backgroundColor: theme.adminHero }]}>
        <View style={styles.adminHeroContent}>
          <Text style={styles.adminHeroLabel}>Admin Dashboard</Text>
          <Text style={styles.adminHeroTitle}>Store overview</Text>
          <Text style={styles.adminHeroSubtitle}>
            Check products, orders, customers, and sales reports.
          </Text>
        </View>

        <View style={styles.adminHeroIcon}>
          <Ionicons name="analytics" size={28} color="#fff" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Products"
          value={String(productCount)}
          icon="cube-outline"
          theme={theme}
        />
        <StatCard
          title="Orders"
          value={String(orderCount)}
          icon="bag-check-outline"
          theme={theme}
        />
        <StatCard
          title="Revenue"
          value={`$${revenue.toFixed(0)}`}
          icon="cash-outline"
          theme={theme}
        />
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Admin Panel
        </Text>

        {adminMenuItems.map((item) => (
          <ProfileMenuItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            theme={theme}
            onPress={() => onSelect(item.id)}
          />
        ))}
      </View>
    </>
  );
}

function UserDetailSection({
  activeSection,
  theme,
  orders,
  favoriteProducts,
  shippingAddress,
  paymentMethod,
  onChangeShippingAddress,
  onChangePaymentMethod,
}: {
  activeSection: UserSectionId;
  theme: ProfileTheme;
  orders: UserOrder[];
  favoriteProducts: Product[];
  shippingAddress: string;
  paymentMethod: string;
  onChangeShippingAddress: (value: string) => void;
  onChangePaymentMethod: (value: string) => void;
}) {
  if (activeSection === "orders") {
    return (
      <DetailCard title="My Orders" theme={theme}>
        {orders.length === 0 ? (
          <EmptyPanel
            icon="cart-outline"
            title="No cart orders yet"
            text="Add products to your cart and they will show up here."
            theme={theme}
          />
        ) : (
          orders.map((order) => (
            <OrderRow key={order.id} order={order} theme={theme} />
          ))
        )}
      </DetailCard>
    );
  }

  if (activeSection === "wishlist") {
    return (
      <DetailCard title="Wishlist" theme={theme}>
        {favoriteProducts.length === 0 ? (
          <EmptyPanel
            icon="heart-outline"
            title="No favorite products"
            text="Tap heart on products to save them for later."
            theme={theme}
          />
        ) : (
          favoriteProducts.map((product) => (
            <ProductSummaryRow
              key={product.id}
              product={product}
              theme={theme}
              actionLabel="View"
              onPress={() =>
                router.push({
                  pathname: "/products/[id]",
                  params: { id: product.id },
                })
              }
            />
          ))
        )}
      </DetailCard>
    );
  }

  if (activeSection === "shipping") {
    return (
      <DetailCard title="Shipping Address" theme={theme}>
        <TextInput
          value={shippingAddress}
          onChangeText={onChangeShippingAddress}
          multiline
          placeholder="Enter shipping address"
          placeholderTextColor={theme.muted}
          style={[
            styles.largeInput,
            {
              backgroundColor: theme.inputSurface,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
        <Pressable
          style={styles.compactPrimaryButton}
          onPress={() => Alert.alert("Saved", "Shipping address updated.")}
        >
          <Text style={styles.compactPrimaryText}>Save Address</Text>
        </Pressable>
      </DetailCard>
    );
  }

  return (
    <DetailCard title="Payment Methods" theme={theme}>
      <TextInput
        value={paymentMethod}
        onChangeText={onChangePaymentMethod}
        placeholder="Card or payment label"
        placeholderTextColor={theme.muted}
        style={[
          styles.singleInput,
          {
            backgroundColor: theme.inputSurface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
      <View style={[styles.paymentPreview, { borderColor: theme.border }]}>
        <Ionicons name="card" size={26} color={colors.primary} />
        <View style={styles.menuTextWrapper}>
          <Text style={[styles.menuTitle, { color: theme.text }]}>
            {paymentMethod || "No payment method"}
          </Text>
          <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
            Default checkout payment
          </Text>
        </View>
      </View>
    </DetailCard>
  );
}

function AdminDetailSection({
  activeSection,
  theme,
  products,
  isCatalogLoading,
  isCatalogError,
  productForm,
  editingProductId,
  isSavingProduct,
  isUploadingProductImage,
  adminOrders,
  customers,
  salesReport,
  onChangeProductField,
  onPickProductImage,
  onSaveProduct,
  onResetProduct,
  onEditProduct,
}: {
  activeSection: AdminSectionId;
  theme: ProfileTheme;
  products: Product[];
  isCatalogLoading: boolean;
  isCatalogError: boolean;
  productForm: ProductFormState;
  editingProductId: string | null;
  isSavingProduct: boolean;
  isUploadingProductImage: boolean;
  adminOrders: AdminOrder[];
  customers: CustomerRecord[];
  salesReport: SalesPoint[];
  onChangeProductField: <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) => void;
  onPickProductImage: () => void;
  onSaveProduct: () => void;
  onResetProduct: () => void;
  onEditProduct: (product: Product) => void;
}) {
  if (activeSection === "products") {
    return (
      <ProductManager
        products={products}
        isLoading={isCatalogLoading}
        isError={isCatalogError}
        form={productForm}
        editingProductId={editingProductId}
        isSaving={isSavingProduct}
        isUploadingImage={isUploadingProductImage}
        theme={theme}
        onChangeField={onChangeProductField}
        onPickImage={onPickProductImage}
        onSave={onSaveProduct}
        onReset={onResetProduct}
        onEdit={onEditProduct}
      />
    );
  }

  if (activeSection === "orders") {
    return (
      <DetailCard title="Orders Management" theme={theme}>
        {adminOrders.map((order) => (
          <View
            key={order.id}
            style={[styles.adminOrderRow, { borderColor: theme.border }]}
          >
            <View style={styles.adminOrderCopy}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                {order.id} - {order.customer}
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
                {order.title} x {order.quantity}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.productPriceText}>{formatPrice(order.total)}</Text>
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {order.status}
              </Text>
            </View>
          </View>
        ))}
      </DetailCard>
    );
  }

  if (activeSection === "customers") {
    return (
      <DetailCard title="Customer Management" theme={theme}>
        {customers.map((customer) => (
          <View
            key={customer.email}
            style={[styles.customerRow, { borderColor: theme.border }]}
          >
            <View style={[styles.customerAvatar, { backgroundColor: theme.iconSurface }]}>
              <Text style={styles.customerAvatarText}>
                {getInitials(customer.name)}
              </Text>
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                {customer.name}
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
                {customer.email}
              </Text>
              <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
                {customer.orders} orders - {formatPrice(customer.total)}
              </Text>
            </View>
            <View style={[styles.rolePill, { backgroundColor: theme.iconSurface }]}>
              <Text style={styles.rolePillText}>{customer.role}</Text>
            </View>
          </View>
        ))}
      </DetailCard>
    );
  }

  return (
    <DetailCard title="Sales Reports" theme={theme}>
      <SalesChart data={salesReport} theme={theme} />
    </DetailCard>
  );
}

function ProductManager({
  products,
  isLoading,
  isError,
  form,
  editingProductId,
  isSaving,
  isUploadingImage,
  theme,
  onChangeField,
  onPickImage,
  onSave,
  onReset,
  onEdit,
}: {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  form: ProductFormState;
  editingProductId: string | null;
  isSaving: boolean;
  isUploadingImage: boolean;
  theme: ProfileTheme;
  onChangeField: <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) => void;
  onPickImage: () => void;
  onSave: () => void;
  onReset: () => void;
  onEdit: (product: Product) => void;
}) {
  return (
    <DetailCard
      title={editingProductId ? "Edit Product" : "Manage Products"}
      theme={theme}
    >
      <TextInput
        value={form.title}
        onChangeText={(value) => onChangeField("title", value)}
        placeholder="Product title"
        placeholderTextColor={theme.muted}
        style={[
          styles.singleInput,
          {
            backgroundColor: theme.inputSurface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
      <TextInput
        value={form.description}
        onChangeText={(value) => onChangeField("description", value)}
        placeholder="Description"
        placeholderTextColor={theme.muted}
        multiline
        style={[
          styles.largeInput,
          {
            backgroundColor: theme.inputSurface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
      <View style={styles.formRow}>
        <TextInput
          value={form.price}
          onChangeText={(value) => onChangeField("price", value)}
          placeholder="Price"
          placeholderTextColor={theme.muted}
          keyboardType="decimal-pad"
          style={[
            styles.formHalfInput,
            {
              backgroundColor: theme.inputSurface,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
        <TextInput
          value={form.stock}
          onChangeText={(value) => onChangeField("stock", value)}
          placeholder="Stock"
          placeholderTextColor={theme.muted}
          keyboardType="number-pad"
          style={[
            styles.formHalfInput,
            {
              backgroundColor: theme.inputSurface,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
      </View>
      <TextInput
        value={form.imageUrl}
        onChangeText={(value) => onChangeField("imageUrl", value)}
        placeholder="Image URL"
        placeholderTextColor={theme.muted}
        autoCapitalize="none"
        style={[
          styles.singleInput,
          {
            backgroundColor: theme.inputSurface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
      <Pressable
        style={[
          styles.uploadProductImageButton,
          { borderColor: theme.border },
          (isSaving || isUploadingImage) && styles.disabledButton,
        ]}
        onPress={onPickImage}
        disabled={isSaving || isUploadingImage}
      >
        {isUploadingImage ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.uploadButtonText, { color: theme.text }]}>
              Upload Product Image
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.categoryWrap}>
        {productCategories.map((category) => {
          const active = form.category === category;

          return (
            <Pressable
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: active ? colors.primary : theme.inputSurface,
                  borderColor: active ? colors.primary : theme.border,
                },
              ]}
              onPress={() => onChangeField("category", category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: active ? "#FFFFFF" : theme.text },
                ]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.checkboxRow}
        onPress={() => onChangeField("isTrending", !form.isTrending)}
      >
        <Ionicons
          name={form.isTrending ? "checkbox" : "square-outline"}
          size={22}
          color={colors.primary}
        />
        <Text style={[styles.menuTitle, { color: theme.text }]}>
          Mark as trending
        </Text>
      </Pressable>

      <View style={styles.modalActions}>
        <Pressable
          style={[
            styles.cancelButton,
            { borderColor: theme.border },
            isSaving && styles.disabledButton,
          ]}
          onPress={onReset}
          disabled={isSaving}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>
            Clear
          </Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {editingProductId ? "Update" : "Add Product"}
            </Text>
          )}
        </Pressable>
      </View>

      <Text style={[styles.subsectionTitle, { color: theme.text }]}>
        Existing Products
      </Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}
      {isError ? (
        <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
          Showing local fallback products because catalog could not be loaded.
        </Text>
      ) : null}
      {products.slice(0, 8).map((product) => (
        <ProductSummaryRow
          key={product.id}
          product={product}
          theme={theme}
          actionLabel="Edit"
          onPress={() => onEdit(product)}
        />
      ))}
    </DetailCard>
  );
}

function StatCard({
  title,
  value,
  icon,
  theme,
}: {
  title: string;
  value: string;
  icon: IconName;
  theme: ProfileTheme;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: theme.iconSurface }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>

      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.muted }]}>{title}</Text>
    </View>
  );
}

function ProfileMenuItem<T extends string>({
  item,
  active,
  theme,
  onPress,
}: {
  item: ProfileMenuItemType<T>;
  active: boolean;
  theme: ProfileTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.menuItem,
        {
          borderTopColor: theme.border,
          backgroundColor: active ? theme.surfaceSoft : "transparent",
        },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: theme.iconSurface }]}>
        <Ionicons name={item.icon} size={22} color={colors.primary} />
      </View>

      <View style={styles.menuTextWrapper}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
          {item.subtitle}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
  );
}

function ProfileAvatar({
  avatarUrl,
  name,
  size = 72,
}: {
  avatarUrl: string;
  name: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      )}
    </View>
  );
}

function DetailCard({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ProfileTheme;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyPanel({
  icon,
  title,
  text,
  theme,
}: {
  icon: IconName;
  title: string;
  text: string;
  theme: ProfileTheme;
}) {
  return (
    <View style={styles.emptyPanel}>
      <View style={[styles.emptyPanelIcon, { backgroundColor: theme.iconSurface }]}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.emptyPanelTitle, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptyPanelText, { color: theme.muted }]}>
        {text}
      </Text>
    </View>
  );
}

function OrderRow({ order, theme }: { order: UserOrder; theme: ProfileTheme }) {
  return (
    <View style={[styles.orderRow, { borderColor: theme.border }]}>
      <View style={styles.menuTextWrapper}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>
          {order.title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
          {order.id} - {order.date} - x{order.quantity}
        </Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.productPriceText}>{formatPrice(order.total)}</Text>
        <Text style={[styles.statusText, { color: colors.primary }]}>
          {order.status}
        </Text>
      </View>
    </View>
  );
}

function ProductSummaryRow({
  product,
  theme,
  actionLabel,
  onPress,
}: {
  product: Product;
  theme: ProfileTheme;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={[styles.productRow, { borderColor: theme.border }]}>
      <View style={[styles.productThumb, { backgroundColor: theme.surfaceSoft }]}>
        <Image source={product.image} style={styles.productThumbImage} />
      </View>
      <View style={styles.menuTextWrapper}>
        <Text style={[styles.menuTitle, { color: theme.text }]} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
          {product.category} - {formatPrice(product.price)}
        </Text>
      </View>
      <Pressable style={styles.smallActionButton} onPress={onPress}>
        <Text style={styles.smallActionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function SalesChart({
  data,
  theme,
}: {
  data: SalesPoint[];
  theme: ProfileTheme;
}) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);

  return (
    <View>
      <View style={styles.chartHeader}>
        <View>
          <Text style={[styles.chartValue, { color: theme.text }]}>
            {formatPrice(data.reduce((sum, point) => sum + point.revenue, 0))}
          </Text>
          <Text style={[styles.menuSubtitle, { color: theme.muted }]}>
            Last 6 months revenue
          </Text>
        </View>
        <View style={[styles.rolePill, { backgroundColor: theme.iconSurface }]}>
          <Text style={styles.rolePillText}>+18%</Text>
        </View>
      </View>
      <View style={[styles.chartBox, { borderColor: theme.border }]}>
        {data.map((point) => (
          <View key={point.label} style={styles.chartColumn}>
            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: Math.max((point.revenue / maxRevenue) * 116, 20),
                  },
                ]}
              />
            </View>
            <Text style={[styles.chartLabel, { color: theme.muted }]}>
              {point.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EditProfileModal({
  visible,
  theme,
  fullName,
  email,
  avatarUrl,
  isSaving,
  onChangeFullName,
  onChangeEmail,
  onPickAvatar,
  onClose,
  onSave,
}: {
  visible: boolean;
  theme: ProfileTheme;
  fullName: string;
  email: string;
  avatarUrl: string;
  isSaving: boolean;
  onChangeFullName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onPickAvatar: () => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View
          style={[
            styles.editModal,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Edit Profile
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                  Update your display information
                </Text>
              </View>

              <Pressable
                style={[
                  styles.modalCloseButton,
                  { backgroundColor: theme.surfaceSoft },
                ]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.avatarUploadRow}>
              <ProfileAvatar avatarUrl={avatarUrl} name={fullName || "User"} />
              <Pressable
                style={[styles.uploadButton, { borderColor: theme.border }]}
                onPress={onPickAvatar}
                disabled={isSaving}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                <Text style={[styles.uploadButtonText, { color: theme.text }]}>
                  Upload Image
                </Text>
              </Pressable>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>
                Full Name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={onChangeFullName}
                placeholder="Ali Goudarzi"
                placeholderTextColor={theme.muted}
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.inputSurface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={onChangeEmail}
                placeholder="ali@example.com"
                placeholderTextColor={theme.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.inputSurface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.cancelButton,
                  { borderColor: theme.border },
                  isSaving && styles.disabledButton,
                ]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PasswordModal({
  visible,
  theme,
  password,
  confirmPassword,
  isSaving,
  onChangePassword,
  onChangeConfirmPassword,
  onClose,
  onSave,
}: {
  visible: boolean;
  theme: ProfileTheme;
  password: string;
  confirmPassword: string;
  isSaving: boolean;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View
          style={[
            styles.editModal,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Password Recovery
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                Set a new password for your account
              </Text>
            </View>

            <Pressable
              style={[
                styles.modalCloseButton,
                { backgroundColor: theme.surfaceSoft },
              ]}
              onPress={onClose}
              disabled={isSaving}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.modalField}>
            <Text style={[styles.modalLabel, { color: theme.text }]}>
              New Password
            </Text>
            <TextInput
              value={password}
              onChangeText={onChangePassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={theme.muted}
              secureTextEntry
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.inputSurface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>

          <View style={styles.modalField}>
            <Text style={[styles.modalLabel, { color: theme.text }]}>
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={onChangeConfirmPassword}
              placeholder="Repeat new password"
              placeholderTextColor={theme.muted}
              secureTextEntry
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.inputSurface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>

          <Pressable
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createProfileTheme(isDarkMode: boolean): ProfileTheme {
  return {
    background: isDarkMode ? "#0B1120" : "#F8FAFC",
    surface: isDarkMode ? "#111827" : "#FFFFFF",
    surfaceSoft: isDarkMode ? "#172033" : "#F1F5F9",
    text: isDarkMode ? "#F8FAFC" : "#0F172A",
    muted: isDarkMode ? "#94A3B8" : "#64748B",
    border: isDarkMode ? "#263244" : "#E2E8F0",
    iconSurface: isDarkMode ? "#1E3A5F" : "#EFF6FF",
    inputSurface: isDarkMode ? "#0B1120" : "#F8FAFC",
    userBadgeSurface: isDarkMode ? "#0F2B4D" : "#EFF6FF",
    adminBadgeSurface: isDarkMode ? "#3A2D0B" : "#FEF3C7",
    adminBadgeText: isDarkMode ? "#FBBF24" : "#92400E",
    dangerSurface: isDarkMode ? "#3F1D24" : "#FEF2F2",
    adminHero: isDarkMode ? "#172033" : "#0F172A",
  };
}

function buildUserOrders(cartItems: CartItem[]): UserOrder[] {
  return cartItems.map((item, index) => ({
    id: `ORD-${String(index + 1).padStart(3, "0")}`,
    title: item.product.title,
    quantity: item.quantity,
    total: item.product.price * item.quantity,
    status: "In Cart",
    date: "Today",
  }));
}

function buildAdminOrders(
  userOrders: UserOrder[],
  catalogProducts: Product[],
  customerName: string,
): AdminOrder[] {
  if (userOrders.length > 0) {
    return userOrders.map((order) => ({
      ...order,
      customer: customerName,
    }));
  }

  return catalogProducts.slice(0, 4).map((product, index) => ({
    id: `ORD-${String(index + 1).padStart(3, "0")}`,
    title: product.title,
    quantity: index + 1,
    total: product.price * (index + 1),
    status: index % 2 === 0 ? "Processing" : "Delivered",
    date: "This week",
    customer: ["Sarah Lee", "John Carter", "Mina Rose", "Ali Buyer"][index],
  }));
}

function buildCustomers({
  displayName,
  displayEmail,
  isAdmin,
  orderCount,
  totalPrice,
  catalogProducts,
}: {
  displayName: string;
  displayEmail: string;
  isAdmin: boolean;
  orderCount: number;
  totalPrice: number;
  catalogProducts: Product[];
}): CustomerRecord[] {
  const sampleTotal = catalogProducts
    .slice(0, 3)
    .reduce((sum, product) => sum + product.price, 0);

  return [
    {
      name: displayName,
      email: displayEmail || "user@shopmate.dev",
      orders: orderCount,
      total: totalPrice,
      role: isAdmin ? "Admin" : "User",
    },
    {
      name: "Sarah Lee",
      email: "sarah@shopmate.dev",
      orders: 5,
      total: sampleTotal,
      role: "User",
    },
    {
      name: "John Carter",
      email: "john@shopmate.dev",
      orders: 3,
      total: sampleTotal * 0.64,
      role: "User",
    },
  ];
}

function buildSalesReport(
  catalogProducts: Product[],
  cartTotal: number,
): SalesPoint[] {
  const catalogBase = catalogProducts
    .slice(0, 8)
    .reduce((sum, product) => sum + product.price, 0);
  const baseRevenue = Math.max(cartTotal, catalogBase / 4, 500);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return labels.map((label, index) => ({
    label,
    revenue: Math.round(baseRevenue * (0.62 + index * 0.11)),
  }));
}

function buildProductInput(form: ProductFormState): ProductInput | null {
  const title = form.title.trim();
  const description = form.description.trim();
  const imageUrl = form.imageUrl.trim();
  const price = Number(form.price);
  const stock = Number(form.stock);

  if (!title || !description || !imageUrl || !price || Number.isNaN(price)) {
    return null;
  }

  if (Number.isNaN(stock) || stock < 0) {
    return null;
  }

  return {
    title,
    description,
    imageUrl,
    price,
    category: form.category,
    stock,
    isTrending: form.isTrending,
  };
}

function getProductImageUri(product: Product) {
  const image = product.image;

  if (typeof image === "object" && image && "uri" in image) {
    return String(image.uri ?? "");
  }

  return "";
}

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value : null;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "U";
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  centerText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: "700",
  },

  authCard: {
    width: "100%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
  },

  authIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  authTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  authText: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "600",
  },

  loginButton: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: "900",
  },

  pageSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  profileCard: {
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    fontSize: 19,
    fontWeight: "900",
  },

  userEmail: {
    fontSize: 13,
    marginTop: 3,
  },

  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: spacing.sm,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
  },

  statTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  userHeroCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroSmallText: {
    color: "#DBEAFE",
    fontSize: 13,
    fontWeight: "700",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
    maxWidth: 220,
  },

  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  adminHeroCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  adminHeroContent: {
    flex: 1,
  },

  adminHeroLabel: {
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "800",
  },

  adminHeroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },

  adminHeroSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  adminHeroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.md,
  },

  detailAnchor: {
    marginTop: spacing.lg,
  },

  section: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },

  subsectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 16,
    fontWeight: "900",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderRadius: radius.md,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  menuTextWrapper: {
    flex: 1,
    marginLeft: spacing.md,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  menuSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  logoutButton: {
    height: 56,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "900",
  },

  emptyPanel: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },

  emptyPanelIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  emptyPanelTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  emptyPanelText: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    fontWeight: "600",
  },

  orderRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },

  orderRight: {
    alignItems: "flex-end",
    marginLeft: spacing.sm,
  },

  statusText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "900",
  },

  productPriceText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  productRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },

  productThumb: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  productThumbImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  smallActionButton: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  smallActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  paymentPreview: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  adminOrderRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },

  adminOrderCopy: {
    flex: 1,
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },

  customerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  customerAvatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  rolePill: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  rolePillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  chartValue: {
    fontSize: 24,
    fontWeight: "900",
  },

  chartBox: {
    height: 170,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  chartColumn: {
    alignItems: "center",
    flex: 1,
  },

  chartTrack: {
    height: 120,
    justifyContent: "flex-end",
  },

  chartBar: {
    width: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
  },

  chartLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
  },

  formRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  formHalfInput: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    marginBottom: spacing.md,
  },

  singleInput: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    marginBottom: spacing.md,
  },

  largeInput: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
    marginBottom: spacing.md,
  },

  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  categoryChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  categoryChipText: {
    fontSize: 12,
    fontWeight: "900",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  compactPrimaryButton: {
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  compactPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(15,23,42,0.62)",
  },

  editModal: {
    maxHeight: "90%",
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarUploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  uploadButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  uploadButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },

  uploadProductImageButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },

  modalField: {
    marginBottom: spacing.md,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },

  modalInput: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },

  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "900",
  },

  saveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.7,
  },
});
