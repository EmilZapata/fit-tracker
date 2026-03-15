# Sanity v5 Reference

## Studio Configuration

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'My Project',
  projectId: 'your-project-id',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
```

## Schema Definition

Use `defineType`, `defineField`, and `defineArrayMember` for type-safety:

```typescript
import { defineType, defineField, defineArrayMember } from 'sanity'

export const exerciseType = defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: ['strength', 'cardio', 'flexibility'],
      },
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'muscles',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
})
```

### Common Field Types

| Type | Description |
|------|-------------|
| `string` | Single-line text |
| `text` | Multi-line text |
| `number` | Numeric value |
| `boolean` | True/false |
| `date` / `datetime` | Date values |
| `slug` | URL-friendly string |
| `image` | Image with optional hotspot |
| `file` | Any file type |
| `reference` | Reference to another document |
| `array` | Array of items |
| `block` | Portable Text (rich text) |
| `object` | Nested object |

### References

```typescript
defineField({
  name: 'author',
  type: 'reference',
  to: [{ type: 'person' }],
})
```

### Portable Text (Rich Text)

```typescript
defineField({
  name: 'body',
  type: 'array',
  of: [
    defineArrayMember({ type: 'block' }),
    defineArrayMember({ type: 'image' }),
  ],
})
```

### Validation

```typescript
defineField({
  name: 'title',
  type: 'string',
  validation: (rule) => rule.required().min(5).max(100),
})

defineField({
  name: 'email',
  type: 'string',
  validation: (rule) => rule.required().email(),
})

defineField({
  name: 'count',
  type: 'number',
  validation: (rule) => rule.min(0).max(999).integer(),
})
```

## GROQ Queries

### Basic Syntax

```groq
// All documents of a type
*[_type == "exercise"]

// With ordering and limit
*[_type == "exercise"] | order(name asc) [0...10]

// Specific fields (projection)
*[_type == "exercise"]{ _id, name, category }

// Filter
*[_type == "exercise" && category == "strength"]

// Computed field names MUST use quotes
*[_type == "exercise"]{ "upperName": upper(name) }

// References (dereference with ->)
*[_type == "workout"]{
  title,
  exercises[]{ exercise-> }
}
```

### Text Search

```groq
*[_type == "exercise" && name match "bench*"]
*[_type == "post" && body match text::query("search terms")]
```

### Image URLs

```groq
*[_type == "exercise"]{
  name,
  "imageUrl": image.asset->url
}
```

## Client Configuration

```typescript
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2024-01-01',  // use a UTC date string
  useCdn: true,              // false for authenticated/fresh data
  // token: 'optional-auth-token',
})

// Fetch
const exercises = await client.fetch('*[_type == "exercise"]')

// Fetch with params
const result = await client.fetch(
  '*[_type == "exercise" && category == $cat]',
  { cat: 'strength' }
)
```

## TypeGen

### Configuration (`sanity-typegen.json`)

```json
{
  "path": "./src/**/*.{ts,tsx,js,jsx}",
  "schema": "schema.json",
  "generates": "./sanity.types.ts",
  "overloadClientMethods": true
}
```

- **`path`**: Glob pattern to TypeScript files that use GROQ queries (can be an array)
- **`schema`**: Path to schema file, generated with `sanity schema extract`
- **`generates`**: Output path for generated type definitions
- **`overloadClientMethods`**: When `true`, auto-types `client.fetch()` calls

### Commands

```bash
# Extract schema to JSON
npx sanity schema extract

# Generate types from schema + queries
npx sanity typegen generate
```

### Monorepo Configuration

When the consuming app is in a different workspace:

```json
{
  "path": "../mobile/**/*.{ts,tsx,js,jsx}",
  "schema": "./schema.json",
  "generates": "../mobile/core/libs/sanity-types/index.ts",
  "overloadClientMethods": true
}
```

## Image Handling

```typescript
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

// Usage
const url = urlFor(exercise.image).width(300).height(300).url()
```

## Environment Variables

```bash
# .env
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_API_TOKEN="your-token"  # optional, for authenticated requests
```
