import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { matchService } from "../../../services/matchService";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { Match, LandlordProfile, SeekerProfile } from "../../../types";
import { colors, radius, spacing, typography } from "../../../utils/theme";

function formatTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "adesso";
  if (diffHours < 24) return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "ieri";
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function getMatchName(match: Match): string {
  const profile = match.otherProfile as LandlordProfile | SeekerProfile | undefined;
  if (!profile) return "Utente";
  if ("firstName" in profile) return `${profile.firstName} ${profile.lastName}`;
  if ("title" in profile) return profile.title;
  return "Utente";
}

function getMatchPhoto(match: Match): string | null {
  const profile = match.otherProfile as LandlordProfile | SeekerProfile | undefined;
  return profile?.photos?.find((p) => p.isMain)?.url || profile?.photos?.[0]?.url || null;
}

function openChat(match: Match) {
  router.push({ pathname: "/(tabs)/chat/[matchId]", params: { matchId: match.id } });
}

// ── New match bubble (no messages yet) ──────────────────────────────────────

function NewMatchBubble({ match }: { match: Match }) {
  const photo = getMatchPhoto(match);
  const name = getMatchName(match);

  return (
    <TouchableOpacity style={styles.bubble} onPress={() => openChat(match)} activeOpacity={0.8}>
      <View style={styles.bubbleAvatar}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.bubblePhoto} contentFit="cover" />
        ) : (
          <View style={[styles.bubblePhoto, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.bubbleDot} />
      </View>
      <Text style={styles.bubbleName} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  );
}

// ── Conversation row (has messages) ─────────────────────────────────────────

function ConversationItem({ match }: { match: Match }) {
  const photo = getMatchPhoto(match);
  const name = getMatchName(match);
  const hasUnread = match.lastMessage && !match.lastMessage.read;
  const preview = match.lastMessage?.content ?? "Nuovo match!";
  const time = match.lastMessage
    ? formatTime(match.lastMessage.createdAt)
    : formatTime(match.createdAt);

  return (
    <TouchableOpacity style={styles.item} onPress={() => openChat(match)} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {hasUnread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={[styles.itemName, hasUnread && styles.itemNameBold]}>{name}</Text>
          <Text style={styles.itemTime}>{time}</Text>
        </View>
        <Text style={[styles.itemPreview, hasUnread && styles.itemPreviewBold]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function MatchChatScreen() {
  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ["matches"],
    queryFn: matchService.getMatches,
  });

  const sorted = React.useMemo(() => {
    if (!matches) return [];
    return [...matches].sort((a, b) => {
      const ta = a.lastMessage?.createdAt ?? a.createdAt;
      const tb = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [matches]);

  const newMatches = sorted.filter((m) => !m.lastMessage);
  const conversations = sorted.filter((m) => !!m.lastMessage);

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match</Text>
        {sorted.length > 0 && (
          <Text style={styles.headerCount}>{sorted.length}</Text>
        )}
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◇</Text>
          <Text style={styles.emptyTitle}>Nessun match ancora</Text>
          <Text style={styles.emptySub}>Continua a esplorare per trovare un match</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/(tabs)/explore")}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyBtnText}>Vai a Esplora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationItem match={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            newMatches.length > 0 ? (
              <View style={styles.newMatchesSection}>
                <Text style={styles.sectionLabel}>NUOVI MATCH</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bubblesRow}
                >
                  {newMatches.map((m) => (
                    <NewMatchBubble key={m.id} match={m} />
                  ))}
                </ScrollView>
                {conversations.length > 0 && (
                  <View style={styles.sectionDivider} />
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            newMatches.length === 0 ? (
              <View style={styles.emptyConvs}>
                <Text style={styles.emptySub}>
                  Inizia una conversazione con i tuoi match
                </Text>
              </View>
            ) : null
          }
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // New matches bubbles
  newMatchesSection: { paddingTop: spacing.lg },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  bubblesRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  bubble: { alignItems: "center", gap: 6, width: 60 },
  bubbleAvatar: { position: "relative" },
  bubblePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  bubbleDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.smash,
    borderWidth: 2,
    borderColor: colors.background,
  },
  bubbleName: { ...typography.caption, color: colors.textPrimary, textAlign: "center" },

  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },

  // Conversation rows
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
  },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarInitial: { ...typography.h3, color: colors.textMuted },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.smash,
    borderWidth: 2,
    borderColor: colors.background,
  },
  itemContent: { flex: 1, gap: 3 },
  itemTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { ...typography.body, color: colors.textPrimary },
  itemNameBold: { fontWeight: "600" },
  itemTime: { ...typography.caption, color: colors.textMuted },
  itemPreview: { ...typography.body, color: colors.textSecondary, fontSize: 13 },
  itemPreviewBold: { color: colors.textPrimary, fontWeight: "500" },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 52 + spacing.md,
  },

  // Empty states
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: { fontSize: 44, color: colors.textMuted },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, textAlign: "center" },
  emptySub: { ...typography.body, color: colors.textSecondary, textAlign: "center" },
  emptyBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyBtnText: { ...typography.body, color: colors.textPrimary },
  emptyConvs: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
});
