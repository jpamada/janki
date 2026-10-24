
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Janki",
  slug: "janki",
  version: "1.0.0",
  owner: "jpamada.me",
  orientation: "portrait",

  icon: "./assets/images/janki-app-icon.png",
  scheme: "mobile",
  userInterfaceStyle: "automatic",

  ios: {
    icon: "./assets/images/janki-app-icon.png",
  },

  android: {
    package: "com.jpamada.mobile",
    predictiveBackGestureEnabled: false,
    blockedPermissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.MANAGE_EXTERNAL_STORAGE",
      "android.permission.RECORD_AUDIO",
    ],
  },

  web: {
    output: "static",
    favicon: "./assets/images/janki-icon-dark.png",
    bundler: "metro",
  },

  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/janki-icon-dark.png",
        dark: {
          image: "./assets/images/janki-icon-light.png",
          backgroundColor: "#171717",
        },
        imageWidth: 200,
      },
    ],
    [
      "expo-audio",
      {
        recordAudioAndroid: false,
        microphonePermission: false,
        enableBackgroundPlayback: false,
        enableBackgroundRecording: false,
      },
    ],

    "expo-router",
    "expo-sqlite",
    "expo-image",
    "expo-asset",
    "expo-sharing",
    "expo-web-browser",
    "@actualwave/react-native-codeditor",
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    router: {},
    eas: {
      projectId: "ce4fde39-4df1-46bc-a3f4-ebc889c53765"
    },
  },
};

if (process.env.APP_VARIANT === "development") {
  config.name = "Janki Dev";

  config.android = {
    ...config.android,
    package: "com.jpamada.mobile.dev",
  };

  config.ios = {
    ...config.ios,
    bundleIdentifier: "com.jpamada.mobile.dev",
  };
}

export default config;
