## Project Overview

Fit Tracker is a gym/fitness tracking mobile app built with Expo (SDK 55), React Native, and TypeScript. The project is organized as a **Turborepo monorepo** with pnpm workspaces.

## Monorepo Structure

```
fit-tracker/
├── apps/
│   ├── mobile/          ← Expo app (React Native)
│   └── sanity-studio/   ← Sanity CMS Studio
├── packages/            ← shared packages (future)
├── docs/                ← local library documentation
├── skills/              ← best-practice guides
├── turbo.json           ← Turborepo task pipeline
├── pnpm-workspace.yaml  ← workspace declaration
└── package.json         ← root (turbo devDep)
```

**Commands:**
- `pnpm dev` — run all apps in parallel
- `pnpm dev:mobile` — run only Expo app
- `pnpm dev:studio` — run only Sanity Studio
- `pnpm build` — build all apps
- `pnpm check-types` — type-check all apps

## Architecture

**Expo Router** with file-based routing in `apps/mobile/app/`. The root layout (`apps/mobile/app/_layout.tsx`) wraps everything in a React Navigation `ThemeProvider` with dark/light mode support.

- `apps/mobile/app/(tabs)/` - Tab navigator screens (currently two placeholder tabs + modal)
- `apps/mobile/app/global.css` - Tailwind CSS entry point
- `apps/mobile/core/constants/` - Shared constants (e.g., `Colors.ts` for theme colors)
- `apps/mobile/components/` - Reusable UI components, including themed `Text`/`View` wrappers with automatic light/dark color support
- `apps/mobile/features/` - Feature modules

**Styling:** NativeWind v4 (Tailwind CSS for React Native). Configured via `apps/mobile/tailwind.config.js` with the `nativewind/preset`. Metro config wraps with `withNativeWind`. Babel config includes `nativewind/babel` preset. Prefer Tailwind classes via `className` over `StyleSheet.create`.

**Path aliases:** `@/*` maps to the workspace root (`apps/mobile/*`), configured in `apps/mobile/tsconfig.json`.

**TypeScript:** Strict mode enabled. Typed routes enabled via `experiments.typedRoutes` in `apps/mobile/app.json`.

**Sanity Studio:** Located in `apps/sanity-studio/`. Uses Sanity v5 with custom schemas in `apps/sanity-studio/schemaTypes/`.

## Local Documentation

Library docs are cached in `docs/` — consult these FIRST before making Context7 API calls:

- `docs/expo-router.md` — Expo Router ~55.0.4 (routing, navigation, Link, useRouter, tabs, layouts)
- `docs/nativewind.md` — NativeWind v4 (className, dark mode, cssInterop, themes)
- `docs/react-native.md` — React Native 0.83.x (core components, APIs, New Architecture)
- `docs/expo-sdk.md` — Expo SDK 55 (splash screen, font, constants, EAS build config)
- `docs/react-native-reanimated.md` — Reanimated 4.2.1 (animations, shared values, layout animations, gestures)
- `docs/react-native-screens.md` — React Native Screens ~4.23.0 (native stack, headers)
- `docs/react-native-safe-area-context.md` — Safe Area v5.6.2 (provider, insets, SafeAreaView)
- `docs/tailwindcss.md` — Tailwind CSS v3.4 utility classes reference
- `docs/tanstack-react-query.md` — TanStack React Query ^5.90.x (useQuery, useMutation, persistence, MMKV integration)
- `docs/react-native-mmkv.md` — MMKV ^4.2.0 (fast key-value storage, hooks, encryption, TanStack Query persister)
- `docs/i18next.md` — i18next ^25.8.x + react-i18next ^16.5.x (useTranslation, plurals, namespaces, RN setup)
- `docs/react-native-nitro-modules.md` — Nitro Modules ^0.35.0 (HybridObject, specs, Swift/Kotlin, codegen)
- `docs/turborepo.md` — Turborepo monorepo setup, tasks, filtering, and workspace management
- `docs/sanity.md` — Sanity v5 (schemas, defineType/defineField, GROQ, TypeGen, client, images)

Only use Context7 MCP when the user explicitly asks to fetch updated documentation or when the local docs don't cover the needed topic.

## Skills

Best-practice guides in `skills/`. Consult the relevant `SKILL.md` when the task matches:

- `skills/animations/` — Reanimated 4 animation patterns: CSS transitions vs CSS animations vs shared values, animating text, layout animations, performance tuning, 120fps, feature flags. Trigger on any animation-related task.
- `skills/data-fetching/` — TanStack Query v5 + MMKV: QueryClient setup with persistence, query key conventions, mutation patterns, optimistic updates, offline support. Trigger on data fetching, API calls, caching.
- `skills/i18n/` — i18next + react-i18next: project setup, translation file structure, namespace conventions, TypeScript type-safe keys, language switching with MMKV. Trigger on translations, i18n, user-facing text.
- `skills/turborepo/` — Turborepo commands, workspace management, task pipelines, filtering, adding packages. Trigger on monorepo structure changes, new packages, cross-workspace dependencies.

### Expo Plugin Skills (installed via `/plugin`)

These are available as auto-triggered plugins — no local files needed:

- **building-native-ui** — UI components, navigation, styling, animations, and native tabs with Expo Router
- **native-data-fetching** — fetch, React Query, SWR, caching, offline support, Expo Router data loaders
- **expo-tailwind-setup** — Tailwind CSS v4 / NativeWind v5 setup
- **use-dom** — DOM components for incremental web-to-native migration
- **expo-api-routes** — API routes with Expo Router + EAS Hosting
- **expo-dev-client** — Build and distribute development clients
- **expo-ui-swift-ui** / **expo-ui-jetpack-compose** — Platform-native UI components
- **upgrading-expo** — Expo SDK version upgrades and dependency fixes
- **expo-deployment** — Deploy to App Store, Play Store, web
- **expo-cicd-workflows** — EAS workflow YAML files for CI/CD

## Naming of new files

When you create a new file, you need to use kebab-case. Example: mi-file.tsx, react-native.md
