import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../services/api";
import { LandlordProfile } from "../../../types";
import { colors, radius, spacing, typography } from "../../../utils/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ITALY_REGION: Region = {
  latitude: 41.9,
  longitude: 12.5,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

interface DiscoverResponse {
  profiles: LandlordProfile[];
  hasMore: boolean;
}

async function fetchMapProperties(city: string): Promise<LandlordProfile[]> {
  const params: Record<string, string> = { limit: "50" };
  if (city.trim()) params.city = city.trim();
  const { data } = await api.get<DiscoverResponse>("/discover", { params });
  return data.profiles as LandlordProfile[];
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [searchText, setSearchText] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["map-properties", activeCity],
    queryFn: () => fetchMapProperties(activeCity),
  });

  const selectedProperty = properties.find((p) => p.id === selectedId);

  const handleSearch = useCallback(() => {
    setActiveCity(searchText);
    setSelectedId(null);
    if (searchText.trim() && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: 41.9, longitude: 12.5, latitudeDelta: 3, longitudeDelta: 3 },
        800
      );
    }
  }, [searchText]);

  const handleMarkerPress = useCallback(
    (property: LandlordProfile) => {
      setSelectedId(property.id);
      mapRef.current?.animateToRegion(
        {
          latitude: property.latitude - 0.005,
          longitude: property.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        400
      );
    },
    []
  );

  const handleClear = () => {
    setSearchText("");
    setActiveCity("");
    setSelectedId(null);
    mapRef.current?.animateToRegion(ITALY_REGION, 600);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca città (es. Milano, Roma…)"
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Cerca</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View style={styles.badge}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <Text style={styles.badgeText}>
            {properties.length} {properties.length === 1 ? "annuncio" : "annunci"}
            {activeCity ? ` a ${activeCity}` : " in Italia"}
          </Text>
        )}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={ITALY_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => handleMarkerPress(p)}
          >
            <View style={[styles.pin, selectedId === p.id && styles.pinSelected]}>
              <Text style={[styles.pinText, selectedId === p.id && styles.pinTextSelected]}>
                €{p.rent}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Detail card */}
      {selectedProperty && (
        <View style={styles.card}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardScroll}
          >
            <PropertyCard
              property={selectedProperty}
              onClose={() => setSelectedId(null)}
              onOpen={() =>
                router.push({
                  pathname: "/(tabs)/explore/[profileId]",
                  params: { profileId: selectedProperty.id },
                })
              }
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

interface PropertyCardProps {
  property: LandlordProfile;
  onClose: () => void;
  onOpen: () => void;
}

function PropertyCard({ property, onClose, onOpen }: PropertyCardProps) {
  const mainPhoto = property.photos?.find((ph) => ph.isMain) ?? property.photos?.[0];

  return (
    <View style={styles.propertyCard}>
      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Photo placeholder */}
      <View style={styles.photoBox}>
        {mainPhoto ? (
          <Text style={styles.photoPlaceholder}>📷</Text>
        ) : (
          <Ionicons name="home" size={36} color={colors.textMuted} />
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{property.title}</Text>

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.cardAddress} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="cash-outline" size={14} color={colors.textMuted} />
          <Text style={styles.cardPrice}>€{property.rent}/mese</Text>
          {property.billsIncluded && (
            <Text style={styles.cardTag}>spese incl.</Text>
          )}
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="bed-outline" size={14} color={colors.textMuted} />
          <Text style={styles.cardMeta}>
            {property.availableRooms} {property.availableRooms === 1 ? "stanza" : "stanze"} disponibili
          </Text>
          {property.squareMeters && (
            <>
              <Text style={styles.cardDot}>·</Text>
              <Text style={styles.cardMeta}>{property.squareMeters} m²</Text>
            </>
          )}
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {property.furnished && <FeatureChip icon="cube-outline" label="Arredato" />}
          {property.wifiIncluded && <FeatureChip icon="wifi" label="WiFi" />}
          {property.petsAllowed && <FeatureChip icon="paw-outline" label="Animali" />}
          {property.parkingAvailable && <FeatureChip icon="car-outline" label="Parcheggio" />}
        </View>

        <TouchableOpacity style={styles.openBtn} onPress={onOpen}>
          <Text style={styles.openBtnText}>Vedi profilo completo</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureChip({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={11} color={colors.textSecondary} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  searchContainer: {
    position: "absolute",
    top: 50,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.sm : spacing.xs,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  searchButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: colors.background,
    fontWeight: "600",
    fontSize: 14,
  },

  badge: {
    position: "absolute",
    top: 104,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  map: { flex: 1 },

  pin: {
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  pinText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pinTextSelected: {
    color: colors.background,
  },

  card: {
    position: "absolute",
    bottom: spacing.xl,
    left: 0,
    right: 0,
  },
  cardScroll: { paddingHorizontal: spacing.md },

  propertyCard: {
    width: SCREEN_W - spacing.md * 2,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginRight: spacing.sm,
  },
  closeBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    padding: 4,
  },
  photoBox: {
    width: 90,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholder: { fontSize: 30 },

  cardInfo: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
    paddingRight: 24,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardTag: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cardDot: {
    color: colors.textMuted,
    marginHorizontal: 2,
  },

  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  openBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "600",
  },
});
