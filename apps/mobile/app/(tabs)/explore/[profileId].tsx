import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { profileService } from "../../../services/profileService";
import { swipeService } from "../../../services/swipeService";
import { useAuthStore } from "../../../stores/authStore";
import { ProfileCard } from "../../../components/ProfileCard";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { Button } from "../../../components/Button";
import { colors, spacing, typography, radius } from "../../../utils/theme";

export default function ProfileDetailScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { user } = useAuthStore();
  const isLandlord = user?.userType === "LANDLORD";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", profileId, isLandlord ? "seeker" : "landlord"],
    queryFn: () =>
      isLandlord
        ? profileService.getSeekerProfileById(profileId!)
        : profileService.getLandlordProfileById(profileId!),
    enabled: !!profileId,
  });

  const swipeMutation = useMutation({
    mutationFn: swipeService.swipe,
    onSuccess: () => router.back(),
  });

  if (isLoading) return <LoadingScreen />;
  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Profilo non trovato</Text>
        </View>
      </SafeAreaView>
    );
  }

  const userId = profile.userId;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← Indietro</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <ProfileCard profile={profile} />
      </ScrollView>

      <View style={styles.actions}>
        <Button
          label="Pass"
          variant="pass"
          onPress={() =>
            swipeMutation.mutate({ targetUserId: userId, action: "PASS" })
          }
          loading={swipeMutation.isPending}
          fullWidth={false}
          style={styles.actionBtn}
        />
        <Button
          label="Smash"
          variant="smash"
          onPress={() =>
            swipeMutation.mutate({ targetUserId: userId, action: "SMASH" })
          }
          loading={swipeMutation.isPending}
          fullWidth={false}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: { ...typography.body, color: colors.textSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { ...typography.body, color: colors.textSecondary },
  actions: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flex: 1 },
});
