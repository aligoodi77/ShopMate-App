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

const PRODUCT_IMAGES_BUCKET = "Images";

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

export async function uploadProductImage({
  uri,
  mimeType,
  fileName,
}: {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const contentType = mimeType || blob.type || "image/jpeg";
  const extension = getImageExtension(fileName, contentType);
  const path = `products/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, blob, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
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

function getImageExtension(fileName?: string | null, mimeType?: string) {
  const fileExtension = fileName?.split(".").pop()?.toLowerCase();

  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }

  if (mimeType?.includes("png")) {
    return "png";
  }

  if (mimeType?.includes("webp")) {
    return "webp";
  }

  return "jpg";
}
