# Expo Router Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /websites/expo_dev_versions_v55_0_0 (expo-router ~55.0.4, Expo SDK 55)

## useLocalSearchParams

Returns the URL parameters for the currently focused route, combining both route parameters and search parameters. Ideal for stacks where a new screen might be pushed, altering query parameters. For example, with a URL like `acme://profile/baconbrix?extra=info`, it returns `{ user: 'baconbrix', extra: 'info' }`.

```typescript
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Route() {
  // user=baconbrix & extra=info
  const { user, extra } = useLocalSearchParams();

  return <Text>User: {user}</Text>;
}
```

### Comparing useLocalSearchParams vs useGlobalSearchParams

```typescript
import { Text, View } from 'react-native';
import { useLocalSearchParams, useGlobalSearchParams, Link } from 'expo-router';

const friends = ['charlie', 'james']

export default function Route() {
  const glob = useGlobalSearchParams();
  const local = useLocalSearchParams();

  console.log("Local:", local.user, "Global:", glob.user);

  return (
    <View>
      <Text>User: {local.user}</Text>
      {friends.map(friend => (
        <Link key={friend} href={`/${friend}`}>
          Visit {friend}
        </Link>
      ))}
    </View>
  );
}
```

### Typed Parameters

```typescript
import { useLocalSearchParams } from 'expo-router';

export default function User() {
  const {
    user, // route parameter (always present if matched)
    tab,  // optional search parameter (from query string)
  } = useLocalSearchParams<{ user: string; tab?: string }>();

  console.log({ user, tab });
}
```

### Full Href Type for Typed Route Parameters

```typescript
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Page() {
  const {
    profile, // string
    search,  // string[]
  } = useLocalSearchParams<'/(search)/[profile]/[...search]'>();

  return (
    <>
      <Text>Profile: {profile}</Text>
      <Text>Search: {search.join(',')}</Text>
    </>
  );
}
```

## useGlobalSearchParams

Returns URL parameters for the globally selected route, including dynamic path segments. This hook updates even when the route is not focused, making it useful for analytics or background operations. When querying search parameters within a stack, prefer `useLocalSearchParams()` as it only updates when the route is focused.

```typescript
import { Text } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';

export default function Route() {
  // user=baconbrix & extra=info
  const { user, extra } = useGlobalSearchParams();

  return <Text>User: {user}</Text>;
}
```

## usePathname

Returns the current route's location string, excluding any search parameters. Normalizes segments for consistent path representation. For example, `/acme?foo=bar` returns `/acme`.

```typescript
import { Text } from 'react-native';
import { usePathname } from 'expo-router';

export default function Route() {
  // pathname = "/profile/baconbrix"
  const pathname = usePathname();

  return <Text>Pathname: {pathname}</Text>;
}
```

## useRouter Hook

Returns the Router object for imperative navigation actions like pushing, replacing, or popping routes.

### Router Methods
- `push(path)` - Navigate to a new route (pushes onto stack)
- `replace(path)` - Replace the current route (no new history entry)
- `pop()` / `back()` - Go back to the previous route
- `navigate(path)` - Push or unwind to existing route on stack

```typescript
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

export default function Route() {
  const router = useRouter();
  return (
    <Text onPress={() => router.push('/home')}>Go Home</Text>
  );
}
```

### Imperative Navigation (without hook)

You can also import the `router` object directly for imperative navigation outside of components or where the hook is not convenient.

```javascript
import { router } from 'expo-router';
import { Text } from 'react-native';

export default function Route() {
  return (
    <Text onPress={() => router.push('/home')}>Go Home</Text>
  );
}
```

### Imperative Redirect with useFocusEffect

```javascript
import { Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

function MyScreen() {
  const router = useRouter();

  useFocusEffect(() => {
    router.replace('/profile/settings');
  });

  return <Text>My Screen</Text>;
}
```

### router.replace(href, options)

Navigates to route without appending to the history.

```typescript
router.replace('/login');
router.replace({ pathname: '/dashboard', params: { status: 'active' } });
```

## Link Component

Renders a navigation link using the `href` prop. By default, wraps children in a `<Text>` component. On the web, renders an anchor tag (`<a>`) with client-side navigation to preserve website state and improve navigation speed. Web-specific attributes like `target`, `rel`, and `download` are supported and passed to the anchor tag.

```typescript
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function Route() {
  return (
    <View>
      <Link href="/about">About</Link>
    </View>
  );
}
```

### Dynamic Route with Typed Params

```typescript
// Simple string href
<Link href="/about" />

// Dynamic route with typed params
<Link href={{ pathname: "/user/[id]", params: { id: 1 } }} />
```

### Typed Routes

Components and functions that use `Href<T>` are statically typed:
- `<Link href="/about" />` -- valid
- `<Link href="/user/1" />` -- valid
- `` <Link href={`/user/${id}`} /> `` -- valid
- `<Link href={("/user" + id) as Href} />` -- valid (cast)
- `<Link href="/usser/1" />` -- TypeScript error

For dynamic routes, Href's need to be objects with strictly typed params:
- `<Link href={{ pathname: "/user/[id]", params: { id: 1 }}} />` -- valid
- `<Link href="/user/[id]" />` -- error, should be HrefObject with params
- `<Link href={{ pathname: "/user/[id]", params: { _id: 1 }}} />` -- error, invalid param keys

## Stack Navigation

Default navigation in Expo Router. Navigating pushes a screen onto a stack, backing out pops it.

```typescript
import { Stack } from 'expo-router';
```

### Modal Presentation

```typescript
import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(root)',
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(root)" />
      <Stack.Screen
        name="sign-in"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

## Tab Navigation

### Standard Tabs

```typescript
import { Stack, Tabs, Link } from 'expo-router';
```

### Custom Tabs (expo-router/ui)

For custom tab layouts, use the components from `expo-router/ui`:

```javascript
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
```

```jsx
<Tabs>
  <TabSlot />
  <TabList>
    <TabTrigger name="home" href="/" />
  </TabList>
</Tabs>
```

### NativeTabs (unstable)

```typescript
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home" />
      <NativeTabs.Trigger name="settings" />
    </NativeTabs>
  );
}
```

### useTabsWithChildren Hook

Hook version of `Tabs`. The returned `NavigationContent` component should be rendered.

```javascript
import { useTabsWithChildren } from 'expo-router/ui';

export function MyTabs({ children }) {
  const { NavigationContent } = useTabsWithChildren({ children });

  return <NavigationContent />;
}
```

## File-Based Routing Conventions

- **app directory**: Special directory containing only routes and their layouts
- **Root layout**: `app/_layout.tsx` - defines shared UI elements (headers, tab bars)
- **Dynamic routes**: `[param]` for single params, `[...catchAll]` for catch-all
- **Route groups**: `(groupName)` folders for organization without affecting URL
- **Layout files**: `_layout.tsx` wraps child routes with navigators
