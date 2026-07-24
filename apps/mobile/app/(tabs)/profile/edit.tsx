import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../../../services/profileService";
import { useAuthStore } from "../../../stores/authStore";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { colors, radius, spacing, typography } from "../../../utils/theme";
import { LandlordProfile, SeekerProfile } from "../../../types";

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isLandlord = user?.userType === "LANDLORD";

  const { data: profile, isLoading } = useQuery({
    queryKey: isLandlord ? ["landlordProfile"] : ["seekerProfile"],
    queryFn: isLandlord
      ? profileService.getLandlordProfile
      : profileService.getSeekerProfile,
  });

  // Seeker fields
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  // Landlord fields
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [houseRules, setHouseRules] = useState("");

  useEffect(() => {
    if (!profile) return;
    if ("bio" in profile) {
      const p = profile as SeekerProfile;
      setBio(p.bio);
      setOccupation(p.occupation);
    } else {
      const p = profile as LandlordProfile;
      setDescription(p.description);
      setRent(String(p.rent));
      setHouseRules(p.houseRules || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: isLandlord
      ? (data: Parameters<typeof profileService.updateLandlordProfile>[0]) =>
          profileService.updateLandlordProfile(data)
      : (data: Parameters<typeof profileService.updateSeekerProfile>[0]) =>
          profileService.updateSeekerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [isLandlord ? "landlordProfile" : "seekerProfile"],
      });
      router.back();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (err as Error)?.message
        ?? "Salvataggio fallito";
      Alert.alert("Errore", msg);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: isLandlord
      ? profileService.uploadLandlordPhoto
      : profileService.uploadSeekerPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [isLandlord ? "landlordProfile" : "seekerProfile"],
      });
    },
  });

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.images,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("photo", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as unknown as Blob);
      uploadPhotoMutation.mutate(formData);
    }
  };

  const handleSave = () => {
    if (isLandlord) {
      const rentNum = parseFloat(rent);
      updateMutation.mutate({
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(rent && !isNaN(rentNum) ? { rent: rentNum } : {}),
        ...(houseRules.trim() ? { houseRules: houseRules.trim() } : {}),
      });
    } else {
      updateMutation.mutate({
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(occupation.trim() ? { occupation: occupation.trim() } : {}),
      });
    }
  };

  if (isLoading) return <LoadingScreen />;

  const photos = profile?.photos || [];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>← Annulla</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifica</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photos section */}
          <Text style={styles.sectionLabel}>FOTO</Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={photo.id} style={styles.photoWrapper}>
                <Image source={{ uri: photo.url }} style={styles.photo} />
                {index === 0 ? (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Principale</Text>
                  </View>
                ) : null}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhoto}
              onPress={handlePickPhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.addPhotoIcon}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          {isLandlord ? (
            <>
              <Input
                label="Affitto mensile (€)"
                value={rent}
                onChangeText={setRent}
                keyboardType="numeric"
              />
              <Text style={styles.fieldLabel}>DESCRIZIONE</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
                placeholder="Racconta la tua casa..."
              />
              <Text style={styles.fieldLabel}>REGOLE DI CASA</Text>
              <TextInput
                style={styles.textArea}
                value={houseRules}
                onChangeText={setHouseRules}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
                placeholder="No feste, pulizie a rotazione..."
              />
            </>
          ) : (
            <>
              <Input
                label="Occupazione"
                value={occupation}
                onChangeText={setOccupation}
                placeholder="es. Sviluppatore"
              />
              <Text style={styles.fieldLabel}>BIO</Text>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
                placeholder="Raccontati..."
              />
            </>
          )}

          <Button
            label="Salva modifiche"
            onPress={handleSave}
            loading={updateMutation.isPending}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: { ...typography.body, color: colors.textSecondary },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.sm },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  photoWrapper: { width: 80, height: 80, borderRadius: radius.md, overflow: "hidden", position: "relative" },
  photo: { width: "100%", height: "100%" },
  mainBadge: {
    position: "absolute", bottom: 2, left: 2,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 2,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  mainBadgeText: { ...typography.caption, color: colors.background, fontSize: 9 },
  addPhoto: {
    width: 80, height: 80, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  addPhotoIcon: { fontSize: 24, color: colors.textMuted },
  textArea: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    ...typography.body, color: colors.textPrimary, minHeight: 100, marginBottom: spacing.xs,
  },
  saveButton: { marginTop: spacing.lg },
});
