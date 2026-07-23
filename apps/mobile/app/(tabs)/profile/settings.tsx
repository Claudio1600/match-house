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
import { useAuthStore } from "../../../stores/authStore";
import { useAuth } from "../../../hooks/useAuth";
import { colors, radius, spacing, typography } from "../../../utils/theme";

interface SettingRowProps {
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingRow({
  label,
  description,
  onPress,
  rightElement,
  destructive = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, destructive && styles.destructiveText]}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.settingDescription}>{description}</Text>
        ) : null}
      </View>
      {rightElement ? rightElement : onPress ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
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
          onPress: () => {
            Alert.alert(
              "Non implementato",
              "Contatta support@matchhouse.app per eliminare il tuo account"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingRow
              label="Email"
              description={user?.email}
            />
            <View style={styles.divider} />
            <SettingRow
              label="Tipo account"
              description={
                user?.userType === "LANDLORD"
                  ? "Proprietario"
                  : "Cerca stanza"
              }
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICHE</Text>
          <View style={styles.card}>
            <SettingRow
              label="Notifiche push"
              description="Nuovi match e messaggi"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: colors.border,
                    true: colors.smash,
                  }}
                  thumbColor={colors.background}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              label="Email"
              description="Riepilogo settimanale"
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{
                    false: colors.border,
                    true: colors.smash,
                  }}
                  thumbColor={colors.background}
                />
              }
            />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          <View style={styles.card}>
            <SettingRow
              label="Termini di servizio"
              onPress={() =>
                Alert.alert("Termini di servizio", "Apertura browser...")
              }
            />
            <View style={styles.divider} />
            <SettingRow
              label="Informativa sulla privacy"
              onPress={() =>
                Alert.alert("Privacy policy", "Apertura browser...")
              }
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALTRO</Text>
          <View style={styles.card}>
            <SettingRow
              label="Esci dall'account"
              onPress={() => logout()}
              destructive
            />
            <View style={styles.divider} />
            <SettingRow
              label="Elimina account"
              onPress={handleDeleteAccount}
              destructive
            />
          </View>
        </View>

        <Text style={styles.version}>Match House v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    minHeight: 56,
  },
  settingContent: { flex: 1, gap: 2 },
  settingLabel: { ...typography.body, color: colors.textPrimary },
  destructiveText: { color: colors.pass },
  settingDescription: { ...typography.caption, color: colors.textMuted },
  chevron: { ...typography.h3, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md },
  version: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    padding: spacing.xl,
  },
});
