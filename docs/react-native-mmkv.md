# React Native MMKV Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /mrousavy/react-native-mmkv | react-native-mmkv ^4.2.0

## Table of Contents

- [Installation and Setup](#installation-and-setup)
- [Creating MMKV Instances](#creating-mmkv-instances)
- [Basic Operations](#basic-operations)
- [React Hooks for State Integration](#react-hooks-for-state-integration)
- [Value Change Listeners](#value-change-listeners)
- [Multiple Instances](#multiple-instances)
- [TanStack Query Persistence with MMKV](#tanstack-query-persistence-with-mmkv)

---

## Installation and Setup

Install the package via your package manager:

```bash
# npm
npm install react-native-mmkv

# yarn
yarn add react-native-mmkv

# pnpm
pnpm add react-native-mmkv
```

For iOS, install native pods:

```bash
cd ios && pod install
```

No additional native setup is required for Android. The library uses JSI (JavaScript Interface) for synchronous, direct communication with native code -- no bridge overhead.

---

## Creating MMKV Instances

Use `createMMKV` to create storage instances. Instances should be created once and reused throughout the application.

### Default Instance

```javascript
import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()
```

### Custom ID Instance

Use a custom `id` to create isolated storage namespaces:

```javascript
import { createMMKV } from 'react-native-mmkv'

const userId = '12345'
export const userDataStorage = createMMKV({
  id: `user-${userId}-storage`
})
```

### Encrypted Instance

Provide an `encryptionKey` to encrypt all stored data. Encryption keys should be up to 16 bytes:

```javascript
import { createMMKV } from 'react-native-mmkv'

export const secureStorage = createMMKV({
  id: 'secure-storage',
  encryptionKey: 'hunter2'
})

secureStorage.set('api.key', 'secret-api-key')
secureStorage.set('user.token', 'auth-token-123')
```

### Full Configuration Options

```typescript
import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: `user-${userId}-storage`,
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'hunter2',
  mode: 'multi-process',
  readOnly: false
})
```

| Option          | Type      | Description                                          |
|-----------------|-----------|------------------------------------------------------|
| `id`            | `string`  | Unique identifier for the storage instance           |
| `path`          | `string`  | Custom file system path for storage                  |
| `encryptionKey` | `string`  | Encryption key (up to 16 bytes)                      |
| `mode`          | `string`  | `'multi-process'` for cross-process access           |
| `readOnly`      | `boolean` | Set to `true` to prevent writes                      |

### Managing Encryption with `recrypt`

You can add, change, or remove encryption on an existing storage instance:

```javascript
import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'user-storage' })

// Add encryption to existing (unencrypted) storage
storage.recrypt('my-secret-key')

// Change encryption key
storage.recrypt('new-secret-key')

// Remove encryption (decrypt all data)
storage.recrypt(undefined)
```

---

## Basic Operations

### set

Store string, number, boolean, or Buffer values:

```javascript
storage.set('user.name', 'Marc')       // string
storage.set('user.age', 21)            // number
storage.set('is-mmkv-fast-asf', true)  // boolean
```

### getString, getNumber, getBoolean, getBuffer

Retrieve values by key. Returns `undefined` if the key does not exist:

```javascript
const username = storage.getString('user.name')    // 'Marc' | undefined
const age = storage.getNumber('user.age')          // 21 | undefined
const isFast = storage.getBoolean('is-mmkv-fast-asf') // true | undefined
const data = storage.getBuffer('binary.data')      // Buffer | undefined
```

### contains

Check whether a key exists in storage:

```javascript
const hasUsername = storage.contains('user.name')     // true
const hasPassword = storage.contains('user.password') // false

if (!storage.contains('user.onboarded')) {
  storage.set('user.onboarded', true)
}
```

### getAllKeys

Retrieve all keys currently stored:

```javascript
const allKeys = storage.getAllKeys()
// ['user.name', 'user.age', 'user.email', 'app.theme']

// Filter keys by prefix
const userKeys = allKeys.filter(key => key.startsWith('user.'))
```

### delete (remove)

Remove a specific key. Returns `true` if the key existed and was removed, `false` otherwise:

```javascript
const wasRemoved = storage.remove('user.email')       // true
const wasRemovedAgain = storage.remove('user.email')   // false (already removed)

// Remove multiple keys
const keysToRemove = ['user.name', 'user.age']
keysToRemove.forEach(key => storage.remove(key))
```

### clearAll

Remove all keys and values from the storage instance:

```javascript
storage.clearAll()
console.log(storage.getAllKeys()) // []
```

You can also selectively clear keys by prefix:

```javascript
const keys = storage.getAllKeys()
keys.filter(k => k.startsWith('user.')).forEach(k => storage.remove(k))
```

---

## React Hooks for State Integration

MMKV provides React hooks that behave like `useState` but persist values to storage. Components automatically re-render when the stored value changes.

### useMMKVString

```typescript
import { useMMKVString } from 'react-native-mmkv'

function Profile() {
  const [username, setUsername] = useMMKVString('user.name')

  return (
    <View>
      <Text>Username: {username ?? 'Not set'}</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />
    </View>
  )
}
```

### useMMKVNumber

```typescript
import { useMMKVNumber } from 'react-native-mmkv'

function AgeCounter() {
  const [age, setAge] = useMMKVNumber('user.age')

  return (
    <View>
      <Text>Age: {age ?? 0}</Text>
      <Button
        title="Increment Age"
        onPress={() => setAge((age ?? 0) + 1)}
      />
    </View>
  )
}
```

### useMMKVBoolean

```typescript
import { useMMKVBoolean } from 'react-native-mmkv'

function PremiumToggle() {
  const [isPremium, setIsPremium] = useMMKVBoolean('user.isPremium')

  return (
    <View>
      <Text>Premium: {isPremium ? 'Yes' : 'No'}</Text>
      <Button
        title="Toggle Premium"
        onPress={() => setIsPremium(!isPremium)}
      />
    </View>
  )
}
```

### useMMKVObject

For storing and retrieving JSON-serializable objects:

```typescript
import { useMMKVObject } from 'react-native-mmkv'

interface UserSettings {
  theme: 'light' | 'dark'
  fontSize: number
  notifications: boolean
}

function SettingsScreen() {
  const [settings, setSettings] = useMMKVObject<UserSettings>('user.settings')

  const toggleTheme = () => {
    setSettings({
      ...settings,
      theme: settings?.theme === 'dark' ? 'light' : 'dark'
    })
  }

  return (
    <View>
      <Text>Theme: {settings?.theme ?? 'light'}</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  )
}
```

### Using Hooks with a Custom Storage Instance

Pass a storage instance as the second argument to any hook:

```typescript
import { createMMKV } from 'react-native-mmkv'
import { useMMKVString, useMMKVNumber, useMMKVBoolean } from 'react-native-mmkv'

const userStorage = createMMKV({ id: 'user-storage' })

function Settings() {
  const [theme, setTheme] = useMMKVString('theme', userStorage)
  const [fontSize, setFontSize] = useMMKVNumber('fontSize', userStorage)
  const [notifications, setNotifications] = useMMKVBoolean('notifications', userStorage)

  return (
    <View>
      <Button
        title={`Theme: ${theme ?? 'light'}`}
        onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <Button
        title="Increase Font Size"
        onPress={() => setFontSize((fontSize ?? 14) + 1)}
      />
      <Button
        title={notifications ? 'Disable Notifications' : 'Enable Notifications'}
        onPress={() => setNotifications(!notifications)}
      />
    </View>
  )
}
```

---

## Value Change Listeners

### useMMKVListener

The `useMMKVListener` hook listens for changes to any key within a storage instance. It receives the changed key as an argument:

```typescript
import { useMMKVListener, createMMKV } from 'react-native-mmkv'

const storage = createMMKV()

function StorageMonitor() {
  const [lastChanged, setLastChanged] = useState<string | null>(null)
  const [changeCount, setChangeCount] = useState(0)

  useMMKVListener((key) => {
    console.log(`Value for "${key}" changed!`)
    setLastChanged(key)
    setChangeCount(prev => prev + 1)
  })

  return (
    <View>
      <Text>Last changed key: {lastChanged ?? 'None'}</Text>
      <Text>Total changes: {changeCount}</Text>
    </View>
  )
}
```

### Listening on a Specific Instance

Pass the storage instance as the second argument:

```typescript
const userStorage = createMMKV({ id: 'user-storage' })

function UserStorageMonitor() {
  useMMKVListener((key) => {
    console.log(`User storage changed: ${key}`)
  }, userStorage)

  return <Text>Monitoring user storage</Text>
}
```

### Selective Listening by Key Prefix

```typescript
function DataSync() {
  const [syncedData, setSyncedData] = useState<Record<string, any>>({})

  useMMKVListener((key) => {
    if (key.startsWith('sync.')) {
      const value = storage.getString(key)
      setSyncedData(prev => ({
        ...prev,
        [key]: value
      }))
    }
  })

  return (
    <View>
      {Object.entries(syncedData).map(([key, value]) => (
        <Text key={key}>{key}: {value}</Text>
      ))}
    </View>
  )
}
```

### Silent Debug Logger

```typescript
function DebugLogger() {
  useMMKVListener((key) => {
    const value = storage.getString(key)
      ?? storage.getNumber(key)
      ?? storage.getBoolean(key)

    console.log(`[MMKV] ${key} = ${JSON.stringify(value)}`)
  })

  return null
}
```

---

## Multiple Instances

Create separate storage instances for different concerns. Each instance is isolated and can have its own configuration:

```typescript
import { createMMKV } from 'react-native-mmkv'

// General app settings
export const appStorage = createMMKV({ id: 'app-settings' })

// User-specific data (per-user isolation)
export function createUserStorage(userId: string) {
  return createMMKV({
    id: `user-${userId}-storage`
  })
}

// Sensitive data with encryption
export const secureStorage = createMMKV({
  id: 'secure-storage',
  encryptionKey: 'my-secret-key'
})

// Shared read-only configuration
export const sharedConfig = createMMKV({
  id: 'shared-config',
  readOnly: true
})
```

Monitoring multiple instances simultaneously:

```typescript
function MultiStorageMonitor() {
  useMMKVListener((key) => {
    console.log(`User storage changed: ${key}`)
  }, userStorage)

  useMMKVListener((key) => {
    console.log(`App storage changed: ${key}`)
  }, appStorage)

  return <Text>Monitoring multiple storage instances</Text>
}
```

---

## TanStack Query Persistence with MMKV

You can use MMKV as a synchronous persister for TanStack Query, enabling offline-first caching of server state.

### Creating an MMKV Persister

```typescript
import { createMMKV } from 'react-native-mmkv'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryStorage = createMMKV({ id: 'tanstack-query-cache' })

/**
 * MMKV-backed storage adapter compatible with TanStack Query's
 * createSyncStoragePersister, which expects a Web Storage-like interface.
 */
const mmkvStorageAdapter = {
  getItem: (key: string) => {
    const value = queryStorage.getString(key)
    return value ?? null
  },
  setItem: (key: string, value: string) => {
    queryStorage.set(key, value)
  },
  removeItem: (key: string) => {
    queryStorage.remove(key)
  },
}

export const mmkvPersister = createSyncStoragePersister({
  storage: mmkvStorageAdapter,
})
```

### Using the Persister with PersistQueryClientProvider

```tsx
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { mmkvPersister } from './mmkvPersister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5,     // 5 minutes
    },
  },
})

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: mmkvPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      {/* Your app components */}
    </PersistQueryClientProvider>
  )
}
```

This approach gives TanStack Query a synchronous (non-async) storage backend, which is significantly faster than AsyncStorage-based persisters because MMKV operates via JSI with no bridge serialization overhead.
