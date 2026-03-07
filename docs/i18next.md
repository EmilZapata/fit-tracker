# i18next + react-i18next Documentation (Context7)

> Fetched: 2026-03-07 | i18next ^25.8.x | react-i18next ^16.5.x

---

## Table of Contents

1. [i18next Initialization and Configuration](#1-i18next-initialization-and-configuration)
2. [useTranslation Hook](#2-usetranslation-hook)
3. [Trans Component for JSX Interpolation](#3-trans-component-for-jsx-interpolation)
4. [Pluralization](#4-pluralization)
5. [Interpolation](#5-interpolation)
6. [Namespaces](#6-namespaces)
7. [Language Detection and Switching](#7-language-detection-and-switching)
8. [React Native Specific Setup](#8-react-native-specific-setup)
9. [Translation File Structure (JSON)](#9-translation-file-structure-json)
10. [TypeScript Integration](#10-typescript-integration)

---

## 1. i18next Initialization and Configuration

### Basic Initialization

```javascript
import i18next from 'i18next';

i18next.init({
  fallbackLng: 'en',
  ns: ['file1', 'file2'],
  defaultNS: 'file1',
  debug: true
}, (err, t) => {
  if (err) return console.log('something went wrong loading', err);
  t('key'); // -> same as i18next.t
});
```

Initialization also supports Promises:

```javascript
i18next
  .init({ /* options */ })
  .then(function(t) { t('key'); });
```

### Comprehensive Configuration Options

```javascript
import i18next from 'i18next';

i18next.init({
  // --- Language settings ---
  lng: 'en',                           // current language
  fallbackLng: 'en',                   // fallback when key is missing
  supportedLngs: ['en', 'de', 'fr'],   // allowed languages
  nonExplicitSupportedLngs: false,      // if true, 'en-US' matches 'en'
  load: 'all',                          // 'all' | 'currentOnly' | 'languageOnly'
  preload: ['en', 'de'],               // languages to preload
  lowerCaseLng: false,                  // lowercase language code
  cleanCode: false,                     // strip region from language code

  // --- Namespace settings ---
  ns: ['translation', 'common'],
  defaultNS: 'translation',
  fallbackNS: ['common'],

  // --- Resource settings ---
  resources: {
    en: { translation: { "key": "value" } }
  },
  partialBundledLanguages: false,

  // --- Missing keys ---
  saveMissing: false,
  updateMissing: false,
  saveMissingTo: 'fallback',           // 'current' | 'all' | 'fallback'
  missingKeyHandler: (lngs, ns, key, fallbackValue) => {
    console.warn(`Missing key: ${key}`);
  },

  // --- Translation defaults ---
  returnNull: false,
  returnEmptyString: true,
  returnObjects: false,
  returnDetails: false,
  joinArrays: false,
  postProcess: false,

  // --- Interpolation ---
  interpolation: {
    escapeValue: true,                  // escapes HTML (set false for React)
    prefix: '{{',
    suffix: '}}',
    formatSeparator: ',',
    defaultVariables: { appName: 'MyApp' }
  },

  // --- Other ---
  debug: false,
  initImmediate: true,
  keySeparator: '.',
  nsSeparator: ':',
  pluralSeparator: '_',
  contextSeparator: '_',
  ignoreJSONStructure: true,
  maxParallelReads: 10
}, (err, t) => {
  if (err) return console.error('Init failed:', err);
  console.log('i18next ready');
});
```

### Fallback Language Strategies

```javascript
// Single fallback
i18next.init({ fallbackLng: 'en' });

// Ordered fallback list
i18next.init({ fallbackLng: ['fr', 'en'] });

// Per-language fallback map
i18next.init({
  fallbackLng: {
    'de-CH': ['fr', 'it'],
    'zh-Hant': ['zh-Hans', 'en'],
    'es': ['fr'],
    'default': ['en']
  }
});

// Dynamic fallback via function
i18next.init({
  fallbackLng: (code) => {
    const fallbacks = [code];
    const langPart = code.split('-')[0];
    if (langPart !== code) fallbacks.push(langPart);
    fallbacks.push('en');
    return fallbacks;
  }
});
```

---

## 2. useTranslation Hook

The `useTranslation` hook is the primary way to access translations in React functional components. It returns the `t` function, the `i18n` instance, and a `ready` boolean.

### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n, ready } = useTranslation();

  if (!ready) return <div>Loading...</div>;

  return (
    <div>
      {/* Simple translation */}
      <h1>{t('title')}</h1>

      {/* Translation with interpolation */}
      <p>{t('welcome', { name: 'John' })}</p>
      {/* JSON: { "welcome": "Hello {{name}}!" } */}

      {/* Nested keys */}
      <p>{t('description.part1')}</p>
      {/* JSON: { "description": { "part1": "Some text" } } */}

      {/* Pluralization */}
      <p>{t('items', { count: 5 })}</p>
      {/* JSON: { "items_one": "{{count}} item", "items_other": "{{count}} items" } */}

      {/* Default fallback value */}
      <p>{t('missing.key', 'Default fallback text')}</p>
    </div>
  );
}
```

### Hook Options

```jsx
// With specific namespace
const { t: tCommon } = useTranslation('common');

// With multiple namespaces
const { t: tMulti } = useTranslation(['common', 'validation']);

// With key prefix for nested translations
const { t: tNested } = useTranslation('translation', {
  keyPrefix: 'forms.login'
});
// t('email') resolves to 'forms.login.email'

// With custom options
const { t: tCustom } = useTranslation('translation', {
  useSuspense: false,                     // disable Suspense, show fallback
  lng: 'de',                              // force specific language
  bindI18n: 'languageChanged loaded',     // events that trigger re-render
  nsMode: 'fallback',                     // use namespaces as fallbacks
});
```

### Language Switching via the i18n Instance

```jsx
function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('de')}>German</button>
    </div>
  );
}
```

---

## 3. Trans Component for JSX Interpolation

The `Trans` component allows embedding React components and HTML elements directly inside translation strings.

### Basic Usage

```jsx
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

function TransExamples() {
  const count = 5;
  const name = 'World';

  return (
    <div>
      {/* Basic embedded components */}
      <Trans i18nKey="description.part1">
        To get started, edit <code>src/App.js</code> and save to reload.
      </Trans>

      {/* With interpolation, plurals, and components */}
      <Trans i18nKey="userMessagesUnread" count={count}>
        Hello <strong title="Name">{{ name }}</strong>, you have {{ count }} unread message.
        <Link to="/msgs">Go to messages</Link>.
      </Trans>
    </div>
  );
}
```

### Components Prop (Array and Object Forms)

```jsx
{/* Array form: tags referenced by index <0>, <1>, <2> in JSON */}
<Trans
  i18nKey="richText"
  components={[<strong />, <em />, <Link to="/help" />]}
/>
{/* JSON: "richText": "This is <0>bold</0> and <1>italic</1>. <2>Help</2>." */}

{/* Object form: named tags <bold>, <link> in JSON */}
<Trans
  i18nKey="namedComponents"
  components={{ bold: <strong />, link: <Link to="/docs" /> }}
/>
{/* JSON: "namedComponents": "This is <bold>bold</bold>. See <link>docs</link>." */}
```

### Additional Trans Features

```jsx
{/* With context */}
<Trans i18nKey="greeting" context="male" tOptions={{ name: 'John' }}>
  Hello {{ name }}!
</Trans>

{/* With fallback via defaults prop */}
<Trans i18nKey="possiblyMissing" defaults="This is the fallback text." />

{/* With HTML entity unescaping */}
<Trans i18nKey="htmlEntities" shouldUnescape>
  Text with &amp; entities
</Trans>

{/* Wrap output in a parent element */}
<Trans i18nKey="wrapped" parent="p" className="description">
  This will be wrapped in a p tag.
</Trans>
```

---

## 4. Pluralization

i18next uses the `Intl.PluralRules` API (JSON v4 format). Pass `count` to the `t` function to trigger plural resolution.

### Basic Plurals (English: one/other)

```json
{
  "items_one": "{{count}} item",
  "items_other": "{{count}} items"
}
```

```javascript
i18next.t('items', { count: 1 });   // -> "1 item"
i18next.t('items', { count: 5 });   // -> "5 items"
```

### Complex Plurals (e.g., Arabic: zero/one/two/few/many/other)

```json
{
  "keyPluralMultipleEgArabic_zero": "the plural form 0",
  "keyPluralMultipleEgArabic_one": "the plural form 1",
  "keyPluralMultipleEgArabic_two": "the plural form 2",
  "keyPluralMultipleEgArabic_few": "the plural form 3",
  "keyPluralMultipleEgArabic_many": "the plural form 4",
  "keyPluralMultipleEgArabic_other": "the plural form 5"
}
```

### Plurals Combined with Context

```json
{
  "friend_male_one": "A boyfriend",
  "friend_male_other": "{{count}} boyfriends",
  "friend_female_one": "A girlfriend",
  "friend_female_other": "{{count}} girlfriends"
}
```

```javascript
i18next.t('friend', { context: 'male', count: 1 });     // -> "A boyfriend"
i18next.t('friend', { context: 'female', count: 100 });  // -> "100 girlfriends"
```

---

## 5. Interpolation

### Basic Interpolation

```json
{
  "welcome": "Hello {{name}}, welcome to {{appName}}!"
}
```

```javascript
i18next.t('welcome', { name: 'Alice', appName: 'TrackGym' });
// -> "Hello Alice, welcome to TrackGym!"
```

### Unescaped Interpolation

Use `{{- value}}` to skip HTML escaping:

```json
{
  "rawHtml": "Content: {{- htmlContent}}"
}
```

### Formatting (Numbers, Currency, Dates, Relative Time, Lists)

i18next has built-in formatters powered by the `Intl` API.

```json
{
  "intlNumber": "Some {{val, number}}",
  "intlNumberWithOptions": "Some {{val, number(minimumFractionDigits: 2)}}",
  "intlCurrency": "The value is {{val, currency(USD)}}",
  "intlDateTime": "On the {{val, datetime}}",
  "intlRelativeTime": "Lorem {{val, relativetime}}",
  "intlList": "A list of {{val, list}}"
}
```

```javascript
i18next.t('intlNumber', { val: 1000 });
// -> "Some 1,000"

i18next.t('intlNumber', { val: 1000.1, minimumFractionDigits: 3 });
// -> "Some 1,000.100"

i18next.t('intlNumberWithOptions', { val: 2000 });
// -> "Some 2,000.00"

i18next.t('intlCurrency', { val: 2000 });
// -> "The value is $2,000.00"

i18next.t('intlDateTime', { val: new Date(Date.UTC(2012, 11, 20, 3, 0, 0)) });
// -> "On the 12/20/2012"

i18next.t('intlDateTime', {
  val: new Date(Date.UTC(2012, 11, 20, 3, 0, 0)),
  formatParams: {
    val: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  }
});
// -> "On the Thursday, December 20, 2012"

i18next.t('intlRelativeTime', { val: 3 });
// -> "Lorem in 3 days"

i18next.t('intlList', { val: ['locize', 'i18next', 'awesomeness'] });
// -> "A list of locize, i18next, and awesomeness"
```

### Custom Formatters

```javascript
i18next.services.formatter.add('lowercase', (value, lng, options) => {
  return value.toLowerCase();
});

i18next.services.formatter.add('underscore', (value, lng, options) => {
  return value.replace(/\s+/g, '_');
});
```

```json
{
  "custom": "Value: {{val, lowercase}}"
}
```

### Nesting (Referencing Other Keys)

Use `$t(key)` inside translation values to reference other keys:

```json
{
  "nesting1": "1 $t(nesting2)",
  "nesting2": "2 $t(nesting3)",
  "nesting3": "3",
  "key1": "hello world",
  "key2": "say: {{val}}",
  "girlsAndBoys": "They have $t(girls, {\"count\": {{girls}} }) and $t(boys, {\"count\": {{boys}} })",
  "boys_one": "{{count}} boy",
  "boys_other": "{{count}} boys",
  "girls_one": "{{count}} girl",
  "girls_other": "{{count}} girls"
}
```

```javascript
i18next.t('nesting1');
// -> "1 2 3"

i18next.t('key2', { val: '$t(key1)' });
// -> "say: hello world"

i18next.t('girlsAndBoys', { girls: 3, boys: 2 });
// -> "They have 3 girls and 2 boys"
```

---

## 6. Namespaces

Namespaces let you split translations into multiple files/modules (e.g., `common.json`, `auth.json`, `settings.json`).

### Configuration

```javascript
i18next.init({
  ns: ['app', 'common'],
  defaultNS: 'app',
  fallbackNS: 'common'
}, () => {
  i18next.t('title');             // looks in 'app' namespace first
  i18next.t('button.save');       // falls back to 'common' if not in 'app'
  i18next.t('button.save', { ns: 'common' }); // explicit namespace via option
});
```

### Using Namespaces in React

```jsx
// Load a specific namespace
const { t } = useTranslation('common');

// Load multiple namespaces; first is default
const { t } = useTranslation(['settings', 'common']);

// Access keys from a non-default namespace
t('save', { ns: 'common' });
```

---

## 7. Language Detection and Switching

### Language Switching

```jsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div>
      <button onClick={() => i18n.changeLanguage('en')}>EN</button>
      <button onClick={() => i18n.changeLanguage('de')}>DE</button>
      <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
      <p>Current language: {i18n.language}</p>
      <p>Resolved language: {i18n.resolvedLanguage}</p>
    </div>
  );
}
```

### Browser Language Detection Plugin

```bash
npm install i18next-browser-languagedetector
```

```javascript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'fr'],
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false  // React already escapes
    }
  });
