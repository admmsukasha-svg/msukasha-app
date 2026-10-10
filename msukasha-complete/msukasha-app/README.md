# Msukasha mobile app (Expo / React Native) - native client for the MSUKASHA API

## Setup (once)
```bash
npx create-expo-app@latest msukasha-app --template blank
cd msukasha-app
# copy App.js, app.json, eas.json, src/ and assets/ from this folder over the new project (overwrite)
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context expo-secure-store react-native-webview
```
`npx expo install` picks versions that match your Expo SDK.

## Point it to your backend
Edit `EXPO_PUBLIC_API_URL` in `eas.json` (both profiles), e.g. `https://api.msukasha.com`.
For local testing: `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000 npx expo start`.

## Build the APK
```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview      # gives an installable .apk download link
eas build -p android --profile production   # .aab for Google Play
```
Package name is `com.msukasha.app`. Replace `assets/icon.png` with a 1024x1024 icon before the Play Store release.

## Screens
Login/Register, Home (search, categories, Retail/Wholesale filter), Product (wholesale price tiers, min order qty),
Cart, Checkout (COD / Bank transfer / JazzCash), Orders, Order detail (pay, cancel), Profile.
