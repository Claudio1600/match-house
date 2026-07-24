import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { discoverService } from "../../../services/discoverService";
import { swipeService } from "../../../services/swipeService";
import { SwipeCard } from "../../../components/SwipeCard";
import { MatchModal } from "../../../components/MatchModal";
import { useAuthStore } from "../../../stores/authStore";
import { colors, radius, spacing, typography } from "../../../utils/theme";
import { LandlordProfile, SeekerProfile, Match } from "../../../types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Skeleton card placeholder
function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonPhoto} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "60%" }]} />
        <View style={[styles.skeletonLine, { width: "40%", marginTop: spacing.sm }]} />
      </View>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<(LandlordProfile | SeekerProfile)[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [matchModal, setMatchModal] = useState<{
    visible: boolean;
    match: Match | null;
  }>({ visible: false, match: null });

  const { isLoading, error, data: discoverData } = useQuery({
    queryKey: ["discover", page],
    queryFn: () => discoverService.getProfiles(page),
    enabled: hasMore,
  });

  // Handle discover results
  React.useEffect(() => {
    if (!discoverData) return;
    setProfiles((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newProfiles = discoverData.profiles.filter(
        (p) => !existingIds.has(p.id)
      );
      return [...prev, ...newProfiles];
    });
    setHasMore(discoverData.hasMore);
  }, [discoverData]);

  const swipeMutation = useMutation({
    mutationFn: swipeService.swipe,
    onSuccess: (data) => {
      if (data.isMatch && data.match) {
        setMatchModal({ visible: true, match: data.match });
      }
    },
  });

  const handleSwipe = useCallback(
    (userId: string, action: "SMASH" | "PASS") => {
      // Remove swiped card from stack
      setProfiles((prev) => prev.filter((p) => p.userId !== userId));

      swipeMutation.mutate({ targetUserId: userId, action });

      // Load more when running low
      if (profiles.length <= 3 && hasMore) {
        setPage((prev) => prev + 1);
      }
    },
    [profiles.length, hasMore, swipeMutation]
  );

  const handleSmash = () => {
    const top = profiles[0];
    if (top) handleSwipe(top.userId, "SMASH");
  };

  const handlePass = () => {
    const top = profiles[0];
    if (top) handleSwipe(top.userId, "PASS");
  };

  if (isLoading && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match House</Text>
        </View>
        <SkeletonCard />
      </SafeAreaView>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Errore di connessione</Text>
          <Text style={styles.emptySubtitle}>
            Controlla la connessione e riprova
          </Text>
          <TouchableOpacity
            onPress={() => queryClient.invalidateQueries({ queryKey: ["discover"] })}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (profiles.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match House</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>◎</Text>
          <Text style={styles.emptyTitle}>Hai visto tutto!</Text>
          <Text style={styles.emptySubtitle}>
            Torna più tardi per nuovi profili
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const visibleProfiles = profiles.slice(0, 3);

  // Get photo for match modal
  const getMatchPhoto = (match: Match | null): string => {
    if (!match?.otherProfile?.photos?.length) return "";
    return match.otherProfile.photos.find((p) => p.isMain)?.url || match.otherProfile.photos[0]?.url || "";
  };

  const myProfile = user?.userType === "LANDLORD"
    ? queryClient.getQueryData<LandlordProfile>(["landlordProfile"])
    : queryClient.getQueryData<SeekerProfile>(["seekerProfile"]);
  const myPhoto = myProfile?.photos?.find((p) => p.isMain)?.url || "";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match House</Text>
        <Text style={styles.headerSub}>
          {user?.userType === "LANDLORD" ? "Trova il coinquilino ideale" : "Trova la stanza giusta"}
        </Text>
      </View>

      {/* Card stack */}
      <View style={styles.cardStack}>
        {[...visibleProfiles].reverse().map((profile, reverseIndex) => {
          const index = visibleProfiles.length - 1 - reverseIndex;
          return (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={index === 0}
              index={index}
            />
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={28} color={colors.pass} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={() => {
            const top = profiles[0];
            if (top) {
              router.push({
                pathname: "/(tabs)/explore/[profileId]",
                params: { profileId: top.id },
              });
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.smashButton]}
          onPress={handleSmash}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={26} color={colors.smash} />
        </TouchableOpacity>
      </View>

      {/* Match modal */}
      <MatchModal
        visible={matchModal.visible}
        matchId={matchModal.match?.id || ""}
        otherUserPhoto={getMatchPhoto(matchModal.match)}
        myPhoto={myPhoto}
        onClose={() => setMatchModal({ visible: false, match: null })}
        onChat={() => {
          setMatchModal({ visible: false, match: null });
          if (matchModal.match) {
            router.push({
              pathname: "/(tabs)/chat/[matchId]",
              params: { matchId: matchModal.match.id },
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardStack: {
    flex: 1,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    position: "relative",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  passButton: {
    backgroundColor: colors.passBg,
    borderColor: `${colors.pass}44`,
  },
  smashButton: {
    backgroundColor: colors.smashBg,
    borderColor: `${colors.smash}44`,
  },
  infoButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    width: 46,
    height: 46,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  // Skeleton
  skeletonCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.65,
  },
  skeletonPhoto: {
    height: "60%",
    backgroundColor: colors.surface,
  },
  skeletonContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonLine: {
    height: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    width: "80%",
  },
});