```

---

## 8. React Native Specific Setup

### Installation

```bash
npm install i18next react-i18next
# Optional: for async storage-based language detection
npm install react-native-localize @os-team/i18next-react-native-language-detector
```

### i18n Configuration for React Native

```javascript
// src/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';

i18next
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    interpolation: {
      escapeValue: false  // not needed for React Native
    },
    compatibilityJSON: 'v4',  // use v4 plural rules
    react: {
      useSuspense: false  // recommended for React Native
    }
  });

export default i18next;
```

### App Entry Point

```jsx
// App.tsx
import React from 'react';
import './src/i18n';  // side-effect import to initialize
import { useTranslation } from 'react-i18next';
import { View, Text, Button } from 'react-native';

export default function App() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('title')}</Text>
      <Button title="EN" onPress={() => i18n.changeLanguage('en')} />
      <Button title="DE" onPress={() => i18n.changeLanguage('de')} />
    </View>
  );
}
```

### Using I18nextProvider (Alternative Pattern)

If you need to pass a custom i18n instance (useful for testing or multiple instances):

```jsx
import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';

function App() {
  return (
    <I18nextProvider i18n={i18n} defaultNS="translation">
      <MainNavigator />
    </I18nextProvider>
  );
}
```

---

## 9. Translation File Structure (JSON)

i18next uses JSON v4 format by default. Below is a comprehensive example.

### File: `locales/en/translation.json`

```json
{
  "title": "Welcome to TrackGym",
  "greeting": "Hello, {{name}}!",

  "nav": {
    "home": "Home",
    "workouts": "Workouts",
    "settings": "Settings"
  },

  "workouts": {
    "count_one": "{{count}} workout",
    "count_other": "{{count}} workouts",
    "empty": "No workouts yet. Start training!",
    "duration": "Duration: {{val, number}} minutes"
  },

  "friend_male_one": "A male training partner",
  "friend_male_other": "{{count}} male training partners",
  "friend_female_one": "A female training partner",
  "friend_female_other": "{{count}} female training partners",

  "nested": "Reuse: $t(nav.home)",
  "richText": "Click <0>here</0> to <1>start</1>.",
  "namedTags": "Read the <link>documentation</link> for <bold>details</bold>.",

  "intlDate": "Logged on {{val, datetime}}",
  "intlCurrency": "Price: {{val, currency(USD)}}"
}
```

### File: `locales/en/common.json`

```json
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm"
  },
  "errors": {
    "required": "This field is required",
    "network": "Network error. Please try again."
  }
}
```

### Multi-Namespace Loading

```javascript
i18next.init({
  ns: ['translation', 'common'],
  defaultNS: 'translation',
  fallbackNS: 'common',
  resources: {
    en: {
      translation: require('./locales/en/translation.json'),
      common: require('./locales/en/common.json'),
    },
    de: {
      translation: require('./locales/de/translation.json'),
      common: require('./locales/de/common.json'),
    },
  },
});
```

---

## 10. TypeScript Integration

### Declare the Resource Type

Create a type definition file that maps your JSON structure:

```typescript
// src/i18n/resources.ts
import translation from '../locales/en/translation.json';
import common from '../locales/en/common.json';

