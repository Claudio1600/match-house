import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Match House",
  slug: "match-house",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    backgroundColor: "#FFFFFF",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.matchhouse.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
    },
    package: "com.matchhouse.app",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Consenti l'accesso alle foto per aggiungere immagini al tuo profilo.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    newArchEnabled: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    wsUrl: process.env.EXPO_PUBLIC_WS_URL,
  },
});
