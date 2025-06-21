# Technical Debt: General Code Structure & Tooling

> **Note**: Follow [code_guidelines.md](./code_guidelines.md) for all implementation work.

- **Date Created**: 2025-06-20
- **Project**: humans.inc
- **Status**: Open
- **Reported By**: Code audit against new guidelines

## Issues Identified

### 1. Testing Infrastructure Missing

**Issue**: No automated testing setup, making refactoring and feature development risky.

**Impact**:

- Bugs can slip through without detection
- Refactoring becomes dangerous without safety net
- Manual testing doesn't scale as codebase grows

**Solution**:

- Install Vitest + React Testing Library
- Configure Husky hook: `pnpm test --run --changed` on commit
- Create basic test structure in `src/tests/` or colocated

**Priority**: High (blocks safe refactoring)

### 2. Prettier Tailwind Plugin Missing

**Issue**: Tailwind classes are not consistently ordered, making code harder to read.

**Reference**: https://github.com/ianvs/prettier-plugin-tailwindcss

**Solution**:

- Install `@ianvs/prettier-plugin-tailwindcss`
- Add to `.prettierrc.json` plugins array
- Auto-sorts classes in official Tailwind order (layout → spacing → typography → colors → states)

**Priority**: Medium (code quality)

### 3. ESLint Boundaries Plugin Missing

**Issue**: No enforcement of import boundaries between feature slices.

**Impact**:

- Features can accidentally import from peer features
- Creates tight coupling, makes testing harder
- Violates clean architecture principles

**Solution**:

- Install `eslint-plugin-boundaries`
- Configure rules to prevent `src/features/auth` from importing `src/features/blocks`
- Allow imports from `src/lib`, `src/types`, `src/components`

**Priority**: Medium (architecture enforcement)

### 4. Duplicate lib/ Directories

**Issue**: Both root `lib/` and `src/lib/` exist, creating confusion.

**Current State**:

- Root `lib/` contains: README.md, supabase/ (2 files)
- `src/lib/` contains: 3 files

**Solution**:

- Consolidate under `src/lib/`
- Update any imports that reference root `lib/`
- Remove root `lib/` directory

**Priority**: Low (cleanup)

### 5. Missing Global Types Directory

**Issue**: No centralized location for cross-feature TypeScript types.

**Solution**:

- Create `src/types/` directory
- Move global types like `UserProfile`, `DatabaseTypes` here
- Export through `src/types/index.ts`

**Priority**: Medium (needed for Phase 2 tasks)

### 6. Empty Tests Directory Structure

**Issue**: No test directory structure to encourage testing.

**Solution**:

- Create `src/tests/` with subdirectories:
  - `src/tests/components/`
  - `src/tests/features/`
  - `src/tests/lib/`
- Add README explaining test conventions

**Priority**: Low (organizational)

### 7. PostCSS Config Backup File

**Issue**: `postcss.config.mjs.bak` exists in repo.

**Status**: **KEEP FOR NOW** - Contains working Tailwind v4 configuration from extensive debugging session. Remove only after current config is proven stable.

**Priority**: Low (cleanup, deferred)

## Next Steps

1. **High Priority**: Set up Vitest + RTL + Husky test hook
2. **Medium Priority**: Install Prettier Tailwind plugin
3. **Medium Priority**: Create `src/types/` directory (needed for Phase 2)
4. **Medium Priority**: Install ESLint boundaries plugin
5. **Low Priority**: Consolidate lib directories
6. **Low Priority**: Create test directory structure
