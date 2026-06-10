import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/api/productsApi";
import { Image, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <View>
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View>
      <Image source={product.image} style={{ width: "100%", height: 300 }} />
      <Text>{product.title}</Text>
      <Text>{product.description}</Text>
      <Text>${product.price}</Text>
    </View>
  );
}
