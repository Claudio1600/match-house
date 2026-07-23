import React from "react";
import { Tabs } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { Redirect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../../utils/theme";

interface TabIconProps {
  focused: boolean;
  label: string;
  icon: string;
}

function TabIcon({ focused, label, icon }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user?.isVerified) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Esplora" icon="◎" />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Match" icon="◇" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Chat" icon="◻" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profilo" icon="◯" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: spacing.xs,
  },
  tabIconText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  tabIconTextActive: {
    color: colors.textPrimary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
});
