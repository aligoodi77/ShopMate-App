import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { products } from "../../data/products";
import { useAppStore, UserRole } from "../../store/appStore";
import { colors, radius, spacing } from "../../theme";

type IconName = keyof typeof Ionicons.glyphMap;

type ProfileMenuItemType = {
  title: string;
  subtitle: string;
  icon: IconName;
};

const userMenuItems: ProfileMenuItemType[] = [
  {
    title: "My Orders",
    subtitle: "Track your orders and delivery status",
    icon: "receipt-outline",
  },
  {
    title: "Wishlist",
    subtitle: "Products you saved for later",
    icon: "heart-outline",
  },
  {
    title: "Shipping Address",
    subtitle: "Manage your delivery address",
    icon: "location-outline",
  },
  {
    title: "Payment Methods",
    subtitle: "Cards and checkout settings",
    icon: "card-outline",
  },
];

const adminMenuItems: ProfileMenuItemType[] = [
  {
    title: "Manage Products",
    subtitle: "Add, edit, and remove shop products",
    icon: "cube-outline",
  },
  {
    title: "Orders Management",
    subtitle: "Review customer orders and status",
    icon: "bag-check-outline",
  },
  {
    title: "Customers",
    subtitle: "Manage users and permissions",
    icon: "people-outline",
  },
  {
    title: "Sales Reports",
    subtitle: "View shop performance and analytics",
    icon: "stats-chart-outline",
  },
];

export default function ProfileScreen() {
  const {
    currentUser,
    favoriteIds,
    cartItems,
    isDarkMode,
    setIsDarkMode,
    setUserRole,
    getTotalCount,
    getTotalPrice,
  } = useAppStore();

  const isAdmin = currentUser.role === "admin";
  const cartCount = getTotalCount();
  const totalPrice = getTotalPrice();

  function handleRoleChange(role: UserRole) {
    setUserRole(role);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.pageTitle}>Profile</Text>
            <Text style={styles.pageSubtitle}>
              {isAdmin
                ? "Manage your ShopMate dashboard"
                : "Manage your shopping account"}
            </Text>
          </View>

          <Pressable style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(currentUser.fullName)}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{currentUser.fullName}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>

            <View style={[styles.roleBadge, isAdmin && styles.adminBadge]}>
              <Ionicons
                name={isAdmin ? "shield-checkmark" : "person"}
                size={14}
                color={isAdmin ? "#92400E" : colors.primary}
              />

              <Text
                style={[styles.roleBadgeText, isAdmin && styles.adminBadgeText]}
              >
                {isAdmin ? "Admin Panel" : "User Panel"}
              </Text>
            </View>
          </View>

          <Pressable style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.roleSwitcher}>
          <RoleButton
            title="User"
            icon="person-outline"
            active={currentUser.role === "user"}
            onPress={() => handleRoleChange("user")}
          />

          <RoleButton
            title="Admin"
            icon="shield-outline"
            active={currentUser.role === "admin"}
            onPress={() => handleRoleChange("admin")}
          />
        </View>

        {isAdmin ? (
          <AdminPanel
            productCount={products.length}
            orderCount={24}
            revenue={totalPrice}
          />
        ) : (
          <UserPanel
            orderCount={4}
            favoriteCount={favoriteIds.length}
            cartCount={cartCount}
            cartItemsCount={cartItems.length}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.menuIcon}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
            </View>

            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuTitle}>Dark Mode</Text>
              <Text style={styles.menuSubtitle}>
                Change app appearance mode
              </Text>
            </View>

            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>
        </View>

        <Pressable style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function UserPanel({
  orderCount,
  favoriteCount,
  cartCount,
  cartItemsCount,
}: {
  orderCount: number;
  favoriteCount: number;
  cartCount: number;
  cartItemsCount: number;
}) {
  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard
          title="Orders"
          value={String(orderCount)}
          icon="receipt-outline"
        />
        <StatCard
          title="Favorites"
          value={String(favoriteCount)}
          icon="heart-outline"
        />
        <StatCard
          title="Cart Qty"
          value={String(cartCount)}
          icon="cart-outline"
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Panel</Text>

        {userMenuItems.map((item) => (
          <ProfileMenuItem key={item.title} item={item} />
        ))}
      </View>
    </>
  );
}

function AdminPanel({
  productCount,
  orderCount,
  revenue,
}: {
  productCount: number;
  orderCount: number;
  revenue: number;
}) {
  return (
    <>
      <View style={styles.adminHeroCard}>
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
        />
        <StatCard
          title="Orders"
          value={String(orderCount)}
          icon="bag-check-outline"
        />
        <StatCard
          title="Revenue"
          value={`$${revenue.toFixed(0)}`}
          icon="cash-outline"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Panel</Text>

        {adminMenuItems.map((item) => (
          <ProfileMenuItem key={item.title} item={item} />
        ))}
      </View>
    </>
  );
}

function RoleButton({
  title,
  icon,
  active,
  onPress,
}: {
  title: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleButton, active && styles.activeRoleButton]}
    >
      <Ionicons name={icon} size={18} color={active ? "#fff" : colors.muted} />

      <Text style={[styles.roleButtonText, active && styles.activeRoleText]}>
        {title}
      </Text>
    </Pressable>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: IconName;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ProfileMenuItem({ item }: { item: ProfileMenuItemType }) {
  return (
    <Pressable style={styles.menuItem}>
      <View style={styles.menuIcon}>
        <Ionicons name={item.icon} size={22} color={colors.primary} />
      </View>

      <View style={styles.menuTextWrapper}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  userEmail: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },

  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: spacing.sm,
  },

  adminBadge: {
    backgroundColor: "#FEF3C7",
  },

  roleBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  adminBadgeText: {
    color: "#92400E",
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  roleSwitcher: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 5,
    borderRadius: radius.full,
    marginTop: spacing.lg,
  },

  roleButton: {
    flex: 1,
    height: 46,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  activeRoleButton: {
    backgroundColor: colors.primary,
  },

  roleButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },

  activeRoleText: {
    color: "#fff",
  },

  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  statTitle: {
    color: colors.muted,
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
    color: "#fff",
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
    backgroundColor: "#0F172A",
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
    color: "#fff",
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

  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuTextWrapper: {
    flex: 1,
    marginLeft: spacing.md,
  },

  menuTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  menuSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.sm,
  },

  logoutButton: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: "#FEF2F2",
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
});
