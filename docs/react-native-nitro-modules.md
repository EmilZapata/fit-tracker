# React Native Nitro Modules Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /mrousavy/nitro | react-native-nitro-modules ^0.35.0

---

## Table of Contents

1. [What Are Nitro Modules?](#what-are-nitro-modules)
2. [When to Use Nitro Modules](#when-to-use-nitro-modules)
3. [Setup and Installation](#setup-and-installation)
4. [Creating a Nitro Spec (TypeScript Interface)](#creating-a-nitro-spec-typescript-interface)
5. [Nitrogen Codegen](#nitrogen-codegen)
6. [HybridObject Concept](#hybridobject-concept)
7. [Supported Types](#supported-types)
8. [Swift Implementation](#swift-implementation)
9. [Kotlin Implementation](#kotlin-implementation)
10. [Using a Nitro Module from JS/TS](#using-a-nitro-module-from-jsts)

---

## What Are Nitro Modules?

Nitro Modules is a framework for building high-performance native modules in React Native. Built on top of JSI (JavaScript Interface), Nitro Modules allow you to define type-safe native interfaces in TypeScript and generate native boilerplate code automatically using the **Nitrogen** CLI. The result is a native module that communicates synchronously with JavaScript without going through the traditional React Native bridge.

Key characteristics:

- **JSI-based**: Direct, synchronous communication between JS and native code -- no serialization overhead from the bridge.
- **Type-safe**: Interfaces are defined in TypeScript and native specs are generated, ensuring type correctness across boundaries.
- **Multi-platform**: A single TypeScript spec generates native interfaces for Swift (iOS), Kotlin (Android), and C++.
- **HybridObject pattern**: Native modules are modeled as objects with properties and methods, not flat function exports.

---

## When to Use Nitro Modules

Use Nitro Modules when you need:

- **High-performance native calls** -- synchronous JSI calls avoid bridge serialization latency.
- **Complex native objects** with properties and methods that should feel like regular JS objects.
- **Async native operations** that return Promises (e.g., image processing, file I/O, heavy computation).
- **Strongly typed contracts** between JS and native code with automatic code generation.
- **Reusable native libraries** that expose rich APIs beyond simple function calls.

If your use case is a simple one-off native function call, the standard Turbo Modules or Expo Modules API may suffice. Nitro Modules shine when you need object-oriented native APIs with strong typing and performance.

---

## Setup and Installation

### Initialize a New Nitro Module

Use the Nitrogen CLI to scaffold a new module:

```sh
npx nitrogen@latest init react-native-math
```

This creates the basic project structure for a React Native library with TypeScript support and a `nitro.json` configuration file.

### Install in an Existing Project

Add the core package to your React Native project:

```sh
npm install react-native-nitro-modules
# or
yarn add react-native-nitro-modules
```

Then install the Nitrogen CLI as a dev dependency in your module library:

```sh
npm install --save-dev nitrogen
```

Make sure your project has a `nitro.json` file at the library root that configures codegen settings (module name, languages, output paths, etc.).

---

## Creating a Nitro Spec (TypeScript Interface)

A Nitro spec is a TypeScript interface defined in a `.nitro.ts` file. It extends `HybridObject` and declares the properties and methods your native module will expose. This interface serves as the single source of truth -- it is the blueprint for both the native implementations and the JavaScript API.

```typescript
import { type HybridObject } from 'react-native-nitro-modules'

interface Math extends HybridObject<{ ios: 'swift', android: 'kotlin' }> {
  readonly pi: number
  add(a: number, b: number): number
  multiply(a: number, b: number): number
}
```

Key points:

- The generic parameter `{ ios: 'swift', android: 'kotlin' }` tells Nitrogen which languages to generate specs for.
- Properties can be `readonly` (getter only) or read-write (getter and setter).
- Methods define the function signature with parameter types and return types.
- All types used must be [supported types](#supported-types).

---

## Nitrogen Codegen

Once you have defined your `.nitro.ts` spec, run the Nitrogen CLI to generate native boilerplate:

```sh
npx nitrogen@latest
```

Nitrogen reads every `.nitro.ts` file in your project and generates:

- **Swift protocol** (`HybridMathSpec`) -- a protocol your Swift class must conform to.
- **Kotlin abstract class** (`HybridMathSpec`) -- an abstract class your Kotlin class must extend.
- **C++ abstract class** (`HybridMathSpec`) -- a C++ base class for optional C++ implementations.
- **Bridge glue code** -- all the JSI bindings, type conversions, and bridging layers.

You never edit the generated files. When your spec changes, re-run `npx nitrogen@latest` to regenerate them.

---

## HybridObject Concept

A **HybridObject** is the core abstraction in Nitro Modules. It represents a native object that is fully accessible from JavaScript as if it were a regular JS object. Unlike traditional native modules (which are singleton registries of functions), HybridObjects are instantiable -- you can create multiple independent instances.

Characteristics of a HybridObject:

- Has **properties** (getters/setters) and **methods**.
- Lives in native memory but is accessed transparently from JS via JSI.
- Can be passed around, stored in variables, and used like any JS object.
- Supports inheritance and composition on the native side.
- Can expose raw JSI methods for advanced use cases (C++ only):

```cpp
class HybridMath: HybridMathSpec {
public:
  jsi::Value sayHello(jsi::Runtime& runtime,
                      const jsi::Value& thisValue,
                      const jsi::Value* args,
                      size_t count);

  void loadHybridMethods() override {
    HybridMathSpec::loadHybridMethods();
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerRawHybridMethod("sayHello", 0, &HybridMath::sayHello);
    });
  }
};
```

---

## Supported Types

Nitro Modules supports a rich set of types that are automatically bridged between JS and native code.

### Primitives

| TypeScript | Swift | Kotlin | C++ |
|---|---|---|---|
| `number` | `Double` | `Double` | `double` |
| `boolean` | `Bool` | `Boolean` | `bool` |
| `string` | `String` | `String` | `std::string` |
| `bigint` | `Int64` | `Long` | `int64_t` |

### Arrays

Arrays of any supported type are automatically bridged.

```typescript
interface Contacts extends HybridObject {
  getAllUsers(): User[]
}
```

```swift
class HybridContacts: HybridContactsSpec {
  func getAllUsers() -> Array<User>
}
```

```kotlin
class HybridContacts: HybridContactsSpec() {
  fun getAllUsers(): Array<User>
}
```

```cpp
class HybridContacts : public HybridContactsSpec {
  std::vector<User> getAllUsers();
};
```

### Objects (Structs)

Custom object types can be defined as TypeScript interfaces and used in specs. Nitrogen generates corresponding native struct types.

### Untyped Maps (AnyMap)

For flexible key-value data where the shape is not known at compile time, use `AnyMap`:

```typescript
interface Fetch extends HybridObject {
  get(url: string): AnyMap
}
```

```swift
class HybridFetch: HybridFetchSpec {
  func get(url: String) -> AnyMap
}
```

```kotlin
class HybridFetch: HybridFetchSpec() {
  fun get(url: String): AnyMap
}
```

```cpp
class HybridFetch: public HybridFetchSpec {
  std::shared_ptr<AnyMap> get(const std::string& url);
};
```

Note: Untyped maps limit Nitro's optimization capabilities because key and value types are unknown at compile time. Prefer typed structs when possible.

### Promises

Async methods return `Promise<T>` in native code and `Promise<T>` in TypeScript. This allows native operations to run on background threads and resolve asynchronously.

```typescript
interface ImageProcessor extends HybridObject {
  processImage(path: string): Promise<ArrayBuffer>
  calculateFibonacci(n: number): Promise<bigint>
}
```

### Callbacks

Functions can be passed as parameters to native methods, enabling callback patterns. In TypeScript, these are simply function types like `(value: string) => void`.

### ArrayBuffer

Binary data is represented as `ArrayBuffer` in TypeScript, bridged to native buffer types for efficient zero-copy data transfer.

---

## Swift Implementation

After running Nitrogen, implement the generated `HybridMathSpec` protocol in Swift.

### Basic Implementation

```swift
class HybridMath : HybridMathSpec {
  public func add(a: Double, b: Double) throws -> Double {
    return a + b
  }
}
```

### Async Implementation with Promises

Use `Promise.async` to run work on a background thread and return the result asynchronously:

```swift
class HybridMath : HybridMathSpec {
  public func add(a: Double, b: Double) throws -> Promise<Double> {
    return Promise.async {
      if a < 0 || b < 0 {
        throw RuntimeError.error(withMessage: "Value cannot be negative!")
      }
      return a + b
    }
  }
}
```

### Advanced Async Example

```swift
class HybridImageProcessor : HybridImageProcessorSpec {
  func processImage(path: String) -> Promise<ArrayBuffer> {
    return Promise.async {
      let image = try await UIImage.load(from: path)
      let processed = try await self.applyFilters(image)
      return ArrayBuffer.copy(data: processed.pngData()!)
    }
  }

  func calculateFibonacci(n: Double) -> Promise<Int64> {
    return Promise.async {
      return try await self.fibonacci(Int(n))
    }
  }
}
```

Key notes for Swift:

- Methods can `throw` to signal errors back to JS.
- Use `Promise.async { ... }` for async operations -- the closure runs on a background thread.
- Throwing inside a `Promise.async` block results in a rejected Promise on the JS side.

---

## Kotlin Implementation

After running Nitrogen, extend the generated `HybridMathSpec` abstract class in Kotlin.

### Basic Implementation

```kotlin
class HybridMath : HybridMathSpec() {
  override fun add(a: Double, b: Double): Double {
    return a + b
  }
}
```

### Async Implementation with Promises

Use `Promise.async` to perform asynchronous work:

```kotlin
class HybridMath : HybridMathSpec() {
  override fun add(a: Double, b: Double): Promise<Double> {
    return Promise.async {
      if (a < 0 || b < 0) {
        throw Error("Value cannot be negative!")
      }
      return@async a + b
    }
  }
}
```

### Advanced Async Example

```kotlin
class HybridImageProcessor : HybridImageProcessorSpec() {
  override fun processImage(path: String): Promise<ArrayBuffer> {
    return Promise.async {
      val image = loadImage(path)
      val processed = applyFilters(image)
      ArrayBuffer.copy(processed)
    }
  }

  override fun calculateFibonacci(n: Double): Promise<Long> {
    return Promise.async {
      fibonacci(n.toLong())
    }
  }
}
```

Key notes for Kotlin:

- Extend the generated spec with `HybridMathSpec()` (note the parentheses -- it is a class, not an interface).
- Override each method declared in the spec.
- Throwing inside `Promise.async` rejects the JS Promise with the error message.
- Use `return@async` for labeled returns inside lambda blocks.

---

## Using a Nitro Module from JS/TS

Once the native implementations are in place, you can use the module from JavaScript/TypeScript.

### Creating Instances with `NitroModules.createHybridObject`

```typescript
import { NitroModules } from 'react-native-nitro-modules'

const math = NitroModules.createHybridObject<Math>('Math')

const result = math.add(5, 3)
console.log(result) // --> 8

console.log(math.pi) // --> 3.141592653589793
```

The string `'Math'` must match the registered name of your HybridObject on the native side.

### Constructor-Style Creation

For a more class-like API, use `getHybridObjectConstructor`:

```typescript
import { getHybridObjectConstructor } from 'react-native-nitro-modules'

const HybridMath = getHybridObjectConstructor<Math>('Math')

const math1 = new HybridMath()
const math2 = new HybridMath()

console.log(math1 instanceof HybridMath) // --> true
console.log(math1.multiply(4, 7)) // --> 28
```

This is useful when you want to create multiple independent instances or use `instanceof` checks.

### Calling Async Methods

Methods that return `Promise` on the native side are seamlessly awaitable in JS:

```typescript
const processor = NitroModules.createHybridObject<ImageProcessor>('ImageProcessor')

// Using async/await
const imageData = await processor.processImage('file:///tmp/photo.jpg')
console.log(`Processed ${imageData.byteLength} bytes`)

// Using .then()
processor.calculateFibonacci(50).then(result => {
  console.log(`Fibonacci(50) = ${result}`)
})
```

### Error Handling

Errors thrown in native code are propagated as JS exceptions (for synchronous methods) or Promise rejections (for async methods):

```typescript
try {
  const result = math.add(-1, 5)
} catch (error) {
  console.error(error.message) // "Value cannot be negative!"
}

// For async methods
try {
  await processor.processImage('invalid://path')
} catch (error) {
  console.error(error.message)
}
```
