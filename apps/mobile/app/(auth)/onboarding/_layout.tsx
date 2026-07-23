import React from "react";
import { Stack } from "expo-router";
import { colors } from "../../../utils/theme";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="landlord" />
      <Stack.Screen name="seeker" />
    </Stack>
  );
}
