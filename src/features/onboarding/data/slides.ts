import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export type OnboardingSlide = {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  mainIcon: IconName;
  floatingIcons: {
    icon: IconName;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  }[];
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Everything you love,",
    highlight: "all in one place.",
    subtitle:
      "Discover top products, exclusive deals, and a better way to shop.",
    mainIcon: "bag-handle",
    floatingIcons: [
      { icon: "headset", top: 20, right: 32 },
      { icon: "watch", bottom: 80, left: 18 },
      { icon: "camera", bottom: 80, right: 18 },
      { icon: "shirt", top: 40, left: 36 },
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
      { icon: "grid", top: 25, left: 30 },
      { icon: "pricetag", top: 35, right: 36 },
      { icon: "star", bottom: 70, left: 28 },
      { icon: "flash", bottom: 75, right: 28 },
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
      { icon: "heart-circle", top: 25, right: 36 },
      { icon: "bookmark", top: 40, left: 36 },
      { icon: "albums", bottom: 72, right: 28 },
      { icon: "checkmark-circle", bottom: 74, left: 28 },
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
      { icon: "cart", top: 26, left: 30 },
      { icon: "receipt", top: 38, right: 36 },
      { icon: "settings", bottom: 75, left: 28 },
      { icon: "shield-checkmark", bottom: 72, right: 28 },
    ],
  },
];
