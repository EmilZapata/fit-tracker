# Expo SDK 55 Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /websites/expo_dev_versions_v55_0_0 | Expo SDK 55

## expo-splash-screen

### Config Plugin (Recommended)

Configure in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#232323",
          "image": "./assets/splash-icon.png",
          "dark": {
            "image": "./assets/splash-icon-dark.png",
            "backgroundColor": "#000000"
          },
          "imageWidth": 200
        }
      ]
    ]
  }
}
```

Properties:
- `backgroundColor` - Background color of splash screen (6 character hex string)
- `image` - Path to splash image (must be .png)
- `dark.image` - Dark mode splash image
- `dark.backgroundColor` - Dark mode background color
- `imageWidth` - Width of the splash image (default: 200)

### app.json `splash` Configuration

You can also configure the splash screen directly in `app.json` under the `splash` key:

```json
{
  "expo": {
    "splash": {
      "backgroundColor": "#ffffff",
      "resizeMode": "cover",
      "image": "./assets/splash.png"
    }
  }
}
```

Properties:
- `backgroundColor` (string) - Color to fill the loading screen background (6 character hex)
- `resizeMode` (enum) - How the image is displayed: `cover` or `contain` (default: `contain`)
- `image` (string) - Local path or remote URL to a .png image

### Android-Specific Splash Configuration

Configure per-density splash images and dark mode under `android.splash`:

```json
{
  "expo": {
    "android": {
      "splash": {
        "mdpi": "./assets/splash-mdpi.png",
        "hdpi": "./assets/splash-hdpi.png",
        "xhdpi": "./assets/splash-xhdpi.png",
        "xxhdpi": "./assets/splash-xxhdpi.png",
        "xxxhdpi": "./assets/splash-xxxhdpi.png",
        "dark": {
          "backgroundColor": "#000000",
          "image": "./assets/splash-dark.png"
        }
      }
    }
  }
}
```

Android density properties: `mdpi` (natural), `hdpi` (1.5x), `xhdpi` (2x), `xxhdpi` (3x), `xxxhdpi` (4x). Each accepts a local path or remote URL to a .png. The `dark` object supports `backgroundColor`, `resizeMode`, `image`, and per-density overrides.

### API: Controlling Splash Screen Visibility

**Prevent auto-hide:**

```javascript
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
```

**Hide the splash screen:**

```javascript
SplashScreen.hide();
```

**Configure fade-out animation:**

```javascript
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
```

### Full Example with Expo Router

```typescript
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function doAsyncStuff() {
      try {
        // load resources, fetch data, etc.
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    doAsyncStuff();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <Stack />;
}
```

## expo-font

### Config Plugin (Recommended for Android and iOS)

Embedding fonts at build time via the config plugin is more efficient than loading at runtime. After configuring the plugin and running prebuild, custom fonts are available immediately.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./path/to/file.ttf"],
          "android": {
            "fonts": [
              {
                "fontFamily": "Source Serif 4",
                "fontDefinitions": [
                  {
                    "path": "./path/to/SourceSerif4-ExtraBold.ttf",
                    "weight": 800
                  }
                ]
              }
            ]
          }
        }
      ]
    ]
  }
}
```

### Runtime Loading with `useFonts` Hook

For web support or dynamic font loading, use the `useFonts` hook. This works across all platforms including web.

```javascript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }}>Inter Black</Text>
      <Text style={{ fontSize: 30 }}>Platform Default</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**`useFonts` API:**
- Accepts a map of font names to font assets
- Returns `[loaded: boolean, error: Error | null]`
- Internally uses `Font.loadAsync`
- Fonts are not reloaded when the font map changes dynamically

## expo-constants

### Installation

```bash
npx expo install expo-constants
```

### Usage

```javascript
import Constants from 'expo-constants';
```

Provides system information that remains constant throughout the lifetime of your app's installation.

### Key Properties

| Property | Type | Description |
|---|---|---|
| `debugMode` | `boolean` | `true` when running in debug mode (`__DEV__`) |
| `deviceName` | `string` | Human-readable name for the device type |
| `executionEnvironment` | `ExecutionEnvironment` | Current execution environment |
| `easConfig` | `ManifestsEASConfig | null` | Standard EAS config object (populated when using EAS) |
| `expoConfig` | `ExpoConfig | null` | Standard Expo config from app.json / app.config.js |
| `expoGoConfig` | `ManifestsExpoGoConfig | null` | Expo Go config (populated when running in Expo Go) |
| `expoRuntimeVersion` | `string | null` | Runtime version (nullable on web) |
| `expoVersion` | `string | null` | Expo Go app version (`null` in bare workflow and web) |
| `isHeadless` | `boolean` | `true` if running in headless mode |
| `manifest2` | `ExpoUpdatesManifest | null` | Manifest for modern Expo Updates from a remote source |
| `platform` | `PlatformManifest` | Platform-specific manifest object |
| `sessionId` | `string` | Unique string for the current app session |
| `statusBarHeight` | `number` | Default status bar height for the device |
| `systemFonts` | `string[]` | List of system font names available on the device |

### Platform-Specific Manifests

**`IOSManifest`** properties:
- `buildNumber` (string | null) - From `CFBundleVersion` in Info.plist. Set via `ios.buildNumber` in app.json.
- `model` (string | null) - Deprecated: use `expo-device` `Device.modelName`
- `platform` (string) - Deprecated: use `expo-device` `Device.modelId`
- `systemVersion` (string) - Deprecated: use `expo-device` `Device.osVersion`
- `userInterfaceIdiom` (UserInterfaceIdiom) - Deprecated: use `expo-device` `Device.getDeviceTypeAsync()`

**`AndroidManifest`** properties:
- `versionCode` (number) - Deprecated: use `expo-application` `Application.nativeBuildVersion`

### Methods

- `getWebViewUserAgentAsync()` - Returns `Promise<string | null>` with the user agent string for web views on this device.

### Deprecated Properties

- `appOwnership` - Use `Constants.executionEnvironment` instead
- `deviceYearClass` - Moved to `expo-device` as `Device.deviceYearClass`

## EAS Build (eas.json)

### Environment Variables per Build Profile

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "preview"
      }
    },
    "production": {
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

### Profile Inheritance with `extends`

```json
{
  "build": {
    "production": {
      "node": "16.13.0",
      "env": {
        "API_URL": "https://company.com/api"
      }
    },
    "preview": {
      "extends": "production",
      "distribution": "internal",
      "env": {
        "API_URL": "https://staging.company.com/api"
      }
    }
  }
}
```

### Managed Project Full Example

```json
{
  "build": {
    "base": {
      "node": "12.13.0",
      "yarn": "1.22.5",
      "env": {
        "EXAMPLE_ENV": "example value"
      },
      "android": {
        "image": "default",
        "env": { "PLATFORM": "android" }
      },
      "ios": {
        "image": "latest",
        "env": { "PLATFORM": "ios" }
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "env": { "ENVIRONMENT": "development" },
      "android": {
        "distribution": "internal",
        "withoutCredentials": true
      },
      "ios": { "simulator": true }
    },
    "staging": {
      "extends": "base",
      "env": { "ENVIRONMENT": "staging" },
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "extends": "base",
      "env": { "ENVIRONMENT": "production" }
    }
  }
}
```

### Build Variants

Use `APP_VARIANT` env var in `eas.json` to drive `app.config.js` evaluation:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "env": { "APP_VARIANT": "development" }
    },
    "production": {}
  }
}
```

## Notes

For detailed docs on `expo-linking`, `expo-status-bar`, `expo start`, EAS Deploy, assets, and icons, consult https://docs.expo.dev
