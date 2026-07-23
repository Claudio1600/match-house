import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
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
  if (diffHours < 24)
    return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "ieri";
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function ConversationItem({ match }: { match: Match }) {
  const profile = match.otherProfile as LandlordProfile | SeekerProfile | undefined;
  const photo = profile?.photos?.find((p) => p.isMain)?.url
    || profile?.photos?.[0]?.url || null;

  const name =
    profile && "firstName" in profile
      ? `${profile.firstName} ${profile.lastName}`
      : profile && "title" in profile
      ? profile.title
      : "Utente";

  const hasUnread = match.lastMessage && !match.lastMessage.read;
  const preview = match.lastMessage?.content || "Nuovo match!";
  const time = match.lastMessage
    ? formatTime(match.lastMessage.createdAt)
    : formatTime(match.createdAt);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/chat/[matchId]",
          params: { matchId: match.id },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {hasUnread ? <View style={styles.unreadDot} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, hasUnread && styles.nameUnread]}>
            {name}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text
          style={[styles.preview, hasUnread && styles.previewUnread]}
          numberOfLines={1}
        >
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ["matches"],
    queryFn: matchService.getMatches,
  });

  // Sort by last message time desc
  const sorted = React.useMemo(() => {
    if (!matches) return [];
    return [...matches].sort((a, b) => {
      const ta = a.lastMessage?.createdAt || a.createdAt;
      const tb = b.lastMessage?.createdAt || b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [matches]);

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messaggi</Text>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>◻</Text>
          <Text style={styles.emptyTitle}>Nessuna conversazione</Text>
          <Text style={styles.emptySubtitle}>
            Quando avrai un match potrai iniziare a chattare
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationItem match={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    ...typography.h3,
    color: colors.textMuted,
  },
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
  content: { flex: 1, gap: 3 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { ...typography.body, color: colors.textPrimary },
  nameUnread: { fontWeight: "500" },
  time: { ...typography.caption, color: colors.textMuted },
  preview: { ...typography.body, color: colors.textSecondary },
  previewUnread: { color: colors.textPrimary, fontWeight: "500" },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 52 + spacing.md,
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
});
