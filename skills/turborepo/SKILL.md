# Turborepo Monorepo Skill

## Trigger

Use this skill when:
- Adding new workspaces or packages to the monorepo
- Modifying cross-workspace dependencies
- Changing the task pipeline (turbo.json)
- Debugging monorepo-specific issues (Metro resolution, dependency conflicts)
- Setting up CI/CD for the monorepo

## Commands Reference

### Running Tasks

```bash
# Run a task across all workspaces
turbo run <task>

# Filter by package name
turbo run <task> --filter=<package-name>

# Filter by directory
turbo run <task> --filter=./apps/mobile

# Run only affected packages (git-based)
turbo run <task> --affected

# Dry run
turbo run <task> --dry

# Force (skip cache)
turbo run <task> --force

# Visualize dependency graph
turbo run <task> --graph
```

### Advanced Filters

```bash
# Package and its dependencies
turbo run build --filter=fit-tracker...

# Package and its dependents
turbo run build --filter=...fit-tracker

# Changed packages since main
turbo run build --filter=[main]

# Specific directory pattern
turbo run build --filter=./packages/*
```

## Adding a New Workspace

1. Create directory under `apps/` or `packages/`.
2. Add `package.json` with unique `name` field.
3. For internal deps, use `"@fit-tracker/<name>": "workspace:*"`.
4. Run `pnpm install` from root.
5. Optionally add per-package `turbo.json` with `"extends": ["//"]`.

## Task Pipeline Configuration

### Root `turbo.json`

Defines the default pipeline. Tasks can declare:
- `dependsOn`: Tasks that must run first (e.g., `["^build"]` for upstream deps).
- `outputs`: Cached output directories.
- `cache`: Set `false` for non-cacheable tasks.
- `persistent`: Set `true` for long-running tasks (dev servers).

### Per-Package `turbo.json`

Extends root config:
```json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

## Metro + Monorepo

The Expo app needs these metro.config.js settings:
- `watchFolders`: Include monorepo root so Metro watches all packages.
- `nodeModulesPaths`: Resolve from both workspace and root `node_modules/`.

## Dependency Management Patterns

- Root `package.json`: Only `turbo` and repo-wide tooling.
- Each workspace owns its dependencies.
- Use `workspace:*` for internal package references.
- Run `pnpm install` from root (never from a workspace directory).
- Use `pnpm --filter=<name> add <dep>` to add deps to a specific workspace.
- Use `pnpm.overrides` in root `package.json` to force shared versions if needed.
