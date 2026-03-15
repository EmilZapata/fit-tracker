# Turborepo Monorepo Setup

## Repository Structure

```
fit-tracker/
├── apps/
│   ├── mobile/          ← Expo React Native app
│   └── sanity-studio/   ← Sanity CMS Studio
├── packages/            ← shared packages
├── turbo.json           ← task pipeline config
├── pnpm-workspace.yaml  ← workspace declaration
└── package.json         ← root package (turbo devDep)
```

## pnpm Workspaces

Declared in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

All packages under `apps/` and `packages/` are automatically recognized as workspaces.

## Task Pipeline (turbo.json)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "persistent": true, "cache": false },
    "build": { "outputs": ["dist/**", ".next/**", ".sanity/**"] },
    "lint": {},
    "check-types": {}
  }
}
```

- **`dev`**: Persistent (long-running), no caching — used for dev servers.
- **`build`**: Cacheable, outputs are stored for incremental builds.
- **`lint`** / **`check-types`**: Cacheable tasks with no declared outputs.

## Common Commands

```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev:mobile        # Expo app only
pnpm dev:studio        # Sanity Studio only

# Build all
pnpm build

# Type-check all
pnpm check-types

# Filter by package name
turbo run build --filter=fit-tracker
turbo run dev --filter=sanity-studio

# Filter by directory
turbo run build --filter=./apps/mobile

# Run only affected packages (based on git changes)
turbo run build --affected

# Dry run (see what would execute)
turbo run build --dry

# Visualize task graph
turbo run build --graph
```

## Adding a New Package

1. Create directory under `packages/`:
   ```bash
   mkdir -p packages/shared-utils
   ```

2. Add `package.json`:
   ```json
   {
     "name": "@fit-tracker/shared-utils",
     "version": "0.0.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```

3. Reference from consuming workspace:
   ```json
   {
     "dependencies": {
       "@fit-tracker/shared-utils": "workspace:*"
     }
   }
   ```

4. Run `pnpm install` to link workspaces.

5. Optionally add per-package turbo config (`packages/shared-utils/turbo.json`):
   ```json
   {
     "extends": ["//"],
     "tasks": {
       "build": { "outputs": ["dist/**"] }
     }
   }
   ```

## Metro Configuration for Monorepo

The Expo app (`apps/mobile/metro.config.js`) requires special config to resolve packages from the monorepo root:

```js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo
config.watchFolders = [monorepoRoot];

// Resolve node_modules from both workspace and root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
```

## Dependency Management

- **Root dependencies**: Only `turbo` and tooling that applies globally.
- **Workspace dependencies**: Each app/package declares its own deps in its `package.json`.
- **Shared dependencies**: Use `workspace:*` protocol for internal packages.
- **Version conflicts**: pnpm isolates versions per workspace. Use `pnpm.overrides` in root `package.json` if you need to force a single version.
- **Install**: Always run `pnpm install` from the monorepo root.

## Troubleshooting

- **Metro can't find modules**: Ensure `watchFolders` and `nodeModulesPaths` are set in metro.config.js.
- **pnpm strict symlinking issues**: Add `node-linker=hoisted` to `.npmrc` as a last resort.
- **Turbo cache issues**: Run `turbo run build --force` to bypass cache.
