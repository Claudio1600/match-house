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

export default function LandlordStep4() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 8 - photos.length,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, 8));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create profile
      const profile = await profileService.createLandlordProfile({
        title: params.title || "",
        address: params.address || "",
        city: params.city || "",
        latitude: parseFloat(params.latitude || "0"),
        longitude: parseFloat(params.longitude || "0"),
        rent: parseFloat(params.rent || "0"),
        totalRooms: parseInt(params.totalRooms || "1"),
        availableRooms: parseInt(params.availableRooms || "1"),
        currentTenants: parseInt(params.currentTenants || "0"),
        squareMeters: params.squareMeters
          ? parseFloat(params.squareMeters)
          : undefined,
        floor: params.floor ? parseInt(params.floor) : undefined,
        furnished: params.furnished === "true",
        billsIncluded: params.billsIncluded === "true",
        wifiIncluded: params.wifiIncluded === "true",
        petsAllowed: params.petsAllowed === "true",
        smokingAllowed: params.smokingAllowed === "true",
        parkingAvailable: params.parkingAvailable === "true",
        availableFrom: params.availableFrom || "",
        description: params.description || "",
        houseRules: params.houseRules || undefined,
        neighborhoodInfo: params.neighborhoodInfo || undefined,
      });

      // Upload photos
      for (const uri of photos) {
        const formData = new FormData();
        formData.append("photo", {
          uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
        await profileService.uploadLandlordPhoto(formData);
      }

      router.replace("/(tabs)/explore");
    } catch (err) {
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
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[styles.progressDot, styles.progressDotActive]}
            />
          ))}
        </View>

        <Text style={styles.title}>Foto dell'appartamento</Text>
        <Text style={styles.subtitle}>
          Aggiungi almeno una foto. La prima sarà la principale.
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

          {photos.length < 8 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={pickPhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Aggiungi</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Button
          label={photos.length === 0 ? "Salta per ora" : "Completa il profilo"}
          onPress={handleFinish}
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progress: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  photoWrapper: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  mainBadge: {
    position: "absolute",
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mainBadgeText: {
    ...typography.caption,
    color: colors.background,
  },
  removeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.background,
    fontSize: 16,
    lineHeight: 20,
  },
  addButton: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  addButtonIcon: {
    fontSize: 28,
    color: colors.textMuted,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  button: {},
});
