import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { colors, radius, spacing, typography } from "../../utils/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const handleSelect = (userType: "LANDLORD" | "SEEKER") => {
    router.push({ pathname: "/(auth)/register", params: { userType } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Match House</Text>
        <Text style={styles.tagline}>Trova la stanza giusta.{"\n"}Trova i coinquilini giusti.</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, styles.cardLandlord]}
          onPress={() => handleSelect("LANDLORD")}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🏠</Text>
          </View>
          <Text style={styles.cardTitle}>Sono un proprietario</Text>
          <Text style={styles.cardDesc}>
            Ho una stanza o un appartamento da affittare
          </Text>
          <View style={styles.cardArrow}>
            <Text style={styles.cardArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardSeeker]}
          onPress={() => handleSelect("SEEKER")}
          activeOpacity={0.8}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🔍</Text>
          </View>
          <Text style={styles.cardTitle}>Cerco una stanza</Text>
          <Text style={styles.cardDesc}>
            Sto cercando un posto dove vivere
          </Text>
          <View style={styles.cardArrow}>
            <Text style={styles.cardArrowText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hai già un account?</Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLink}>Accedi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: spacing.xl,
  },
  logo: {
    fontSize: 32,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    justifyContent: "center",
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardLandlord: {
    backgroundColor: colors.surface,
  },
  cardSeeker: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  cardIconText: {
    fontSize: 22,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardArrow: {
    position: "absolute",
    right: spacing.lg,
    top: "50%",
    marginTop: -10,
  },
  cardArrowText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
