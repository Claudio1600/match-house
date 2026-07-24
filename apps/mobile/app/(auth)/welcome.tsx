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
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../utils/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const handleSelect = (userType: "LANDLORD" | "SEEKER") => {
    router.push({ pathname: "/(auth)/register", params: { userType } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Ionicons name="home" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.logo}>Match House</Text>
        <Text style={styles.tagline}>
          Trova la stanza giusta.{"\n"}Trova le persone giuste.
        </Text>
      </View>

      {/* Role selection */}
      <View style={styles.cards}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect("LANDLORD")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: "#111111" }]}>
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Sono un proprietario</Text>
            <Text style={styles.cardDesc}>Metto in affitto una stanza o appartamento</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect("SEEKER")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: colors.smash }]}>
            <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Cerco una stanza</Text>
            <Text style={styles.cardDesc}>Sto cercando dove vivere</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Hai già un account?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.7}>
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
  hero: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    gap: spacing.md,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: radius.md + 2,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    fontWeight: "400",
  },

  cards: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
