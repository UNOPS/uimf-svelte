# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **uimf-svelte**, a User Interface Metadata Framework component library built with Svelte 4 and Bootstrap 5. It automatically generates frontend UIs based on JSON metadata configurations from backend services. The library provides 80+ input and output components that can be dynamically rendered.

## Common Development Commands

```bash
# Development and preview
npm run dev                    # Start development server
npm run preview               # Preview production build

# Building
npm run build                 # Build SvelteKit app
npm run build-lib            # Build library bundle (generates bundle.js/styles.css)
npm run package              # Package for npm distribution

# Code quality
npm run lint                 # Run Prettier and ESLint checks
npm run format               # Format code with Prettier
npm run check                # TypeScript type checking
npm run check:watch          # Type checking in watch mode

# Testing
npm run test                 # Run Jest tests (builds first, then tests)
```

## Architecture

### Core Infrastructure (`src/lib/Infrastructure/`)
- **ControlRegister.ts** - Component registry and dependency injection container
- **UimfApp.ts** - Main application interface for component rendering
- **FormController.ts** - Form state management and validation
- **InputController.ts/OutputController.ts** - Base classes for component controllers

### Component Structure
- **Inputs** (`src/lib/Inputs/`) - 40+ input components (Text, Number, Typeahead, FileUpload, etc.)
- **Outputs** (`src/lib/Outputs/`) - 40+ output components (Table, Charts, Timeline, etc.)
- **Components** (`src/lib/Components/`) - Utility components and shared functionality

### Build Targets
- **SvelteKit App** - Development environment and documentation (`vite.config.js`)
- **Library Bundle** - Standalone bundle for integration (`vite.config.lib.js` → `bundle.js`)

## Key Patterns

### Component Registration
All components must be registered in `ControlRegister.ts`. Each component consists of:
- Svelte component file (`.svelte`)
- Controller class extending `InputController` or `OutputController`
- Registration entry in the control register

### Metadata-Driven Rendering
Components are instantiated via metadata objects containing:
- `type` - Component type identifier
- `customProperties` - Component-specific configuration
- `value` - Current component value

### Testing Strategy
Tests are located in `src/__test__/` and validate:
- Component registration and instantiation
- Value setting/getting across all components
- Metadata serialization/deserialization
- Test data is in `src/__test__/test_data/`

## Important Files

- **svelte.config.js** - Svelte configuration with warning suppressions
- **vite.config.lib.js** - Library build configuration targeting IE9+ with global exports
- **tsconfig.json** - TypeScript configuration for the project
- **src/app.html** - HTML template with Bootstrap and FontAwesome CDN links

## Development Notes

- Components use Bootstrap 5.3.3 classes for styling
- FontAwesome 6.5.1 for icons (assets auto-copied during build)
- TypeScript throughout with strict type checking
- Monaco Editor integrated for code editing components
- D3.js for data visualization outputs
- Library exposes `window.SvelteComponents` globally for external integration