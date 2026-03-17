import type { ConfigContext, ExpoConfig } from "expo/config";

const appVersion = "0.3.0";
const iosBuildNumber = process.env.IOS_BUILD_NUMBER ?? "3";
const androidVersionCode = Number.parseInt(process.env.ANDROID_VERSION_CODE ?? "3", 10);

if (!Number.isInteger(androidVersionCode) || androidVersionCode < 1) {
  throw new Error("ANDROID_VERSION_CODE must be a positive integer.");
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Myra",
  slug: "myra",
  scheme: "myra",
  version: appVersion,
  orientation: "portrait",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  assetBundlePatterns: ["**/*"],
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#12161b"
  },
  updates: {
    fallbackToCacheTimeout: 0,
    ...(process.env.EXPO_UPDATES_URL ? { url: process.env.EXPO_UPDATES_URL } : {})
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  plugins: [
    "expo-asset",
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Myra uses your location to find nearby stores for your recommendations."
      }
    ]
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER ?? "com.robertmitchell.myra",
    buildNumber: iosBuildNumber,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Myra uses your location to find nearby stores for your recommendations."
    }
  },
  android: {
    package: process.env.ANDROID_PACKAGE ?? "com.robertmitchell.myra",
    versionCode: androidVersionCode,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#12161b"
    },
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
    ...(process.env.EAS_PROJECT_ID
      ? {
          eas: {
            projectId: process.env.EAS_PROJECT_ID
          }
        }
      : {})
  }
});
