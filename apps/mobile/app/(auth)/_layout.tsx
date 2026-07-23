import React from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { Redirect } from "expo-router";
import { colors } from "../../utils/theme";

export default function AuthLayout() {
  const { user, accessToken } = useAuthStore();

  // If already authenticated, redirect to main app
  if (accessToken && user?.isVerified) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
