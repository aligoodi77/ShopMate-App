import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

import type { Product } from "../data/products";

export type UserRole = "user" | "admin";

export type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

type AppState = {
  favoriteIds: string[];
  isDarkMode: boolean;
  cartItems: CartItem[];
  currentUser: CurrentUser;

  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;

  setIsDarkMode: (value: boolean) => void;
  setUserRole: (role: UserRole) => void;

  addToCart: (product: Product) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  getTotalCount: () => number;
  getTotalPrice: () => number;
};

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "1",
    fullName: "Ali Goudarzi",
    email: "ali@shopmate.dev",
    role: "user",
  });

  const value = useMemo(
    () => ({
      favoriteIds,
      isDarkMode,
      cartItems,
      currentUser,

      isFavorite: (productId: string) => favoriteIds.includes(productId),

      toggleFavorite: (productId: string) => {
        setFavoriteIds((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        );
      },

      setIsDarkMode,

      setUserRole: (role: UserRole) => {
        setCurrentUser((user) => ({
          ...user,
          role,
        }));
      },

      addToCart: (product: Product) => {
        setCartItems((currentItems) => {
          const existingItem = currentItems.find(
            (item) => item.product.id === product.id,
          );

          if (existingItem) {
            return currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }

          return [...currentItems, { product, quantity: 1 }];
        });
      },

      increaseQuantity: (productId: string) => {
        setCartItems((currentItems) =>
          currentItems.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      },

      decreaseQuantity: (productId: string) => {
        setCartItems((currentItems) =>
          currentItems
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },

      removeFromCart: (productId: string) => {
        setCartItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== productId),
        );
      },

      clearCart: () => {
        setCartItems([]);
      },

      getTotalCount: () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return cartItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0,
        );
      },
    }),
    [favoriteIds, isDarkMode, cartItems, currentUser],
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }

  return context;
}
