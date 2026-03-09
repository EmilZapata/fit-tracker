# Fit Tracker

A gym and fitness tracking mobile app built with Expo, React Native, and TypeScript.

## Tech Stack

- **Framework:** Expo SDK 55 + React Native 0.83
- **Routing:** Expo Router (file-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Authentication:** Clerk
- **State & Caching:** TanStack React Query v5 + MMKV
- **Animations:** React Native Reanimated 4
- **Internationalization:** i18next + react-i18next

## Project Structure

```
app/
  _layout.tsx              # Root layout (Clerk provider, theme, splash screen)
  (app)/
    _layout.tsx            # Authenticated app layout
    (tabs)/
      _layout.tsx          # Tab navigator (Home, Profile, History, etc.)
      index.tsx            # Home screen
      profile/             # Profile tab (nested routes)
      history.tsx          # Workout history
      workout.tsx          # Workout screen
      exercises.tsx        # Exercises catalog
      active-workout.tsx   # Active workout tracking
components/                # Reusable UI components
core/constants/            # Shared constants (colors, themes)
```

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Expo CLI
- iOS Simulator / Android Emulator (or physical device with Expo Go)

### Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:EmilZapata/fit-tracker.git
   cd fit-tracker
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file with your Clerk publishable key:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
   ```

4. Start the development server:
   ```bash
   pnpm start
   ```

5. Run on a platform:
   ```bash
   pnpm ios
   pnpm android
   pnpm web
   ```
