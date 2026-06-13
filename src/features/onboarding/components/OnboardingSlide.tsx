import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../../theme";
import { OnboardingSlide as Slide } from "../data/slides";

type Props = {
  slide: Slide;
  width: number;
};

export function OnboardingSlide({ slide, width }: Props) {
  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.logoRow}>
        <View style={styles.logoIcon}>
          <Ionicons name="bag-handle" size={28} color="#fff" />
        </View>

        <Text style={styles.logoText}>
          Shop<Text style={styles.logoHighlight}>Mate</Text>
        </Text>
      </View>

      <View style={styles.illustration}>
        <View style={styles.bigCircle} />

        <View style={styles.mainBag}>
          <Ionicons name={slide.mainIcon} size={82} color="#fff" />
        </View>

        {slide.floatingIcons.map((item, index) => (
          <View key={`${item.icon}-${index}`} style={[styles.bubble, item]}>
            <Ionicons name={item.icon} size={28} color={colors.primary} />
          </View>
        ))}

        <View style={[styles.dot, styles.dotOne]} />
        <View style={[styles.dot, styles.dotTwo]} />
        <View style={[styles.dot, styles.dotThree]} />
      </View>

      <View style={styles.textBox}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.highlight}>{slide.highlight}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  logoRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
  },

  logoHighlight: {
    color: colors.primary,
  },

  illustration: {
    width: 310,
    height: 310,
    marginTop: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  bigCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#EAF3FF",
  },

  mainBag: {
    width: 150,
    height: 150,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  bubble: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  dot: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },

  dotOne: {
    top: 95,
    right: 92,
  },

  dotTwo: {
    bottom: 88,
    left: 70,
  },

  dotThree: {
    bottom: 100,
    right: 70,
  },

  textBox: {
    marginTop: spacing.lg,
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },

  highlight: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
    marginTop: 2,
  },

  subtitle: {
    marginTop: spacing.md,
    fontSize: 17,
    lineHeight: 26,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 330,
  },
});
