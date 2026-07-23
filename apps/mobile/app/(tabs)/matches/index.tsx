import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { matchService } from "../../../services/matchService";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { Match, LandlordProfile, SeekerProfile } from "../../../types";
import { colors, radius, spacing, typography } from "../../../utils/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

function MatchCard({ match }: { match: Match }) {
  const profile = match.otherProfile as LandlordProfile | SeekerProfile | undefined;
  const photo = profile?.photos?.find((p) => p.isMain)?.url
    || profile?.photos?.[0]?.url
    || null;

  const name =
    profile && "firstName" in profile
      ? `${profile.firstName} ${profile.lastName}`
      : profile && "title" in profile
      ? profile.title
      : "Utente";

  const subtitle =
    profile && "rent" in profile
      ? `€${profile.rent}/mo · ${profile.city}`
      : profile && "occupation" in profile
      ? `${profile.occupation}`
      : "";

  const handlePress = () => {
    router.push({
      pathname: "/(tabs)/chat/[matchId]",
      params: { matchId: match.id },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.cardPhoto} contentFit="cover" />
      ) : (
        <View style={[styles.cardPhoto, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>?</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {match.lastMessage && !match.lastMessage.read ? (
        <View style={styles.unreadDot} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const { data: matches, isLoading, error, refetch } = useQuery({
    queryKey: ["matches"],
    queryFn: matchService.getMatches,
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match</Text>
        {matches?.length ? (
          <Text style={styles.headerCount}>{matches.length}</Text>
        ) : null}
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Errore nel caricamento</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : !matches?.length ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>◇</Text>
          <Text style={styles.emptyTitle}>Nessun match ancora</Text>
          <Text style={styles.emptySubtitle}>
            Continua a esplorare per trovare il tuo match
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/explore")}
            style={styles.exploreBtn}
          >
            <Text style={styles.exploreBtnText}>Vai a Esplora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <MatchCard match={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerCount: {
    ...typography.label,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grid: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  row: { gap: spacing.sm },
  card: {
    width: CARD_SIZE,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  cardPhoto: {
    width: "100%",
    height: CARD_SIZE,
    backgroundColor: colors.surface,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 32,
    color: colors.textMuted,
  },
  cardInfo: {
    padding: spacing.sm,
    gap: 2,
  },
  cardName: { ...typography.label, color: colors.textPrimary },
  cardSub: { ...typography.caption, color: colors.textMuted },
  unreadDot: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.smash,
    borderWidth: 2,
    borderColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 48, color: colors.textMuted },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  exploreBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exploreBtnText: { ...typography.body, color: colors.textPrimary },
  errorText: { ...typography.body, color: colors.textSecondary },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: { ...typography.body, color: colors.textPrimary },
});
