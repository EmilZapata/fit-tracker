# React Native Reanimated Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /software-mansion/react-native-reanimated | ~4.2.1

## Core Concepts

### useSharedValue

Creates an animatable value accessible from both JS and UI threads.

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Button, View, StyleSheet } from 'react-native';

function SharedValueExample() {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const moveRight = () => {
    offset.value = withSpring(offset.value + 50);
  };

  const reset = () => {
    offset.value = withSpring(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyles]} />
      <Button title="Move Right" onPress={moveRight} />
      <Button title="Reset" onPress={reset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { width: 100, height: 100, backgroundColor: '#b58df1', borderRadius: 10 },
});
```

### useAnimatedStyle

Creates dynamic style objects that automatically update in response to shared value changes. The callback executes on the UI thread for smooth animations.

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { View, Pressable, StyleSheet, Text } from 'react-native';

function AnimatedStyleExample() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200, easing: Easing.bounce });
    opacity.value = withTiming(1, { duration: 200 });
    rotation.value = withTiming(rotation.value + 360, { duration: 500 });
  };

  return (
    <View style={styles.container}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.box, animatedStyles]}>
          <Text style={styles.text}>Press Me</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { width: 150, height: 150, backgroundColor: '#6b4ce6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  text: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
```

## Animation Functions

### withTiming

Duration-based animations with configurable easing.

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { View, Button, StyleSheet } from 'react-native';

