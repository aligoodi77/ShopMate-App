import type { ImageSourcePropType } from "react-native";

export type ProductCategory =
  | "Laptops"
  | "Phones"
  | "Audio"
  | "Gaming"
  | "Keyboards"
  | "Printers";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: ImageSourcePropType;
  category: ProductCategory;
  isTrending?: boolean;
};

export const products: Product[] = [
  {
    id: "1",
    title: "ASUS Zenbook OLED Laptop",
    image: require("../assets/images/1.jpg"),
    description:
      "Slim OLED laptop with a premium build for work, study, and travel.",
    price: 1199.99,
    category: "Laptops",
    isTrending: true,
  },
  {
    id: "2",
    title: "Microsoft Surface Laptop",
    image: require("../assets/images/2.jpg"),
    description:
      "Lightweight touchscreen laptop with a clean design and everyday power.",
    price: 999.99,
    category: "Laptops",
  },
  {
    id: "3",
    title: "PlayStation 5 Slim Console",
    image: require("../assets/images/3.jpg"),
    description:
      "Next-gen gaming console with fast loading, 4K gaming, and DualSense control.",
    price: 499.99,
    category: "Gaming",
    isTrending: true,
  },
  {
    id: "4",
    title: "Open-Ear Wireless Earbuds",
    image: require("../assets/images/4.jpg"),
    description:
      "Comfortable open-ear earbuds with a compact charging case.",
    price: 129.99,
    category: "Audio",
  },
  {
    id: "5",
    title: "Black Wireless Earbuds",
    image: require("../assets/images/5.jpg"),
    description:
      "Pocket-size Bluetooth earbuds with touch controls and a matte case.",
    price: 79.99,
    category: "Audio",
  },
  {
    id: "6",
    title: "Over-Ear Noise Cancelling Headphones",
    image: require("../assets/images/6.jpg"),
    description:
      "Premium wireless headphones with soft cushions and active noise cancelling.",
    price: 299.99,
    category: "Audio",
    isTrending: true,
  },
  {
    id: "7",
    title: "Creality Ender 3D Printer",
    image: require("../assets/images/7.jpg"),
    description:
      "Desktop 3D printer for prototypes, models, repairs, and maker projects.",
    price: 229.99,
    category: "Printers",
  },
  {
    id: "8",
    title: "Flashforge Adventurer 3D Printer",
    image: require("../assets/images/8.jpg"),
    description:
      "Enclosed 3D printer with a compact chamber for cleaner desktop printing.",
    price: 399.99,
    category: "Printers",
    isTrending: true,
  },
  {
    id: "9",
    title: "RGB Mechanical Gaming Keyboard",
    image: require("../assets/images/9.jpg"),
    description:
      "Wired mechanical keyboard with RGB lighting and fast gaming switches.",
    price: 89.99,
    category: "Keyboards",
  },
  {
    id: "10",
    title: "Logitech Wireless Keyboard",
    image: require("../assets/images/10.jpg"),
    description:
      "Low-profile wireless keyboard built for quiet typing and desk setups.",
    price: 49.99,
    category: "Keyboards",
  },
  {
    id: "11",
    title: "iPhone Pro Max Smartphone",
    image: require("../assets/images/11.jpg"),
    description:
      "Large-screen smartphone with 256GB storage and a pro camera system.",
    price: 1199.99,
    category: "Phones",
    isTrending: true,
  },
  {
    id: "12",
    title: "Samsung Galaxy 5G Smartphone",
    image: require("../assets/images/12.jpg"),
    description:
      "5G Android smartphone with 256GB storage and 8GB RAM.",
    price: 899.99,
    category: "Phones",
  },
  {
    id: "13",
    title: "Xiaomi Redmi Smartphone",
    image: require("../assets/images/13.jpg"),
    description:
      "Affordable smartphone with a bright display and dual rear cameras.",
    price: 299.99,
    category: "Phones",
  },
  {
    id: "14",
    title: "iPhone Smartphone",
    image: require("../assets/images/14.jpg"),
    description:
      "Compact iPhone with 256GB storage and a bright green finish.",
    price: 799.99,
    category: "Phones",
  },
  {
    id: "15",
    title: "Premium Over-Ear Headset",
    image: require("../assets/images/headphone.png"),
    description:
      "Wireless over-ear headset with a clean design for calls, music, and gaming.",
    price: 249.99,
    category: "Audio",
  },
];
