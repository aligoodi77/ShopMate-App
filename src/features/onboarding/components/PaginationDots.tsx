import { StyleSheet, View } from "react-native";
import { colors } from "../../../theme";

type Props = {
  total: number;
  activeIndex: number;
};

export function PaginationDots({ total, activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  activeDot: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  inactiveDot: {
    backgroundColor: "#CFE1F8",
  },
});
