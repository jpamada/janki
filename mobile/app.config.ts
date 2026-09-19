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
      backgroundColor: "#E6F4FE",
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
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],

    "expo-router",
    "expo-sqlite",
    "expo-image",
    "expo-audio",
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
      projectId: "b5985079-f0b0-4e05-9ca3-c55b6b6e1af5",
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