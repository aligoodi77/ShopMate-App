import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type AppState = {
  favoriteIds: string[];
  isDarkMode: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  setIsDarkMode: (value: boolean) => void;
};

const AppStoreContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const value = useMemo<AppState>(
    () => ({
      favoriteIds,
      isDarkMode,
      isFavorite: (productId) => favoriteIds.includes(productId),
      toggleFavorite: (productId) => {
        setFavoriteIds((current) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        );
      },
      setIsDarkMode,
    }),
    [favoriteIds, isDarkMode],
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
