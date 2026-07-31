# Fix "Failed to resolve: project :capacitor-android"

The error "Failed to resolve: project :capacitor-android" occurs because the Capacitor Android library, which is expected to be in the `node_modules` directory, is missing. Capacitor projects manage the Android platform dependency via npm/yarn. Since the `node_modules` folder is not present in your `frontend` directory, Gradle cannot find the `:capacitor-android` project referenced in `settings.gradle`.

## Proposed Changes

### [Environment]
- Install missing npm dependencies in the `frontend` directory.
- Synchronize Capacitor to ensure the Android platform is properly linked.

## Verification Plan

### Automated Steps
1.  Run `npm install` in `C:/Users/HomePC/StudioProjects/cash-book-v11/frontend/`.
2.  Run `npx cap sync android` in `C:/Users/HomePC/StudioProjects/cash-book-v11/frontend/`.
3.  Trigger a Gradle sync in Android Studio.

### Manual Verification
- Verify that the `:capacitor-android` project is resolved in the Android Studio project structure.
- Ensure the project builds successfully.
