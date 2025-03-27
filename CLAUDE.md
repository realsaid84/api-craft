# API Spike Docs Development Guide

## Commands
- Build: `npm run build`
- Dev: `npm run dev --turbopack`
- Start: `npm run start`
- Lint: `npm run lint`

## Code Style Guidelines
- **Formatting**: Follow Next.js conventions. Use TypeScript.
- **Component Structure**: Use shadcn/ui patterns with separation of UI and logic.
- **Imports**: Group imports by external libraries first, then internal modules.
- **Types**: Always use explicit TypeScript types. Avoid `any`.
- **Naming**: 
  - React components: PascalCase (e.g., `DataModelEditor`)
  - Functions/variables: camelCase
  - Files: Follow component name or purpose
- **Error Handling**: Use try/catch for async operations.
- **File Organization**: Place components in appropriate directories:
  - UI components: `/components/ui/`
  - Page components: `/components/pages/`
  - Layouts: `/components/layouts/`
  - Widgets: `/components/widgets/`