import { Product } from "@/data/products";

export function searchProducts(products: Product[], query: string) {
  const q = query.trim().toLowerCase();

  if (!q) {
    return products;
  }

  return products.filter((product) => product.title.toLowerCase().includes(q));
}
