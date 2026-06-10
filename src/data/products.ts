export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: any;
};

export const products = [
  {
    id: "1",
    title: "Fujifilm Instax Mini Film Pack",
    image: require("../assets/images/1.jpg"),
    description: "Instant photo film pack for Fujifilm Instax Mini cameras.",
    price: 24.99,
  },
  {
    id: "2",
    title: "DJI Osmo Mobile Kit",
    image: require("../assets/images/2.jpg"),
    description:
      "Portable smartphone stabilizer kit with useful filming accessories.",
    price: 129.99,
  },
  {
    id: "3",
    title: "Kodak Compact Digital Camera",
    image: require("../assets/images/3.jpg"),
    description:
      "Small digital camera with 5X wide zoom and Full HD recording.",
    price: 89.99,
  },
  {
    id: "4",
    title: "Tapo Smart Security Camera",
    image: require("../assets/images/4.jpg"),
    description: "Indoor smart camera for home monitoring and security.",
    price: 39.99,
  },
  {
    id: "5",
    title: "Kodak Charmera Mini Camera",
    image: require("../assets/images/5.jpg"),
    description: "Retro-style mini camera with colorful collectible designs.",
    price: 19.99,
  },
  {
    id: "6",
    title: "SanDisk Ultra 128GB microSD",
    image: require("../assets/images/6.jpg"),
    description:
      "128GB microSD card for phones, cameras, tablets, and storage expansion.",
    price: 14.99,
  },
  {
    id: "7",
    title: "Wireless Microphone Set",
    image: require("../assets/images/7.jpg"),
    description:
      "Compact wireless microphone kit for video recording and content creation.",
    price: 59.99,
  },
  {
    id: "8",
    title: "Instax Mini Evo Camera",
    image: require("../assets/images/8.jpg"),
    description:
      "Hybrid instant camera with retro design and printed photo output.",
    price: 199.99,
  },
  {
    id: "9",
    title: "SanDisk Extreme Pro 256GB microSD",
    image: require("../assets/images/9.jpg"),
    description:
      "High-speed 256GB microSD card for cameras, drones, and 4K video.",
    price: 29.99,
  },
  {
    id: "10",
    title: "Lenovo ThinkPad Laptop",
    image: require("../assets/images/10.jpg"),
    description:
      "Business laptop with compact design, strong keyboard, and Windows support.",
    price: 899.99,
  },
];
