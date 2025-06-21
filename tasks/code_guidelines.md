# Code & Style Guidelines (v0.1)

> Adopted 2025-06-20 – subject to PR review

## 1. Project Layout

```
src/
  app/               → route folders only (Next.js "pages")
  components/        → shared presentational components
  features/          → vertical slices (auth, blocks, posts…)
    ├─ components/
    ├─ hooks/
    ├─ lib/
    └─ schema.ts
  lib/               → truly global helpers (supabase, api, date…)
  types/             → cross-feature TS types/enums
  tests/             → Vitest / RTL if not colocated
```

- Root files: `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, etc.

## 2. Naming

• PascalCase React components, camelCase everything else.  
• Suffix `.client.tsx` only when required.  
• Barrel export (`index.ts`) in each folder; consumers import from folder root.

## 3. Styling

• Prefer Tailwind utilities; custom CSS only in `@layer components` of `globals.css`.  
• Class order: `/* layout | spacing | typography | color | state */`.  
• Dark-mode interim: use CSS vars `var(--background)`/`--foreground` until Tailwind `dark:` fixed.  
• Prettier plugin `@ianvs/prettier-plugin-tailwindcss` enforces class sorting.

## 4. Type-safety

• All DB tables mirrored with Zod & `type infer`.  
• Wrap `fetch`/Supabase in typed helpers; no unchecked `any`.

## 5. Testing

• Vitest + React Testing Library; minimum render test per component + happy-path per hook.  
• Husky runs `pnpm test --run --changed`.

## 6. Linting / Boundaries

• ESLint + `eslint-plugin-boundaries` to forbid cross-slice imports (`features/*` must not import peer slices).  
• `eslint-plugin-tailwindcss` for classnames.
