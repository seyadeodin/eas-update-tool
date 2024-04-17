"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ config }) => ({
    ...config,
    name: process.env.NAME || 'Fair e-Gestão',
    owner: "egestao",
    slug: "fair",
    version: process.env.EXPO_PUBLIC_VERSION,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/logo-egestao.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    updates: {
        fallbackToCacheTimeout: 0,
        url: "https://u.expo.dev/aae3bb74-90f1-45a2-a113-15bbe9b9a241"
    },
    assetBundlePatterns: [
        "**/*"
    ],
    ios: {
        bundleIdentifier: process.env.BUNDLE_IDENTIFIER,
        buildNumber: process.env.BUILD_NUMBER,
    },
    android: {
        versionCode: Number(process.env.VERSION_CODE),
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#1a4f96",
        },
        package: process.env.BUNDLE_IDENTIFIER,
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    extra: {
        eas: {
            "projectId": "acd54af1-699d-4467-961a-649d520ef39e"
        }
    }
});
