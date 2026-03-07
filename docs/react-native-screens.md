# React Native Screens Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /software-mansion/react-native-screens | ~4.23.0

## Overview

React Native Screens exposes native navigation container components to React Native. It serves as a dependency for navigation libraries like react-navigation.

## Native Stack Navigator

```javascript
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        headerTintColor: 'white',
        headerStyle: { backgroundColor: 'tomato' },
      }}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Awesome app',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'My profile',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
```

## ScreenContainer & Screen

`ScreenContainer` is a container for one or more `Screen` components. It does not accept other component types as direct children. Its role is to control which of its children's screens should be attached to the view hierarchy by monitoring the `activityState` property of each child.

For best efficiency, keep the number of active screens to a minimum. In stack or tab navigators, only one screen should typically be active (the topmost view or selected tab). During transitions, a second screen may be temporarily activated.

Control screen visibility with the `activityState` prop:

- `0` -- The parent container detaches the screen's views from the native view hierarchy.
- `1` -- The screen stays attached but does not respond to touches on iOS. Use this during transitions or modal presentations where the previous screen should be visible but not interactive.
- `2` -- The screen is fully attached and responds to touches as long as the parent container is also attached. Setting this value is interpreted as the end of a transition.

```jsx
<ScreenContainer>
  <Screen>{tab1}</Screen>
  <Screen activityState={2}>{tab2}</Screen>
  <Screen>{tab3}</Screen>
</ScreenContainer>
```

## Header Configuration

The `ScreenStackHeaderConfig` component is rendered as a direct child of `Screen`. It configures the native navigation header rendered as part of the native screen stack. It acts as a "virtual" element (not directly rendered under `Screen`) whose properties customize the platform-native header. You can also render React Native components inside it to display in the header (e.g. title area or sides).

The `headerConfig` prop on `ScreenStackItem` provides an alternative inline approach for configuring headers:

```jsx
<ScreenStack>
  <ScreenStackItem
    headerConfig={{
      title: 'First screen',
      headerLargeTitle: true,
      children: <>
        <ScreenStackHeaderRightView>
          <Button title="Save" />
        </ScreenStackHeaderRightView>
      </>,
    }}>
    {/* content of the first screen */}
  </ScreenStackItem>
  <ScreenStackItem
    headerConfig={{
      title: 'Second screen',
    }}>
    {/* content of the second screen */}
  </ScreenStackItem>
</ScreenStack>
```

Set the `hidden` property to `true` on `ScreenStackHeaderConfig` to hide the header while the parent `Screen` is on top of the stack. The default value is `false`.

## enableScreens

Disable native screens to revert to plain React Native Views:

```javascript
import { enableScreens } from 'react-native-screens';

enableScreens(false); // revert to plain Views
```

## Header Height Hooks

```tsx
// Static measurement -- use when header height won't change dynamically
// or when the screen is heavy (beware of performance in heavy components)
import { useHeaderHeight } from 'react-native-screens/native-stack';

// Dynamic measurement using Animated.Value
import { useAnimatedHeaderHeight } from 'react-native-screens/native-stack';

// Dynamic measurement using Reanimated
// Wrap your Stack.Navigator with ReanimatedScreenProvider before using this hook
import { useReanimatedHeaderHeight } from 'react-native-screens/reanimated';
```

## Android: Activity State Persistence

Override `onCreate` in `MainActivity.java` to prevent crashes on Android Activity restarts. This discards any persisted Activity state to avoid inconsistencies. Place this override directly in `MainActivity`, not in `MainActivityDelegate`.

```java
import android.os.Bundle;

public class MainActivity extends ReactActivity {

    //...code

    //react-native-screens override
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
    }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        //...code
    }
}
```
