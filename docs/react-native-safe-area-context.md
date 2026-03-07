# React Native Safe Area Context Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /appandflow/react-native-safe-area-context | v5.6.2

## SafeAreaProvider

Wrap root component to enable safe area awareness across the app.

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>{/*...*/}</SafeAreaProvider>;
}
```

### initialMetrics (SSR Optimization)

Provide initial insets/frame values for immediate rendering. Useful for web SSR to prevent rendering delays caused by asynchronous insets measurement. You can also use this on native to speed up the initial render.

**Note:** You cannot use `initialMetrics` if your provider remounts, or you are using `react-native-navigation`.

```tsx
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      ...
    </SafeAreaProvider>
  );
}
```

#### initialWindowMetrics Object Structure

```typescript
{
  frame: { x: number, y: number, width: number, height: number },
  insets: { top: number, left: number, right: number, bottom: number },
}
```

## SafeAreaView

A regular `View` with safe area insets applied as padding or margin. Padding/margin styles are added to insets (e.g., `paddingTop: 10` with inset of 20 = 30 total).

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

// Apply insets to all edges (default)
<SafeAreaView>
  {/* content */}
</SafeAreaView>

// Exclude specific edges
<SafeAreaView edges={['right', 'bottom', 'left']}>
  {/* no top inset */}
</SafeAreaView>
```

### Props

Accepts all standard React Native [View](https://reactnative.dev/view#props) props.

#### `edges`
- **Type**: `Array<'top' | 'right' | 'bottom' | 'left'>` or `Object`
- Defaults to all edges
- **Array form**: specifies which edges get insets applied
- **Object form**: finer control with `EdgeMode` per edge
  - Signature: `{ top?: EdgeMode, right?: EdgeMode, bottom?: EdgeMode, left?: EdgeMode }`
  - `EdgeMode = 'off' | 'additive' | 'maximum'`
  - `'additive'` (default): `finalValue = safeAreaInset + styleValue`
  - `'maximum'`: `finalValue = max(safeAreaInset, styleValue)`

##### Example: Maximum Edge Mode

Use `'maximum'` for floating UI elements that need a minimum padding regardless of safe area:

```tsx
// Bottom padding will be at least 24px, or the safe area inset if larger
<SafeAreaView style={{ paddingBottom: 24 }} edges={{ bottom: 'maximum' }} />
```

#### `mode`
- **Type**: `'padding' | 'margin'`
- Defaults to `'padding'`
- Whether insets are applied as padding or margin

## useSafeAreaInsets Hook

Returns `{ top, right, bottom, left }` inset values.

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HookComponent() {
  const insets = useSafeAreaInsets();

  return <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} />;
}
```

## SafeAreaInsetsContext (Class Components)

```tsx
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

class ClassComponent extends React.Component {
  render() {
    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => <View style={{ paddingTop: insets.top }} />}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}
```