const resources = {
  translation,
  common,
} as const;

export default resources;
```

### Augment the i18next Module

```typescript
// src/i18n/i18next.d.ts
import 'i18next';
import resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources;
    // returnNull: false;  // optional: disallow null returns
  }
}
```

### Benefits

With this setup, `t('...')` calls are fully type-checked:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  t('title');                        // OK
  t('nav.home');                     // OK
  t('workouts.count', { count: 3 }); // OK
  // t('nonExistent');               // TypeScript error: key does not exist
  // t('greeting');                  // TypeScript error if 'name' param missing
                                     //   (requires interpolation arg)

  const { t: tCommon } = useTranslation('common');
  tCommon('buttons.save');           // OK
  // tCommon('buttons.typo');        // TypeScript error

  return <div>{t('title')}</div>;
}
```

### Full i18n Setup File with TypeScript

```typescript
// src/i18n/index.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import commonEN from '../locales/en/common.json';
import translationDE from '../locales/de/translation.json';
import commonDE from '../locales/de/common.json';

export const defaultNS = 'translation' as const;

export const resources = {
  en: {
    translation: translationEN,
    common: commonEN,
  },
  de: {
    translation: translationDE,
    common: commonDE,
  },
} as const;

i18next
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS,
    ns: ['translation', 'common'],
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
```
