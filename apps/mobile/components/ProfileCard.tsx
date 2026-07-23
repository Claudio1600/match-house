import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { LandlordProfile, SeekerProfile } from "../types";
import { colors, radius, spacing, typography } from "../utils/theme";
import { Badge } from "./Badge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileCardProps {
  profile: LandlordProfile | SeekerProfile;
}

function isLandlord(p: LandlordProfile | SeekerProfile): p is LandlordProfile {
  return "rent" in p;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = profile.photos;
  const mainPhoto =
    photos.find((p) => p.isMain) || photos[activePhoto] || null;

  if (isLandlord(profile)) {
    return (
      <View style={styles.card}>
        {/* Photo carousel */}
        <View style={styles.photoContainer}>
          {photos.length > 0 ? (
            <>
              <Image
                source={{ uri: photos[activePhoto]?.url || mainPhoto?.url }}
                style={styles.photo}
                contentFit="cover"
                transition={200}
              />
              {photos.length > 1 ? (
                <View style={styles.dotRow}>
                  {photos.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setActivePhoto(i)}
                      style={[styles.dot, i === activePhoto && styles.dotActive]}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Nessuna foto</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <ScrollView
          style={styles.info}
          contentContainerStyle={styles.infoContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              {profile.title}
            </Text>
            <Text style={styles.rent}>€{profile.rent}/mo</Text>
          </View>

          <Text style={styles.location}>
            {profile.address}, {profile.city}
          </Text>

          {profile.squareMeters ? (
            <Text style={styles.meta}>
              {profile.squareMeters} m² · Piano {profile.floor ?? "T"}
            </Text>
          ) : null}

          <View style={styles.badgeRow}>
            {profile.furnished ? (
              <Badge label="Arredato" variant="neutral" />
            ) : null}
            {profile.billsIncluded ? (
              <Badge label="Spese incluse" variant="smash" />
            ) : null}
            {profile.wifiIncluded ? (
              <Badge label="Wi-Fi" variant="neutral" />
            ) : null}
            {profile.petsAllowed ? (
              <Badge label="Animali ok" variant="neutral" />
            ) : null}
            {profile.smokingAllowed ? (
              <Badge label="Fumatori ok" variant="neutral" />
            ) : null}
            {profile.parkingAvailable ? (
              <Badge label="Parcheggio" variant="neutral" />
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Descrizione</Text>
          <Text style={styles.description}>{profile.description}</Text>

          {profile.houseRules ? (
            <>
              <Text style={styles.sectionTitle}>Regole di casa</Text>
              <Text style={styles.description}>{profile.houseRules}</Text>
            </>
          ) : null}

          {profile.neighborhoodInfo ? (
            <>
              <Text style={styles.sectionTitle}>Zona</Text>
              <Text style={styles.description}>{profile.neighborhoodInfo}</Text>
            </>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.availableRooms}</Text>
              <Text style={styles.statLabel}>Stanze libere</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.currentTenants}</Text>
              <Text style={styles.statLabel}>Coinquilini</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {new Date(profile.availableFrom).toLocaleDateString("it-IT", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.statLabel}>Disponibile dal</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Seeker
  const fullName = `${profile.firstName} ${profile.lastName}`;
  return (
    <View style={styles.card}>
      <View style={styles.photoContainer}>
        {photos.length > 0 ? (
          <>
            <Image
              source={{ uri: photos[activePhoto]?.url || mainPhoto?.url }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
            {photos.length > 1 ? (
              <View style={styles.dotRow}>
                {photos.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setActivePhoto(i)}
                    style={[styles.dot, i === activePhoto && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Nessuna foto</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.info}
        contentContainerStyle={styles.infoContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{fullName}</Text>
          <Text style={styles.age}>{profile.age} anni</Text>
        </View>

        <Text style={styles.location}>{profile.occupation}</Text>
        {profile.university ? (
          <Text style={styles.meta}>{profile.university}</Text>
        ) : profile.company ? (
          <Text style={styles.meta}>{profile.company}</Text>
        ) : null}

        {profile.budgetMin || profile.budgetMax ? (
          <Text style={styles.budget}>
            Budget: €{profile.budgetMin ?? "?"} – €{profile.budgetMax ?? "?"}
            /mo
          </Text>
        ) : null}

        <View style={styles.badgeRow}>
          {profile.smoker ? (
            <Badge label="Fumatore" variant="neutral" />
          ) : null}
          {profile.hasPets ? (
            <Badge label="Ha animali" variant="neutral" />
          ) : null}
          {profile.languages.map((l) => (
            <Badge key={l} label={l} variant="neutral" />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.description}>{profile.bio}</Text>

        {profile.hobbies.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Hobby</Text>
            <View style={styles.badgeRow}>
              {profile.hobbies.map((h) => (
                <Badge key={h} label={h} variant="default" />
              ))}
            </View>
          </>
        ) : null}

        {profile.sports.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Sport</Text>
            <View style={styles.badgeRow}>
              {profile.sports.map((s) => (
                <Badge key={s} label={s} variant="default" />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.cleanliness}/5</Text>
            <Text style={styles.statLabel}>Pulizia</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.noiseLevel}/5</Text>
            <Text style={styles.statLabel}>Rumore</Text>
          </View>
          {profile.schedule ? (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profile.schedule}</Text>
              <Text style={styles.statLabel}>Orari</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoContainer: {
    width: "100%",
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: colors.surface,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    ...typography.body,
    color: colors.textMuted,
  },
  dotRow: {
    position: "absolute",
    bottom: spacing.sm,
    flexDirection: "row",
    alignSelf: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.background,
  },
  info: {
    flex: 1,
  },
  infoContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  rent: {
    ...typography.h3,
    color: colors.smash,
  },
  age: {
    ...typography.body,
    color: colors.textSecondary,
  },
  location: {
    ...typography.body,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  budget: {
    ...typography.body,
    color: colors.smash,
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
