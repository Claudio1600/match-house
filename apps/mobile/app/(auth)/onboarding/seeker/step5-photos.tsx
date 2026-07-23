import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { profileService } from "../../../../services/profileService";
import { Button } from "../../../../components/Button";
import { colors, radius, spacing, typography } from "../../../../utils/theme";

export default function SeekerStep5() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 6 - photos.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, 6));
    }
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileService.createSeekerProfile({
        firstName: params.firstName || "",
        lastName: params.lastName || "",
        age: parseInt(params.age || "0"),
        bio: params.bio || "",
        occupation: params.occupation || "",
        university: params.university || undefined,
        company: params.company || undefined,
        smoker: params.smoker === "true",
        hasPets: params.hasPets === "true",
        schedule: params.schedule || undefined,
        cleanliness: parseInt(params.cleanliness || "3"),
        noiseLevel: parseInt(params.noiseLevel || "2"),
        budgetMin: params.budgetMin ? parseFloat(params.budgetMin) : undefined,
        budgetMax: params.budgetMax ? parseFloat(params.budgetMax) : undefined,
        preferredCity: params.preferredCity || undefined,
        moveInDate: params.moveInDate || undefined,
        hobbies: params.hobbies ? params.hobbies.split(",").filter(Boolean) : [],
        sports: params.sports ? params.sports.split(",").filter(Boolean) : [],
        languages: params.languages
          ? params.languages.split(",").filter(Boolean)
          : ["Italiano"],
      });

      for (const uri of photos) {
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
        await profileService.uploadSeekerPhoto(formData);
      }

      router.replace("/(tabs)/explore");
    } catch {
      Alert.alert("Errore", "Non è stato possibile creare il profilo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progress}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={[styles.progressDot, styles.progressDotActive]} />
          ))}
        </View>

        <Text style={styles.title}>Le tue foto</Text>
        <Text style={styles.subtitle}>
          Aggiungi delle foto per presentarti ai proprietari. La prima sarà la principale.
        </Text>

        <View style={styles.photoGrid}>
          {photos.map((uri, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photo} />
              {index === 0 ? (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Principale</Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 6 ? (
            <TouchableOpacity style={styles.addButton} onPress={pickPhoto} activeOpacity={0.7}>
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Aggiungi</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Button
          label={photos.length === 0 ? "Salta per ora" : "Completa il profilo"}
          onPress={handleFinish}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  progress: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xl },
  progressDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl },
  photoWrapper: { width: "47%", aspectRatio: 1, borderRadius: radius.md, overflow: "hidden", position: "relative" },
  photo: { width: "100%", height: "100%" },
  mainBadge: {
    position: "absolute", bottom: spacing.xs, left: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: radius.sm,
    paddingHorizontal: spacing.xs, paddingVertical: 2,
  },
  mainBadgeText: { ...typography.caption, color: colors.background },
  removeButton: {
    position: "absolute", top: spacing.xs, right: spacing.xs,
    width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  removeText: { color: colors.background, fontSize: 16, lineHeight: 20 },
  addButton: {
    width: "47%", aspectRatio: 1, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: spacing.xs,
  },
  addButtonIcon: { fontSize: 28, color: colors.textMuted },
  addButtonText: { ...typography.caption, color: colors.textMuted },
});
