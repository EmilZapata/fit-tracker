# TanStack React Query Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /tanstack/query | @tanstack/react-query ^5.90.x

---

## Table of Contents

1. [QueryClientProvider Setup](#queryclientprovider-setup)
2. [useQuery](#usequery)
3. [useMutation](#usemutation)
4. [useInfiniteQuery](#useinfinitequery)
5. [Query Keys Best Practices](#query-keys-best-practices)
6. [Query Invalidation](#query-invalidation)
7. [Optimistic Updates](#optimistic-updates)
8. [Persistence Setup](#persistence-setup)
9. [Integration with MMKV](#integration-with-mmkv)

---

## QueryClientProvider Setup

Every application using TanStack React Query must wrap its component tree with `QueryClientProvider`, passing a `QueryClient` instance. In React Native, this typically goes in your root layout or `App.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000,      // 10 minutes - unused cache kept
      retry: 2,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
```

### QueryClientProvider Props

| Prop     | Type          | Required | Description                                      |
|----------|---------------|----------|--------------------------------------------------|
| `client` | `QueryClient` | Yes      | The QueryClient instance to provide to the app.  |

---

## useQuery

`useQuery` is the primary hook for declarative data fetching. In v5, it accepts a single object argument.

### Basic Usage

```tsx
import { useQuery } from '@tanstack/react-query';

function WorkoutList() {
  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const response = await fetch('https://api.example.com/workouts');
      if (!response.ok) throw new Error('Failed to fetch workouts');
      return response.json();
    },
  });

  if (isLoading) return <ActivityIndicator />;
  if (isError) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

### Key Options

| Option       | Type                          | Description                                                        |
|--------------|-------------------------------|--------------------------------------------------------------------|
| `queryKey`   | `unknown[]`                   | Required. Unique key for this query, used for caching/invalidation.|
| `queryFn`    | `(context) => Promise<TData>` | Required. Function that fetches data and returns a promise.        |
| `staleTime`  | `number`                      | Time in ms before data is considered stale. Default: `0`.          |
| `gcTime`     | `number`                      | Time in ms unused/inactive cache data remains in memory. Default: `5 * 60 * 1000`. |
| `retry`      | `number \| boolean`           | Number of retry attempts on failure. Default: `3`.                 |
| `enabled`    | `boolean`                     | Set to `false` to disable automatic fetching.                      |
| `refetchOnWindowFocus` | `boolean`            | Refetch when window regains focus. Default: `true`.                |
| `select`     | `(data: TData) => TSelected`  | Transform or select a subset of data returned by `queryFn`.       |
| `placeholderData` | `TData \| (prev) => TData` | Data shown while the real query is loading.                       |

### Key Return Values

| Value              | Type              | Description                                    |
|--------------------|-------------------|------------------------------------------------|
| `data`             | `TData`           | The resolved data from `queryFn`.              |
| `error`            | `TError`          | Error object if the query failed.              |
| `isLoading`        | `boolean`         | `true` on first load with no cached data.      |
| `isFetching`       | `boolean`         | `true` whenever a fetch is in-flight.          |
| `isError`          | `boolean`         | `true` if the query encountered an error.      |
| `isSuccess`        | `boolean`         | `true` if the query has data.                  |
| `refetch`          | `() => void`      | Manually trigger a refetch.                    |
| `status`           | `string`          | `'pending' \| 'error' \| 'success'`.           |
| `fetchStatus`      | `string`          | `'fetching' \| 'paused' \| 'idle'`.            |

### Per-Query Configuration Example

```tsx
useQuery({
  queryKey: ['workout', workoutId],
  queryFn: () => fetchWorkout(workoutId),
  staleTime: Infinity,    // Never refetch automatically until invalidated
  gcTime: 0,              // Remove from cache as soon as it becomes inactive
  retry: 0,               // Do not retry on failure
  enabled: !!workoutId,   // Only fetch when workoutId is available
});
```

---

## useMutation

`useMutation` is used for creating, updating, or deleting data. It provides callbacks for side effects like cache invalidation.

### Basic Usage with onSuccess, onError, and Invalidation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newWorkout: { name: string; exercises: string[] }) => {
      const response = await fetch('https://api.example.com/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkout),
      });
      if (!response.ok) throw new Error('Failed to create workout');
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch the workouts list
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      console.log('Workout created:', data);
    },
    onError: (error) => {
      console.error('Mutation failed:', error.message);
    },
    onSettled: () => {
      // Runs after either success or error
      console.log('Mutation finished');
    },
  });
}

// Usage in a component
function CreateWorkoutButton() {
  const { mutate, isPending, isError, error } = useCreateWorkout();

  return (
    <Pressable
      onPress={() =>
        mutate({ name: 'Push Day', exercises: ['bench press', 'overhead press'] })
      }
      disabled={isPending}
    >
      <Text>{isPending ? 'Creating...' : 'Create Workout'}</Text>
      {isError && <Text>Error: {error.message}</Text>}
    </Pressable>
  );
}
```

### useMutation Key Options

| Option         | Type                                       | Description                                          |
|----------------|--------------------------------------------|------------------------------------------------------|
| `mutationFn`   | `(variables: TVariables) => Promise<TData>` | Required. The function that performs the mutation.    |
| `onMutate`     | `(variables) => Promise<TContext> \| TContext` | Called before `mutationFn`. Useful for optimistic updates. |
| `onSuccess`    | `(data, variables, context) => void`        | Called when the mutation succeeds.                    |
| `onError`      | `(error, variables, context) => void`       | Called when the mutation fails.                       |
| `onSettled`    | `(data, error, variables, context) => void` | Called after success or error.                        |
| `mutationKey`  | `unknown[]`                                 | Optional key for the mutation (useful for persistence). |

### useMutation Key Return Values

| Value        | Type          | Description                                   |
|--------------|---------------|-----------------------------------------------|
| `mutate`     | `function`    | Fire-and-forget trigger for the mutation.     |
| `mutateAsync`| `function`    | Returns a promise, for `await` usage.         |
| `isPending`  | `boolean`     | `true` while the mutation is in progress.     |
| `isError`    | `boolean`     | `true` if the mutation failed.                |
| `isSuccess`  | `boolean`     | `true` if the mutation succeeded.             |
| `data`       | `TData`       | The data returned from `mutationFn`.          |
| `error`      | `TError`      | Error object if the mutation failed.          |
| `reset`      | `function`    | Reset the mutation state.                     |

---

## useInfiniteQuery

`useInfiniteQuery` handles paginated or infinite-scroll data fetching. It manages multiple "pages" of data automatically.

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { FlatList, ActivityIndicator, Text, Pressable } from 'react-native';

function useWorkoutHistory() {
  return useInfiniteQuery({
    queryKey: ['workoutHistory'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `https://api.example.com/history?offset=${pageParam}&limit=20`
      );
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Return undefined if there are no more pages
      return lastPage.hasMore ? allPages.length * 20 : undefined;
    },
  });
}

function WorkoutHistory() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useWorkoutHistory();

  if (isLoading) return <ActivityIndicator />;
  if (isError) return <Text>Error: {error.message}</Text>;

  // Flatten all pages into a single array
  const allWorkouts = data.pages.flatMap((page) => page.workouts);

  return (
    <FlatList
      data={allWorkouts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

### Key Return Values (in addition to useQuery return values)

| Value                | Type          | Description                                         |
|----------------------|---------------|-----------------------------------------------------|
| `data.pages`         | `TData[]`     | Array of all fetched pages.                         |
| `data.pageParams`    | `unknown[]`   | Array of all page params used.                      |
| `fetchNextPage`      | `function`    | Fetch the next page of data.                        |
| `fetchPreviousPage`  | `function`    | Fetch the previous page (if configured).            |
| `hasNextPage`        | `boolean`     | `true` if `getNextPageParam` returns a value.       |
| `hasPreviousPage`    | `boolean`     | `true` if `getPreviousPageParam` returns a value.   |
| `isFetchingNextPage` | `boolean`     | `true` while fetching the next page.                |

---

## Query Keys Best Practices

Query keys are the backbone of caching, invalidation, and refetching. They must be serializable arrays.

### Structure Keys Hierarchically

```tsx
// Broad -> specific, coarse -> granular
const keys = {
  all:      ['workouts'] as const,
  lists:    () => [...keys.all, 'list'] as const,
  list:     (filters: WorkoutFilters) => [...keys.lists(), filters] as const,
  details:  () => [...keys.all, 'detail'] as const,
  detail:   (id: string) => [...keys.details(), id] as const,
};

// Usage
useQuery({ queryKey: keys.detail(workoutId), queryFn: ... });
useQuery({ queryKey: keys.list({ muscle: 'chest' }), queryFn: ... });

// Invalidate all workout queries at once
queryClient.invalidateQueries({ queryKey: keys.all });

// Invalidate only lists (keeps detail caches)
queryClient.invalidateQueries({ queryKey: keys.lists() });
```

### Key Rules

- Keys are compared **deterministically** -- object key order does not matter:
  `['workouts', { page: 1, sort: 'asc' }]` equals `['workouts', { sort: 'asc', page: 1 }]`.
- Include all variables the `queryFn` depends on in the key.
- Invalidating `['workouts']` will also invalidate `['workouts', 'list']`, `['workouts', 'detail', '123']`, etc. (prefix matching).

---

## Query Invalidation

Invalidation marks queries as stale and triggers a refetch for active ones.

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate all queries starting with ['workouts']
queryClient.invalidateQueries({ queryKey: ['workouts'] });

// Invalidate a specific workout detail
queryClient.invalidateQueries({ queryKey: ['workouts', 'detail', workoutId] });

// Invalidate multiple query groups
queryClient.invalidateQueries({ queryKey: ['workouts'] });
queryClient.invalidateQueries({ queryKey: ['exercises'] });

// Invalidate everything
queryClient.invalidateQueries();
```

### Common Pattern: Invalidate on Mutation Success

```tsx
const mutation = useMutation({
  mutationFn: updateWorkout,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['workouts'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  },
});
```

---

## Optimistic Updates

Optimistic updates let you update the UI immediately before the server confirms the mutation. If the mutation fails, the UI rolls back.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
}

function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedExercise: Exercise) => {
      const response = await fetch(`/api/exercises/${updatedExercise.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExercise),
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },

    onMutate: async (updatedExercise) => {
      // 1. Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['exercises'] });

      // 2. Snapshot the previous value for rollback
      const previousExercises = queryClient.getQueryData<Exercise[]>(['exercises']);

      // 3. Optimistically update the cache
      queryClient.setQueryData<Exercise[]>(['exercises'], (old) =>
        old?.map((ex) =>
          ex.id === updatedExercise.id ? updatedExercise : ex
        ) ?? []
      );

      // 4. Return context with snapshot
      return { previousExercises };
    },

    onError: (_err, _updatedExercise, context) => {
      // Roll back to the previous value on error
      if (context?.previousExercises) {
        queryClient.setQueryData(['exercises'], context.previousExercises);
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}
```

### Optimistic Update Flow

1. **onMutate**: Cancel outgoing refetches, snapshot current cache, apply optimistic update, return snapshot as context.
2. **onError**: Restore the snapshot from context.
3. **onSettled**: Invalidate to reconcile with server state.

---

## Persistence Setup

`@tanstack/react-query-persist-client` allows you to persist the query cache to storage so it survives app restarts.

### Install Dependencies

```bash
npx expo install @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
# or for sync storage:
npx expo install @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

### PersistQueryClientProvider

Use `PersistQueryClientProvider` instead of `QueryClientProvider` to automatically persist and restore the cache.

```tsx
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours -- must be >= maxAge
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <RootNavigator />
    </PersistQueryClientProvider>
  );
}
```

### createSyncStoragePersister

For synchronous storage backends. Accepts these options:

| Option          | Type                                     | Default                         | Description                                   |
|-----------------|------------------------------------------|---------------------------------|-----------------------------------------------|
| `storage`       | `Storage \| undefined \| null`           | Required                        | The storage interface (e.g., `localStorage`). |
| `key`           | `string`                                 | `'REACT_QUERY_OFFLINE_CACHE'`   | Storage key for the persisted cache.          |
| `throttleTime`  | `number`                                 | `1000`                          | Throttle writes to storage (ms).              |
| `serialize`     | `(client: PersistedClient) => string`    | `JSON.stringify`                | Custom serialization function.                |
| `deserialize`   | `(cachedString: string) => PersistedClient` | `JSON.parse`                 | Custom deserialization function.              |
| `retry`         | `PersistRetryer`                         | `undefined`                     | Custom retry logic on persistence error.      |

### createAsyncStoragePersister

Same API as `createSyncStoragePersister` but works with async storage interfaces (like `AsyncStorage` or MMKV's async wrapper).

### Persisting Offline Mutations

To resume paused mutations after an app restart, set default mutation functions and call `resumePausedMutations` on restore:

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

// Define default mutation functions so paused mutations can resume
queryClient.setMutationDefaults(['workouts'], {
  mutationFn: ({ id, data }) => {
    return api.updateWorkout(id, data);
  },
});

const persister = createSyncStoragePersister({
  storage: mmkvStorage, // see MMKV section below
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        // Resume mutations that were paused while offline
        queryClient.resumePausedMutations();
      }}
    >
      <RootNavigator />
    </PersistQueryClientProvider>
  );
}
```

---

## Integration with MMKV

[react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) is significantly faster than AsyncStorage and works synchronously, making it ideal for query cache persistence in React Native.

### Install MMKV

```bash
npx expo install react-native-mmkv
```

### Create an MMKV Storage Adapter

`createSyncStoragePersister` expects a `Storage` interface with `getItem`, `setItem`, and `removeItem`. MMKV can be wrapped to match this:

```tsx
// core/storage/mmkv-persister.ts
import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const mmkv = new MMKV({ id: 'react-query-cache' });

// Adapter: MMKV -> Storage interface expected by createSyncStoragePersister
const mmkvStorage = {
  getItem: (key: string): string | null => {
    const value = mmkv.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkv.delete(key);
  },
};

export const mmkvPersister = createSyncStoragePersister({
  storage: mmkvStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  throttleTime: 1000,
});
```

### Full App Setup with MMKV Persistence

```tsx
// app/_layout.tsx (Expo Router) or App.tsx
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { mmkvPersister } from '@/core/storage/mmkv-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5,    // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: mmkvPersister }}
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      {/* Expo Router Slot, navigation, etc. */}
    </PersistQueryClientProvider>
  );
}
```

### Why MMKV over AsyncStorage for Persistence

| Feature        | MMKV                    | AsyncStorage              |
|----------------|-------------------------|---------------------------|
| Speed          | ~30x faster             | Slower (bridge-based)     |
| API            | Synchronous             | Asynchronous              |
| Encryption     | Built-in support        | Not built-in              |
| Persister type | `createSyncStoragePersister` | `createAsyncStoragePersister` |

Since MMKV is synchronous, you use `createSyncStoragePersister` which writes immediately without awaiting, resulting in more predictable cache persistence behavior during app backgrounding or crashes.
