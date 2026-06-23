# MSukasha App — Play Store Deployment Package

This package takes your uploaded screens/components and turns them into a complete,
buildable Expo project. Below is exactly what was fixed, what's still missing (assets/config
only I couldn't generate), and the exact commands to get this onto the Play Store.

---

## 1. What was broken (and is now fixed)

| Issue | Detail |
|---|---|
| **Missing `BlogScreen.js` and `CareersScreen.js`** | `App.js` imported these but they didn't exist in any uploaded file — the app would have crashed immediately on launch (module not found). Built both from scratch, matching your existing screen style. |
| **`RegisterScreen.js` crash** | Used `COLORS.orange`, `COLORS.dark` etc. throughout but never imported `COLORS` — would crash the instant a user opened the Register screen. Fixed the import. |
| **`ChatScreen.js`, `HelpScreen.js`, `PostAdScreen.js` crashes** | Same bug pattern — each aliases `COLORS`/`RADIUS` to a unique name (e.g. `COLORS as CC`) but the `StyleSheet.create()` block at the bottom used the un-aliased `COLORS`/`RADIUS` names, which were never defined in that file. This would crash Chat, Help, and **Post Ad** (a core feature) on open. Fixed all references (118 errors caught by static analysis, now 0). |
| **No `babel.config.js`** | Required for Metro to bundle anything — without it the app fails to build at all. Added. |
| **No `eas.json`** | Required for EAS Build. Added with `development`, `preview`, and `production` (AAB) profiles. |
| **No app icons/splash assets** | `icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png` were referenced in `app.json` but didn't exist — build would fail. Generated simple placeholder branded assets (orange "M" logo matching your splash screen). **You should replace these with real designed assets before public launch** — see Section 4. |
| **Outdated Expo SDK 50 (Dec 2023)** | Google Play now requires new apps to target **Android API level 35+**. SDK 50 cannot do this. Upgraded the dependency stack to **Expo SDK 56** (current as of June 2026), matching React Native 0.85 / React 19.2. |
| **Unused/risky permissions** | `app.json` declared `CAMERA`, `READ/WRITE_EXTERNAL_STORAGE`, and location permissions, but no screen actually uses the camera or location — only the photo *library* picker (in Post Ad). Declaring unused sensitive permissions creates extra Play Console review friction for nothing, so these were removed. The image picker plugin now requests only library access. |
| **Deprecated splash config** | Old `app.json` used the legacy top-level `"splash"` key, deprecated since SDK 52. Switched to the `expo-splash-screen` config plugin. |
| **Fragile API error handling** | If your Vercel backend ever returns a non-JSON response (cold start, 500 HTML page), the app would throw a confusing raw `SyntaxError` to users. Now shows a clean message instead. |
| **Missing `react-native-gesture-handler` import** | Required at the top of the entry file for reliable Android swipe-back gestures with React Navigation v7. Added. |

All 32 JS files were also run through automated syntax + undefined-variable checks — **zero errors remain.**

---

## 2. Project structure

```
msukasha-app/
├── App.js                  ← navigation root (was app_navigation.js)
├── app.json                ← Expo config (updated)
├── eas.json                ← EAS Build profiles (new)
├── babel.config.js         ← (new, was missing)
├── package.json            ← updated to Expo SDK 56
├── assets/                 ← placeholder icons (replace before launch)
└── src/
    ├── constants/index.js  ← colors, API_URL, categories, cities
    ├── services/api.js     ← all backend calls, cart/wishlist/auth
    └── screens/            ← all 28 screens, one file each
```

---

## 3. Get it running — exact commands

```bash
cd msukasha-app
npm install

# Auto-corrects every Expo package to the exact compatible version —
# always run this after I hand off a project, since I can pin close
# versions but only this command guarantees exact compatibility.
npx expo install --fix

# Sanity check — flags any remaining config/dependency issues
npx expo-doctor
```

If `expo-doctor` flags anything, fix those first — it's the authoritative check, more
reliable than anything I can verify without actually running your native build.

Test it locally with **Expo Go** or a **dev build**:
```bash
npx expo start
```

---

## 4. Before you submit — things only you can do

I don't have your Expo or Google accounts, and this sandbox can't reach Google's
servers, so these steps need to happen on your machine:

### a) Real app icon & splash screen
The current `assets/*.png` files are plain placeholders I generated (orange square,
white "M"). They'll build fine, but you'll want real designed assets before a public
launch — Play Store listing conversion is very sensitive to icon quality. Replace:
- `assets/icon.png` (1024×1024, no transparency)
- `assets/adaptive-icon.png` (1024×1024, transparent background, Android adaptive icon foreground)
- `assets/splash-icon.png` (transparent, shown centered on `#1a2332` per `app.json`)
- `assets/favicon.png`

gh auth login
git branch -m master main
git remote add origin https://github.com/admmsukasha-svg/msukasha-app.git
git push -u origin main
```
This generates a real `projectId` — paste it into `app.json` under `extra.eas.projectId`
(currently `"YOUR_EAS_PROJECT_ID"`).

### c) Confirm your production backend URL
`src/constants/index.js` currently points to:
```
https://msukasha-backend-git-main-msukasha.vercel.app
```
That looks like a Vercel **git-branch preview URL**, not a stable production domain.
Since this gets compiled into the app binary, if that branch is ever renamed/deleted
your live app breaks with no way to fix it except a new store release. If you have a
custom domain or a stable Vercel production URL for the backend, switch to that here
before building.

### d) Build
```bash
# Quick installable APK for testing on your own phone first
eas build --platform android --profile preview

# Store-ready AAB
eas build --platform android --profile production
```

### e) Google Play Console (one-time setup, ~$25 registration fee)
1. Create a developer account at https://play.google.com/console if you don't have one.
2. Create a new app → fill in store listing (title, description, screenshots).
3. Complete the **Data safety** form — be accurate about what you collect (account info,
   email, phone, location of listings if applicable). Since the app only requests photo
   library access now, this section should be short.
4. Add a **Privacy Policy URL** — required for any app with accounts/login. If
   msukasha.com doesn't have one yet, you'll need to publish one before submission.
5. Complete the content rating questionnaire.
6. Upload your `.aab` from step (d), or run:
   ```bash
   eas submit --platform android
   ```
   (first run will walk you through linking your Play Console service account interactively).

### f) Things I flagged but didn't change
- `TradeAssuranceScreen`, `SafetyTipsScreen`, `BuyingGuidesScreen`, `VerifiedSuppliersScreen`,
  `LogisticsScreen` are intentionally simple — fine for launch, but you may want to expand
  them later with real content/CMS-backed data.
- Blog posts and Careers job listings are currently static placeholder content I wrote —
  swap in your real posts/openings, or wire them up to a backend endpoint later.

---

## 5. Quick pre-flight checklist

- [ ] `npx expo install --fix` run, `npx expo-doctor` clean
- [ ] Real icon/splash assets in place
- [ ] `eas.json` / `app.json` `projectId` filled in
- [ ] Production backend URL confirmed stable
- [ ] Tested `preview` APK build on a real Android device
- [ ] Privacy policy URL live
- [ ] Play Console store listing + data safety form complete
