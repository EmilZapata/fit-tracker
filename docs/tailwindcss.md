# Tailwind CSS Documentation (Context7)

> Fetched: 2026-03-07 | Library ID: /tailwindlabs/tailwindcss.com | tailwindcss ^3.4.0
> Note: Context7 returned mostly v4 docs. This project uses v3. Key v3 patterns are noted below.

## v3 Configuration (tailwind.config.js)

This project uses Tailwind CSS v3 with `tailwind.config.js`. The v4 `@theme` directive does NOT apply here.

### Basic v3 Config Structure

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#121063',
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
```

### Common Utility Classes Reference

#### Layout
- `flex` `flex-1` `flex-row` `flex-col` `flex-wrap`
- `items-center` `items-start` `items-end` `items-stretch`
- `justify-center` `justify-start` `justify-end` `justify-between` `justify-around`
- `self-center` `self-start` `self-end`
- `w-full` `w-1/2` `w-screen` `h-full` `h-screen`
- `absolute` `relative` `top-0` `bottom-0` `left-0` `right-0`
- `z-10` `z-20` `z-50`
- `overflow-hidden` `overflow-scroll`

#### Spacing
- `p-{n}` `px-{n}` `py-{n}` `pt-{n}` `pb-{n}` `pl-{n}` `pr-{n}`
- `m-{n}` `mx-{n}` `my-{n}` `mt-{n}` `mb-{n}` `ml-{n}` `mr-{n}`
- `gap-{n}` `space-x-{n}` `space-y-{n}`

#### Typography
- `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl`
- `font-thin` `font-light` `font-normal` `font-medium` `font-semibold` `font-bold` `font-extrabold`
- `text-left` `text-center` `text-right`
- `leading-tight` `leading-normal` `leading-relaxed`
- `tracking-tight` `tracking-normal` `tracking-wide`
- `uppercase` `lowercase` `capitalize`
- `underline` `line-through` `no-underline`

#### Colors
- `text-{color}-{shade}` (e.g., `text-blue-500`)
- `bg-{color}-{shade}` (e.g., `bg-white`, `bg-gray-100`)
- `border-{color}-{shade}`

#### Borders & Rounded
- `border` `border-2` `border-{n}`
- `rounded` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-full`

#### Shadows
- `shadow-sm` `shadow` `shadow-md` `shadow-lg` `shadow-xl` `shadow-2xl`

#### Opacity
- `opacity-0` `opacity-25` `opacity-50` `opacity-75` `opacity-100`

#### Dark Mode
- Prefix with `dark:` (e.g., `dark:bg-gray-900`, `dark:text-white`)

#### Responsive (Breakpoints)
- `sm:` (640px) `md:` (768px) `lg:` (1024px) `xl:` (1280px) `2xl:` (1536px)

---

## v4 Theme Customization (for reference)

v4 uses `@theme` directive in CSS instead of `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  --color-mint-500: oklch(0.72 0.11 178);
  --font-poppins: Poppins, sans-serif;
  --breakpoint-3xl: 120rem;
  --spacing: 0.25rem;
  --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.08);
  --animate-wiggle: wiggle 1s ease-in-out infinite;

  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
}

/* Override entire namespace */
@theme {
  --color-*: initial;
  --color-white: #fff;
  --color-primary: #3f3cbb;
}
```

### Custom Breakpoints (v4)

```css
@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-2xl: 100rem;
  --breakpoint-3xl: 120rem;
}
```

```html
<div class="grid xs:grid-cols-2 3xl:grid-cols-6">...</div>
```
