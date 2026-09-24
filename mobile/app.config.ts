import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Janki",
  slug: "janki",
  version: "1.0.0",
  orientation: "portrait",

  icon: "./assets/images/icon.png",

  scheme: "mobile",

  userInterfaceStyle: "automatic",

  ios: {
    icon: "./assets/expo.icon",
  },

  android: {
    package: "com.jpamada.mobile",

    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },

    predictiveBackGestureEnabled: false,
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },

  plugins: [
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
      },
    ],

    "expo-router",
    "expo-sqlite",
    "expo-image",
    "expo-audio",
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
      projectId: "75aec871-0f6f-4482-b9f1-5f318cf4fa7a",
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