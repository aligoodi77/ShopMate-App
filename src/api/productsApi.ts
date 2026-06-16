import type { ImageSourcePropType } from "react-native";

import { supabase } from "../lib/supabase";
import type { Product, ProductCategory } from "../data/products";

type ProductRow = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  image_url: string;
  category: ProductCategory;
  is_trending: boolean | null;
  stock: number | null;
};

export type ProductInput = {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  isTrending: boolean;
  stock: number;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    image: { uri: row.image_url } as ImageSourcePropType,
    category: row.category,
    isTrending: Boolean(row.is_trending),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function fetchProductById(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(toProductRowInput(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(toProductRowInput(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProduct(data as ProductRow);
}

function toProductRowInput(input: ProductInput) {
  return {
    title: input.title,
    description: input.description,
    price: input.price,
    image_url: input.imageUrl,
    category: input.category,
    is_trending: input.isTrending,
    stock: input.stock,
  };
}
