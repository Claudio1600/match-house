import React from "react";
import { Tabs, Redirect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { colors, spacing } from "../../utils/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  focused: boolean;
  label: string;
  icon: IconName;
  iconFocused: IconName;
}

function TabIcon({ focused, label, icon, iconFocused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? iconFocused : icon}
        size={22}
        color={focused ? colors.textPrimary : colors.textMuted}
      />
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
        name="explore/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Esplora" icon="grid-outline" iconFocused="grid" />
          ),
        }}
      />
      <Tabs.Screen
        name="map/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Mappa" icon="map-outline" iconFocused="map" />
          ),
        }}
      />
      <Tabs.Screen
        name="matches/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Match" icon="heart-outline" iconFocused="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Chat" icon="chatbubbles-outline" iconFocused="chatbubbles" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profilo" icon="person-outline" iconFocused="person" />
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
    height: 64,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: spacing.xs,
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
