import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "../../../services/profileService";
import { useAuthStore } from "../../../stores/authStore";
import { useAuth } from "../../../hooks/useAuth";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { Badge } from "../../../components/Badge";
import { LandlordProfile, SeekerProfile } from "../../../types";
import { colors, radius, spacing, typography } from "../../../utils/theme";

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const isLandlord = user?.userType === "LANDLORD";

  const { data: profile, isLoading } = useQuery({
    queryKey: isLandlord ? ["landlordProfile"] : ["seekerProfile"],
    queryFn: isLandlord
      ? profileService.getLandlordProfile
      : profileService.getSeekerProfile,
    enabled: !!user,
  });

  if (isLoading) return <LoadingScreen />;

  const mainPhoto =
    profile?.photos?.find((p) => p.isMain)?.url ||
    profile?.photos?.[0]?.url ||
    null;

  const displayName =
    profile && "firstName" in profile
      ? `${(profile as SeekerProfile).firstName} ${(profile as SeekerProfile).lastName}`
      : profile && "title" in profile
      ? (profile as LandlordProfile).title
      : user?.email || "Il tuo profilo";

  const displaySubtitle =
    profile && "rent" in profile
      ? `${(profile as LandlordProfile).city} · €${(profile as LandlordProfile).rent}/mo`
      : profile && "occupation" in profile
      ? (profile as SeekerProfile).occupation
      : "";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilo</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile/settings")}
            activeOpacity={0.7}
            style={styles.settingsBtn}
          >
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero photo */}
        <View style={styles.heroContainer}>
          {mainPhoto ? (
            <Image
              source={{ uri: mainPhoto }}
              style={styles.heroPhoto}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.heroPhoto, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{displayName}</Text>
          {displaySubtitle ? (
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
          ) : null}

          {/* Quick stats */}
          {profile && "rent" in profile ? (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {(profile as LandlordProfile).availableRooms}
                </Text>
                <Text style={styles.statLabel}>Stanze libere</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {(profile as LandlordProfile).currentTenants}
                </Text>
                <Text style={styles.statLabel}>Coinquilini</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {new Date(
                    (profile as LandlordProfile).availableFrom
                  ).toLocaleDateString("it-IT", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.statLabel}>Dal</Text>
              </View>
            </View>
          ) : profile && "age" in profile ? (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {(profile as SeekerProfile).age}
                </Text>
                <Text style={styles.statLabel}>Anni</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {(profile as SeekerProfile).cleanliness}/5
                </Text>
                <Text style={styles.statLabel}>Pulizia</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {(profile as SeekerProfile).budgetMax
                    ? `€${(profile as SeekerProfile).budgetMax}`
                    : "-"}
                </Text>
                <Text style={styles.statLabel}>Budget max</Text>
              </View>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/(tabs)/profile/edit")}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Modifica profilo</Text>
            </TouchableOpacity>
          </View>

          {/* Bio / Description */}
          {profile && "bio" in profile && (profile as SeekerProfile).bio ? (
            <>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bodyText}>{(profile as SeekerProfile).bio}</Text>
            </>
          ) : null}

          {profile && "description" in profile ? (
            <>
              <Text style={styles.sectionTitle}>Descrizione</Text>
              <Text style={styles.bodyText}>
                {(profile as LandlordProfile).description}
              </Text>
            </>
          ) : null}

          {/* Tags */}
          {profile && "hobbies" in profile && (profile as SeekerProfile).hobbies.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Hobby</Text>
              <View style={styles.badgeRow}>
                {(profile as SeekerProfile).hobbies.map((h) => (
                  <Badge key={h} label={h} />
                ))}
              </View>
            </>
          ) : null}

          {profile && "languages" in profile &&
          (profile as SeekerProfile).languages.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Lingue</Text>
              <View style={styles.badgeRow}>
                {(profile as SeekerProfile).languages.map((l) => (
                  <Badge key={l} label={l} />
                ))}
              </View>
            </>
          ) : null}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => logout()}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Esci dall'account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsBtnText: { fontSize: 18, color: colors.textSecondary },
  heroContainer: {
    width: "100%",
    height: 280,
    backgroundColor: colors.surface,
  },
  heroPhoto: { width: "100%", height: "100%" },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholderText: { fontSize: 64, color: colors.textMuted },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: "center", gap: spacing.xs },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  actionButtons: { marginVertical: spacing.sm },
  editButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: { ...typography.body, color: colors.textPrimary, fontWeight: "500" },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: spacing.md,
  },
  bodyText: { ...typography.body, color: colors.textPrimary },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  logoutBtn: {
    marginTop: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { ...typography.body, color: colors.pass },
});
