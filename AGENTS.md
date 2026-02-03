# AGENTS.md

This file provides guidelines for AI agents working on the petner-app codebase.

## Build Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# No test or lint scripts configured - consider adding them
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define types in `types.ts` - avoid inline types
- Use interfaces for object shapes, types for unions/primitives
- Avoid `any` - use `unknown` or explicit types instead
- Use `React.FC` for functional components with explicit props

### Imports
- React must be imported: `import React from 'react'`
- Group imports: types first, then components, then icons
- Use absolute imports from `types.ts` (e.g., `from '../types'`)
- Icons from `./Icons` in multi-line format for readability

### Naming Conventions
- **Components**: PascalCase (e.g., `HomePage`, `CommunityPage`)
- **Props interfaces**: ComponentNameProps (e.g., `HomePageProps`)
- **Variables/functions**: camelCase (e.g., `handlePageChange`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_DAILY_LIKES`)
- **Files**: lowercase with dashes (e.g., `bottom-nav.tsx`)

### Components
- Keep components in single file when under ~2000 lines (current pattern)
- Use `React.FC<{ prop1: Type; prop2: Type }>` for props
- Destructure props in component signature
- Use functional components only (no class components)

### State Management
- Use `React.useState` for local state
- Group related state when possible: `const [posts, setPosts] = useState<Post[]>([])`
- Initial state with proper TypeScript types

### Error Handling
- Use `alert()` for user-facing errors (current pattern)
- Add null checks: `post.likedBy?.includes()` instead of direct access
- Defensive programming for optional properties

### Tailwind CSS
- Use utility classes consistently: `className="flex items-center justify-between"`
- Color palette: primary purple (`text-purple-600`), grays for text
- Responsive prefixes: `md:`, `lg:` for breakpoints
- Consistent spacing: `p-4`, `m-2`, `gap-4`

### File Structure
```
src/
  App.tsx              # Main app with root state
  index.tsx            # Entry point
  types.ts             # All TypeScript interfaces/types
  components/
    App.tsx            # Main component with all page definitions
    BottomNav.tsx      # Navigation
    Icons.tsx          # Icon components
```

### Git Workflow
- Commit with clear messages: "Add like limit feature" not "update"
- Push after each feature: `git push origin main`
- No force pushes to main

### Special Notes
- This is a pet memorial services web app (React + Vite + TypeScript)
- No backend currently - all data is local state
- User ID hardcoded as `U-182374` for demo
- Daily like limit: `MAX_DAILY_LIKES = 10`
- Post deletion restricted to post author only
