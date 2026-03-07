# React Native Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /websites/reactnative_dev | react-native 0.83.x

## Core Components

### Basic Components
- **View** - Most fundamental component for building a UI (container with flexbox, style, touch handling, accessibility). Maps to `ViewGroup` on Android, `UIView` on iOS.
- **Text** - Component for displaying and styling strings of text with touch event handling. Maps to `TextView` on Android, `UITextView` on iOS.
- **Image** - Component for displaying different types of images (network, static, local disk).
- **TextInput** - Component for inputting text into the app via a keyboard.
- **Pressable** - Wrapper component that can detect various stages of press interactions on any of its children.
- **ScrollView** - Generic scrolling container that can host multiple components and views. Renders all children at once; requires bounded height. Best for small to medium content.
- **StyleSheet** - Abstraction layer similar to CSS stylesheets.

### List Components
- **FlatList** - Performant scrolling list for large datasets with lazy rendering, separator support, multiple columns, and infinite scroll loading. Preferred over ScrollView for long lists.
- **SectionList** - Like FlatList but with section headers.

### Other Components
- **ActivityIndicator** - Circular loading indicator.
- **Alert** - Alert dialog with title and message.
- **KeyboardAvoidingView** - View that moves out of the way of virtual keyboard.
- **Modal** - Present content above an enclosing view.
- **StatusBar** - Component to control app status bar.
- **SafeAreaView** - Renders content within safe area boundaries.
- **RefreshControl** - Pull to refresh inside ScrollView.
- **Switch** - Toggle switch component.
- **TouchableOpacity** - Touchable with opacity feedback (prefer Pressable).

### Function Components
`View`, `Image`, `TextInput`, `Modal`, `Text`, `TouchableWithoutFeedback`, `Switch`, `ActivityIndicator`, `Button`, `SafeAreaView` are function components. Use `React.ComponentRef<typeof View>` for ref types.

## Basic App Structure

```typescript
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={{ padding: 24 }}>
          <Text style={styles.title}>Hello World</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default App;
```

## APIs

### Animated API
Declarative library for creating fluid animations. Exports animatable component types: `View`, `Text`, `Image`, `ScrollView`, `FlatList`, `SectionList`. Create custom animated components with `Animated.createAnimatedComponent()`.

### Dimensions API
```tsx
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
```

Signature:
```tsx
static get(dim: 'window' | 'screen'): ScaledSize;
```

Listen for dimension changes (e.g., rotation, foldable screens):
```tsx
static addEventListener(
  type: 'change',
  handler: ({
    window,
    screen,
  }: DimensionsValue) => void,
): EmitterSubscription;
```

### useWindowDimensions Hook
```tsx
const { height, width } = useWindowDimensions();
// Automatically updated on screen size or font scale changes
// Preferred over Dimensions.get() inside React components
```

### Alert API
```tsx
Alert.alert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
);
```

### Platform API
Detect current platform and select platform-specific values:
```tsx
import { Platform, StyleSheet } from 'react-native';

// Platform.OS returns 'ios' | 'android' | 'web'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      android: { backgroundColor: 'green' },
      ios: { backgroundColor: 'red' },
      default: { backgroundColor: 'blue' },
    }),
  },
});
```

Platform-specific component selection:
```tsx
const Component = Platform.select({
  native: () => require('ComponentForNative'),
  default: () => require('ComponentForWeb'),
})();
```

Precedence order: platform-specific key (android/ios) > `native` > `default`.

### Other APIs
- **Linking** - Interact with incoming and outgoing app links.
- **PixelRatio** - Access device pixel density.
- **AppState** - App foreground/background state.
- **BackHandler** - Handle Android back button.
- **Appearance** - Access user's appearance preferences (light/dark mode).
- **useColorScheme** - Hook for current color scheme (light/dark).

## New Architecture

The New Architecture is enabled by default. It includes Fabric (the new rendering system) and TurboModules (the new native modules system).

### Enabling in Android (`gradle.properties`)
```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true
```

### Hermes Engine
Hermes is the default JavaScript engine for React Native. It is optimized for fast startup, reduced memory usage, and smaller app size. Enabled via `hermesEnabled=true` in gradle.properties.

### Fabric Renderer
Fabric is the new rendering system that replaces the legacy renderer. It enables synchronous communication between JavaScript and native, supports concurrent features, and improves rendering performance. Activities use `DefaultReactActivityDelegate` with `fabricEnabled` to opt in.

### TurboModules
TurboModules replace the legacy Native Modules system. They provide lazy initialization (modules are loaded only when needed), direct JavaScript-to-native invocation via JSI (no bridge serialization), and type-safe interfaces via codegen from TypeScript/Flow specs.
