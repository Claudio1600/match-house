import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../stores/authStore";
import { useAuth } from "../../../hooks/useAuth";
import { colors, radius, spacing, typography } from "../../../utils/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface SettingRowProps {
  icon: IconName;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  isLast?: boolean;
}

function SettingRow({
  icon,
  label,
  description,
  onPress,
  rightElement,
  destructive = false,
  isLast = false,
}: SettingRowProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress && !rightElement}
      >
        <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
          <Ionicons
            name={icon}
            size={18}
            color={destructive ? colors.pass : colors.textSecondary}
          />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, destructive && styles.destructiveText]}>
            {label}
          </Text>
          {description ? (
            <Text style={styles.rowDesc}>{description}</Text>
          ) : null}
        </View>
        {rightElement ? (
          rightElement
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        ) : null}
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Elimina account",
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () =>
            Alert.alert("Non disponibile", "Contatta support@matchhouse.app"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow
            icon="mail-outline"
            label="Email"
            description={user?.email}
          />
          <SettingRow
            icon="person-outline"
            label="Tipo account"
            description={user?.userType === "LANDLORD" ? "Proprietario" : "Cerca stanza"}
            isLast
          />
        </View>

        {/* Profile */}
        <Text style={styles.sectionLabel}>PROFILO</Text>
        <View style={styles.card}>
          <SettingRow
            icon="create-outline"
            label="Modifica profilo"
            onPress={() => router.push("/(tabs)/profile/edit")}
            isLast
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICHE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            label="Notifiche push"
            description="Nuovi match e messaggi"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.smash }}
                thumbColor={colors.background}
              />
            }
          />
          <SettingRow
            icon="mail-unread-outline"
            label="Email"
            description="Riepilogo settimanale"
            rightElement={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.border, true: colors.smash }}
                thumbColor={colors.background}
              />
            }
            isLast
          />
        </View>

        {/* Privacy */}
        <Text style={styles.sectionLabel}>PRIVACY E LEGALE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="document-text-outline"
            label="Termini di servizio"
            onPress={() => Alert.alert("Termini di servizio", "Apertura browser...")}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Informativa sulla privacy"
            onPress={() => Alert.alert("Privacy policy", "Apertura browser...")}
            isLast
          />
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow
            icon="log-out-outline"
            label="Esci dall'account"
            onPress={() => logout()}
            destructive
          />
          <SettingRow
            icon="trash-outline"
            label="Elimina account"
            onPress={handleDeleteAccount}
            destructive
            isLast
          />
        </View>

        <Text style={styles.version}>Match House v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  scroll: { paddingBottom: spacing.xxl },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 52,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDestructive: {
    backgroundColor: colors.passBg,
  },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { ...typography.body, color: colors.textPrimary },
  destructiveText: { color: colors.pass },
  rowDesc: { ...typography.caption, color: colors.textMuted },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 34 + spacing.md,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
