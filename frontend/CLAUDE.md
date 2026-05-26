# Frontend Project Guide

## Project Background

This is the frontend for a **Graduation Credit Checker System**, allowing students to view their course history and verify whether they meet graduation requirements.

Target users: University students
Core features:
- Display completed and remaining credit status
- Organize credits by category (required, elective, general education, etc.)
- Clearly indicate how many credits are still needed to graduate

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── assets/        # Static assets (images, fonts, etc.)
├── components/    # Shared components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Root component
```

## Commit Message Template

Use **Conventional Commits** format:

```
<type>: <short summary>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or UI component |
| `fix` | Bug fix |
| `style` | Visual/styling changes only (colors, spacing, layout) |
| `refactor` | Code restructure without behavior change |
| `chore` | Config, dependencies, tooling |
| `docs` | Documentation changes |

Examples:
```
feat: add credit progress card to hero section
fix: correct progress bar percentage calculation
style: update hero gradient to use brand blue #036eb8
refactor: extract ProgressBar into shared component
chore: add Tailwind CSS and configure vite plugin
docs: add commit message template to CLAUDE.md
```

Rules:
- Use lowercase for type and summary
- Keep summary under 72 characters
- No period at the end
- Write in imperative mood ("add", not "added" or "adds")
- Do not include Co-Authored-By trailers in commit messages

## Code Style

- Use **Functional Components** only, no Class Components
- Component files use **PascalCase**, e.g. `Button.tsx`, `NavBar.tsx`
- Utility functions and hooks use **camelCase**, e.g. `useAuth.ts`, `formatDate.ts`
- Each component lives in its own file under the relevant folder in `components/`
- Always define a TypeScript interface for props, named `ComponentNameProps`

```tsx
// Good example
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded ${variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
      {label}
    </button>
  );
}
```

## TypeScript Rules

- Never use `any`; use `unknown` or generics for flexible types
- Prefer `interface` for object types; use `type` for unions or complex types
- Do not omit return types unless obvious

## Tailwind CSS Rules

- Use Tailwind utility classes; avoid writing separate CSS files
- If class strings get too long, extract into a component or use `cn()` / `clsx()`
- Write RWD styles mobile-first (`sm:`, `md:`, `lg:`)

## Component Principles

- Keep components single-responsibility — one component does one thing
- Extract shared logic into custom hooks (place in `hooks/`)
- Avoid props drilling beyond two levels; use Context or state management instead
- Always handle loading and error states for async data

## Previewing the App

To preview the site, start the dev server and open it in Safari:

```bash
npm run dev
open -a Safari http://localhost:5173
```

Do not use chromium-cli or screenshots — always open in Safari.

## Notes

- Never modify `node_modules` directly
- Store environment variables in `.env.local`; do not commit to git
- Before adding a new package, check if a lighter alternative exists
