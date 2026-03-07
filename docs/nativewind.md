# NativeWind Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: nativewind v4 | TailwindCSS for React Native

## Basic Usage

Use `className` prop with Tailwind utility classes on React Native components. Import `global.css` in your root layout.

```typescript
import "./global.css"
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}
```

## Custom Components with Default Styles

```javascript
function MyComponent({ className }) {
  const defaultStyles = "text-black dark:text-white";
  return <Text className={`${defaultStyles} ${className}`} />;
}

<MyComponent className="font-bold" />;
```

## Dark Mode

Always specify BOTH default and dark mode styles explicitly. React Native requires explicit defaults.

```javascript
import { Text } from 'react-native';

function MyComponent() {
  return (
    <>
      {/* INCORRECT: Only specifies dark mode text color */}
      <Text className="dark:text-white-500">Dark Mode Text</Text>

      {/* CORRECT: Specifies default AND dark mode text color */}
      <Text className="text-black dark:text-red-500">Explicit Dark Mode Text</Text>
    </>
  );
}
```

## Platform-Specific Theming

Use `platformSelect` in tailwind.config.js:

```javascript
const { platformSelect } = require("nativewind/theme");

module.exports = {
  theme: {
    extend: {
      colors: {
        error: platformSelect({
          ios: "red",
          android: "blue",
          default: "green",
        }),
      },
    },
  },
};
```

## Multi-Theme Switching

Use `vars` and `useColorScheme` for dynamic theming:

```javascript
import { vars, useColorScheme } from 'nativewind'

const themes = {
  brand: {
    'light': vars({
      '--color-primary': 'black',
      '--color-secondary': 'white'
    }),
    'dark': vars({
      '--color-primary': 'white',
      '--color-secondary': 'dark'
    })
  },
  christmas: {
    'light': vars({
      '--color-primary': 'red',
      '--color-secondary': 'green'
    }),
    'dark': vars({
      '--color-primary': 'green',
      '--color-secondary': 'red'
    })
  }
}

function Theme(props) {
  const { colorScheme } = useColorScheme()
  return (
    <View style={themes[props.name][colorScheme]}>
      {props.children}
    </View>
  )
}

export default App() {
  return (
    <Theme name="brand">
      <View className="text-primary">{/* rgba(0, 0, 0, 1) */}</View>
    </Theme>
  )
}
```

## cssInterop API

Maps `className` to style props for third-party or custom components.

### Basic Usage

```javascript
import { cssInterop } from 'nativewind';

// Create a new prop and map it to an existing prop
cssInterop(component, { "new-prop": "existing-prop" });

// Override an existing prop
cssInterop(component, { "new-prop": true });

// Advanced with nativeStyleToProp
cssInterop(component, {
  "new-prop": {
    target: "existing-prop",
    nativeStyleToProp: {
      "style-attribute": "existing-prop",
    }
  }
});
```

### TextInput Example

```javascript
cssInterop(TextInput, {
  className: {
    target: "style",
    nativeStyleToProp: {
      textAlign: true,
    },
  },
  placeholderClassName: {
    target: false,
    nativeStyleToProp: {
      color: "placeholderTextColor",
    },
  },
  selectionClassName: {
    target: false,
    nativeStyleToProp: {
      color: "selectionColor",
    },
  },
});
```

### SVG Components (react-native-svg)

```javascript
import { cssInterop } from "nativewind";
import { Svg, Circle } from "react-native-svg";

const StyledSVG = cssInterop(Svg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
    },
  },
});

const StyledCircle = cssInterop(Circle, {
  className: {
    target: "style",
    nativeStyleToProp: {
      fill: true,
      stroke: true,
      strokeWidth: true,
    },
  },
});

export function MyIcon() {
  return (
    <Svg className="w-1/2 h-1/2" viewBox="0 0 100 100">
      <StyledCircle
        className="fill-green-500 stroke-blue-500 stroke-2"
        cx="50" cy="50" r="45"
      />
    </Svg>
  );
}
```

### Third-Party Components with Style Attribute Props

```javascript
import { cssInterop } from 'nativewind';

// Map labelColor and inputColor via separate className props
cssInterop(ThirdPartyComponent, {
  labelColorClassName: {
    target: false,
    nativeStyleToProps: { color: 'labelColor' }
  },
  inputColorClassName: {
    target: false,
    nativeStyleToProps: { color: 'inputColor' }
  }
});
```
