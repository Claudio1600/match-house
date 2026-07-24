import React from "react";
import { Tabs, Redirect } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "rgba(255,255,255,0.35)";

interface TabIconProps {
  focused: boolean;
  icon: IconName;
  iconFocused: IconName;
}

function TabIcon({ focused, icon, iconFocused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.activeIndicator} />}
      <Ionicons
        name={focused ? iconFocused : icon}
        size={23}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
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
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="explore/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="grid-outline" iconFocused="grid" />
          ),
        }}
      />
      <Tabs.Screen
        name="map/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="map-outline" iconFocused="map" />
          ),
        }}
      />
      {/* matches/index is hidden — its content is merged into chat/index */}
      <Tabs.Screen
        name="matches/index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="heart-outline" iconFocused="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person-outline" iconFocused="person" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#111111",
    borderTopWidth: 0,
    height: Platform.OS === "android" ? 62 : 72,
    elevation: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  activeIndicator: {
    position: "absolute",
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
});