function TimingExample() {
  const width = useSharedValue(100);
  const backgroundColor = useSharedValue('#3498db');

  const animatedStyles = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: backgroundColor.value,
  }));

  const expand = () => {
    // Basic timing with default settings (300ms, quad easing)
    width.value = withTiming(300);
  };

  const shrink = () => {
    // Custom duration and easing
    width.value = withTiming(100, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const animateWithCallback = () => {
    width.value = withTiming(
      250,
      { duration: 400, easing: Easing.bounce },
      (finished) => {
        // Callback runs on UI thread when animation completes
        if (finished) {
          console.log('Animation completed!');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyles]} />
      <View style={styles.buttons}>
        <Button title="Expand" onPress={expand} />
        <Button title="Shrink" onPress={shrink} />
        <Button title="Bounce" onPress={animateWithCallback} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { height: 100, borderRadius: 10 },
  buttons: { flexDirection: 'row', marginTop: 20, gap: 10 },
});
```

### withSpring

Spring physics-based animations. Supports both physics parameters (stiffness, damping, mass) and duration-based parameters (duration, dampingRatio). Also supports clamping the animation range.

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { View, Button, StyleSheet } from 'react-native';

function SpringExample() {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const bounceDown = () => {
    // Physics-based spring (stiffness and damping)
    translateY.value = withSpring(100, {
      damping: 10,      // Lower = more bouncy
      stiffness: 100,   // Higher = faster
      mass: 1,
    });
  };

  const bounceUp = () => {
    // Duration-based spring
    translateY.value = withSpring(0, {
      duration: 800,
      dampingRatio: 0.5, // < 1 = underdamped (bouncy)
    });
  };

  const pulse = () => {
    scale.value = withSpring(1.3, { damping: 2, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
  };

  const clampedSpring = () => {
    translateY.value = withSpring(150, {
      duration: 1000,
      dampingRatio: 0.3,
      clamp: { min: -50, max: 120 }, // Limit bounce range
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyles]} />
      <View style={styles.buttons}>
        <Button title="Down" onPress={bounceDown} />
        <Button title="Up" onPress={bounceUp} />
        <Button title="Pulse" onPress={pulse} />
        <Button title="Clamped" onPress={clampedSpring} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { width: 100, height: 100, backgroundColor: '#e74c3c', borderRadius: 15 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 10 },
});
```

### withSequence

Chain multiple animations to run sequentially.

```tsx
import { withSequence, withTiming, withSpring } from 'react-native-reanimated';

// Move right, then left, then back to center
translateX.value = withSequence(
  withTiming(100, { duration: 300 }),
  withTiming(-100, { duration: 300 }),
  withSpring(0)
);

// Wobble effect
rotation.value = withSequence(
  withTiming(10, { duration: 50 }),
  withTiming(-10, { duration: 100 }),
  withTiming(10, { duration: 100 }),
  withTiming(-10, { duration: 100 }),
  withSpring(0)
);

// Grow and shrink
scale.value = withSequence(
  withSpring(1.5, { damping: 5 }),
  withTiming(0.8, { duration: 200 }),
  withSpring(1, { damping: 8 })
);
```

### withRepeat

Repeat an animation indefinitely or a set number of times.

```tsx
// Infinite rotation
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1,    // -1 = infinite
  false  // don't reverse
);

// Infinite pulsing (reverses)
scale.value = withRepeat(
  withTiming(1.3, { duration: 500 }),
  -1,
  true  // reverse each iteration
);

// Infinite bouncing
translateY.value = withRepeat(
  withSpring(-50, { damping: 2 }),
  -1,
  true
);
```

### cancelAnimation

Stop ongoing animations. Values stay at current position.

```tsx
import { cancelAnimation } from 'react-native-reanimated';

cancelAnimation(rotation);
cancelAnimation(scale);

// Cancel and reset
cancelAnimation(rotation);
rotation.value = withTiming(0);
```

## Layout Animations (Entering / Exiting)

### Predefined Entering and Exiting Animations

Apply built-in animations to components when they mount or unmount.

```tsx
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

function App() {
  return <Animated.View entering={FadeIn} exiting={FadeOut} />;
}
```

```tsx
import Animated, { BounceIn, BounceOut } from 'react-native-reanimated';

function App() {
  return <Animated.View entering={BounceIn} exiting={BounceOut} />;
}
```

### EntryExitTransition

Combines entry and exit layout animations with support for duration, delay, reduce motion, and completion callbacks. In Reanimated 4, `combineTransition` has been removed and replaced by `EntryExitTransition`.

```tsx
import { EntryExitTransition, FlipInEasyX, FlipOutEasyY, ReduceMotion } from 'react-native-reanimated';

// Use EntryExitTransition to define combined entering/exiting animations
EntryExitTransition.duration(1000)
  .delay(500)
  .entering(FlipInEasyX)
  .exiting(FlipOutEasyY)
  .reduceMotion(ReduceMotion.Never)
  .withCallback((finished) => {
    console.log(`finished without interruptions: ${finished}`);
  });
```

**EntryExitTransition Modifiers:**

- `.duration(ms: number)` - Sets animation length in milliseconds.
- `.delay(ms: number)` - Sets delay before animation starts (default: 0).
- `.entering(animation)` - Animation shown when element is added (default: FadeIn).
- `.exiting(animation)` - Animation shown when element is removed (default: FadeOut).
- `.reduceMotion(reduceMotion: ReduceMotion)` - Controls response to device reduced motion setting.
- `.withCallback(callback: (finished: boolean) => void)` - Fires after animation ends.

## Gesture Handler Integration

Reanimated integrates seamlessly with React Native Gesture Handler. Gesture callbacks run on the UI thread for maximum responsiveness.

**Breaking change in Reanimated 4:** `useAnimatedGestureHandler` has been removed (deprecated since Reanimated 3). All gesture handling must use the `Gesture` API from Gesture Handler 2.

### Tap Gesture

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const TapGestureExample = () => {
  const isPressed = useSharedValue(false);

  const tap = Gesture.Tap()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onFinalize(() => {
      isPressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => {
    const scale = withTiming(isPressed.value ? 1.2 : 1);
    const backgroundColor = interpolateColor(
      isPressed.value ? 1 : 0,
      [0, 1],
      ['violet', 'yellow']
    );
    return {
      transform: [{ scale }],
      backgroundColor,
    };
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.circle, animatedStyles]} />
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'violet',
  },
});
```

### Combined Gestures (Pan, Pinch, Rotate, Double-Tap)

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDecay, runOnJS } from 'react-native-reanimated';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function GestureExample() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const [gestureState, setGestureState] = useState('Ready');

  const updateState = (state: string) => setGestureState(state);

  // Pan gesture with decay for momentum
  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(updateState)('Dragging...');
    })
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onFinalize((event) => {
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-SCREEN_WIDTH / 2 + 50, SCREEN_WIDTH / 2 - 50],
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        clamp: [-200, 200],
      });
      runOnJS(updateState)('Released with velocity');
    });

  // Pinch gesture for scaling
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Rotation gesture
  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  // Double tap to reset
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      rotation.value = withSpring(0);
      savedScale.value = 1;
      savedRotation.value = 0;
      runOnJS(updateState)('Reset!');
    });

  // Combine all gestures
  const composedGesture = Gesture.Simultaneous(
    panGesture,
    Gesture.Simultaneous(pinchGesture, rotationGesture),
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.status}>{gestureState}</Text>
      <Text style={styles.hint}>Drag, pinch, rotate, or double-tap to reset</Text>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.box, animatedStyle]}>
          <Text style={styles.boxText}>Gesture Box</Text>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  status: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  hint: { fontSize: 14, color: '#666', marginBottom: 30 },
  box: { width: 150, height: 150, backgroundColor: '#6c5ce7', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  boxText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
```

## createAnimatedComponent

Wrap any component to enable animations on it.

```tsx
import Animated from 'react-native-reanimated';
import { TextInput, Switch } from 'react-native';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedSwitch = Animated.createAnimatedComponent(Switch);
```

## useAnimatedProps

Animate component-specific props (not just styles).

```tsx
import { useAnimatedProps } from 'react-native-reanimated';

const inputProps = useAnimatedProps(() => ({
  selectionColor: switchProgress.value > 0.5 ? '#e74c3c' : '#3498db',
}));

<AnimatedTextInput animatedProps={inputProps} />
```

## Built-in Animated Components

- `Animated.View`
- `Animated.Text`
- `Animated.Image`
- `Animated.ScrollView`
- `Animated.FlatList`

## Migration Notes (Reanimated 3.x to 4.x)

- **`useAnimatedGestureHandler` removed** - Migrate to the `Gesture` API from React Native Gesture Handler 2.
- **`combineTransition` removed** - Use `EntryExitTransition.entering(entering).exiting(exiting)` instead.
