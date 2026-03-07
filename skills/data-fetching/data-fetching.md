# Data Fetching Patterns

TanStack React Query v5 + MMKV persistence patterns for this project.

For API reference, see `docs/tanstack-react-query.md` and `docs/react-native-mmkv.md`.

---

## App-Wide Setup

The root layout should wrap the app with `PersistQueryClientProvider` for automatic offline cache persistence via MMKV.

```tsx
// core/providers/query-provider.tsx
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MMKV } from "react-native-mmkv";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (must be >= persister maxAge)
      retry: 2,
    },
  },
});

const mmkv = new MMKV({ id: "query-cache" });

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => mmkv.getString(key) ?? null,
    setItem: (key, value) => mmkv.set(key, value),
    removeItem: (key) => mmkv.delete(key),
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

Use a dedicated MMKV instance (`id: "query-cache"`) to isolate query cache from other app storage.

---

## Query Key Conventions

Use a factory pattern to keep keys consistent, hierarchical, and easy to invalidate.

```tsx
// core/queries/keys.ts
export const queryKeys = {
  workouts: {
    all: ["workouts"] as const,
    lists: () => [...queryKeys.workouts.all, "list"] as const,
    list: (filters: { date?: string }) =>
      [...queryKeys.workouts.lists(), filters] as const,
    details: () => [...queryKeys.workouts.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.workouts.details(), id] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    list: (muscleGroup?: string) =>
      [...queryKeys.exercises.all, "list", { muscleGroup }] as const,
  },
} as const;
```

**Rules:**
- Keys are arrays, never plain strings
- Nest from general → specific: `["workouts", "list", { filters }]`
- The factory pattern lets you invalidate at any level:
  - `queryKeys.workouts.all` → invalidates everything workout-related
  - `queryKeys.workouts.lists()` → invalidates all workout lists but not details

---

## Query Patterns

### Basic Query with Type Safety

```tsx
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/core/queries/keys";

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
}

function useWorkout(id: string) {
  return useQuery({
    queryKey: queryKeys.workouts.detail(id),
    queryFn: () => fetchWorkout(id),
    enabled: !!id,
  });
}
```

### Colocate Queries with Features

Place query hooks near their usage, not in a global queries folder:

```
app/(tabs)/workouts/
  _layout.tsx
  index.tsx          ← uses useWorkouts()
  [id].tsx           ← uses useWorkout(id)
core/queries/
  keys.ts            ← all query key factories
  workouts.ts        ← useWorkouts, useWorkout, useCreateWorkout
  exercises.ts       ← useExercises
```

---

## Mutation Patterns

### Standard Mutation with Cache Invalidation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/queries/keys";

function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkoutInput) => api.createWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workouts.lists(),
      });
    },
  });
}
```

### Optimistic Update

Use when the UI should reflect the change instantly without waiting for the server.

```tsx
function useToggleExerciseComplete(workoutId: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.workouts.detail(workoutId);

  return useMutation({
    mutationFn: (exerciseId: string) => api.toggleComplete(exerciseId),
    onMutate: async (exerciseId) => {
      // Cancel in-flight queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot current data for rollback
      const previous = queryClient.getQueryData<Workout>(queryKey);

      // Optimistically update
      queryClient.setQueryData<Workout>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: old.exercises.map((e) =>
            e.id === exerciseId ? { ...e, completed: !e.completed } : e
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
```

**When to use optimistic updates vs simple invalidation:**
- **Optimistic** — toggle states, likes, completion marks (instant feedback matters)
- **Invalidation only** — creating/deleting records, complex server-side logic

---

## Offline Support

The MMKV persister automatically saves and restores the query cache across app restarts. For offline mutations:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: "offlineFirst", // serve cache immediately, refetch in background
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
```

`networkMode: "offlineFirst"` lets queries return cached data without waiting for the network, then refetches when online.

---

## What NOT to Cache with React Query

React Query is for **server state** (data from APIs). Don't use it for:

- **UI state** (modals, tab selection) → use React state
- **Form state** → use React state or a form library
- **App settings** (theme, language) → use MMKV directly
- **Auth tokens** → use MMKV with encryption

Keep the boundary clear: React Query = server data, MMKV = local data.
