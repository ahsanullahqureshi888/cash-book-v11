# Fix "Failed to resolve: project :capacitor-android" - Walkthrough

The issue was caused by missing Capacitor dependencies in the `node_modules` directory, which prevented Gradle from finding the `:capacitor-android` project.

## Changes Made

### [Environment]
- **Dependency Installation**: Ran `npm install` in the `frontend` directory to restore all required packages, including `@capacitor/android`.
- **Web Asset Build**: Ran `npm run build` to generate the `dist` directory required for Capacitor synchronization.
- **Capacitor Sync**: Ran `npx cap sync android` to link the web assets and plugins to the Android project.

## Verification Results

### Automated Steps
- [x] `npm install`: Successfully installed 415 packages.
- [x] `npm run build`: Successfully generated web assets in the `dist` folder.
- [x] `npx cap sync android`: Successfully synchronized assets and plugins to the Android platform.
- [x] Directory Verification: Confirmed that `node_modules/@capacitor/android/capacitor` now exists.

> [!TIP]
> You should now be able to sync your project in Android Studio without the ":capacitor-android" error. If the error persists, please try **File > Sync Project with Gradle Files**.
