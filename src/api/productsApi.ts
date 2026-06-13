import { products } from "../data/products";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProducts() {
  await wait(800);
  return products;
}

export async function fetchProductById(id: string) {
  await wait(500);

  const product = products.find((item) => item.id === id);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}
