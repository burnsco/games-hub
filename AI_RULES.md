# Project Rules

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4

## Tailwind CSS v4 Guidelines

- Use the latest Tailwind v4 syntax.
- **Gradients**: Use `bg-linear-to-*` instead of `bg-gradient-to-*`.
- **Shadows**: Use the new shadow syntax if applicable.
- **Variables**: Use native CSS variables for theme values (e.g. `var(--color-primary)`).
- **Imports**: Ensure `@import "tailwindcss";` is present in CSS files.

## Coding Standards

- **Linter**: Follow Biome linter rules strictly.
- **React**:
  - Avoid using array index as `key` prop. Use stable, unique IDs.
  - Use `type="button"` for button elements.
  - Avoid unused variables.
- **Next.js**: Use `"use client";` for client components.
