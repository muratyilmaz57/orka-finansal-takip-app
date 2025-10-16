import { config } from "dotenv";
import { ExpoConfig } from "expo/config";

config({ path: ".env" });

const APP_NAME = "Orka Finansal Takip";

const expoConfig: ExpoConfig = {
  name: APP_NAME,
  slug: "orka-finansal-takip",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "orka-finansal-takip",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    orkaApiKey: process.env.ORKA_API_KEY ?? "",
    orkaBaseUrl: process.env.ORKA_BASE_URL ?? "https://admin.orka.com.tr",
  },
  extraBase64: [],
};

export default expoConfig;
