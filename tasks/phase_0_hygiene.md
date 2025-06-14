# Phase 0 – Project Hygiene & Tooling

This phase focuses on setting up the foundational tooling and configurations for a robust development environment.

## [DONE] Ticket 0.1: Setup `.env.example`

- **Parent Task:** [Core Repo Tooling](roadmap.md#phase-0-project-hygiene--tooling)
- **Description:** Create an `.env.example` file in the project root. This file should list all necessary environment variables for the project to run (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), along with placeholder values or descriptions of what they are for.
- **Files to Create/Modify:**
  - `/.env.example`
- **Acceptance Criteria:**
  - `.env.example` exists and is committed to the repository.
  - A developer can copy `.env.example` to `.env` and fill in their actual values to get the project running locally (once Supabase is set up).
  - The main `README.md` should briefly mention how to use the `.env.example` file.

## [DONE] Ticket 0.2: Configure Prettier & ESLint

- **Parent Task:** [Core Repo Tooling](roadmap.md#phase-0-project-hygiene--tooling)
- **Description:** Install and configure Prettier for code formatting and ESLint for linting, with a focus on strict TypeScript rules. This ensures consistent code style and helps catch potential errors early.
- **Files to Create/Modify:**
  - `package.json` (to add dev dependencies: `prettier`, `eslint`, `eslint-config-prettier`, relevant ESLint plugins for Next.js/TypeScript)
  - `.prettierrc.json` (or `.js`, `.yaml`)
  - `.eslintrc.json` (or `.js`, `.yaml`)
  - `.prettierignore`
  - `.eslintignore`
- **Acceptance Criteria:**
  - `pnpm install` (or `npm`/`yarn`) installs Prettier and ESLint.
  - Formatting and linting scripts are added to `package.json` (e.g., `format`, `lint`).
  - Running `pnpm format` (or equivalent) formats all relevant project files.
  - Running `pnpm lint` (or equivalent) checks all relevant project files and reports errors/warnings based on the configured rules.
  - Configuration files for Prettier and ESLint are present and define the project's coding standards.

## [DONE] Ticket 0.3: Setup Husky & lint-staged

- **Parent Task:** [Core Repo Tooling](roadmap.md#phase-0-project-hygiene--tooling)
- **Description:** Implement pre-commit hooks using Husky and lint-staged. This will automatically format and lint staged files before they are committed, maintaining code quality in the repository.
- **Files to Create/Modify:**
  - `package.json` (to add dev dependencies: `husky`, `lint-staged`)
  - `.husky/` directory with pre-commit hook configuration.
  - `lint-staged` configuration (can be in `package.json` or a separate file like `.lintstagedrc.json`).
- **Acceptance Criteria:**
  - `pnpm install` (or `npm`/`yarn`) installs Husky and lint-staged.
  - Husky pre-commit hook is configured to run lint-staged.
  - Lint-staged is configured to run Prettier and ESLint on staged files.
  - Attempting to commit files that don't adhere to formatting/linting rules either auto-fixes them or prevents the commit.

## [DONE] Ticket 0.4: Add GitHub Actions Workflow

- **Parent Task:** [Core Repo Tooling](roadmap.md#phase-0-project-hygiene--tooling)
- **Description:** Create a basic GitHub Actions workflow that runs on every push and pull request to the main branches (e.g., `main`, `develop`). This workflow should execute linting, type-checking (e.g., `tsc --noEmit`), and any initial tests.
- **Files to Create/Modify:**
  - `.github/workflows/ci.yml` (or similar name)
- **Acceptance Criteria:**
  - Workflow file is created in the correct directory.
  - Workflow is triggered on pushes and PRs to specified branches.
  - Workflow includes jobs for:
    - Checking out code.
    - Setting up Node.js.
    - Installing dependencies (e.g., `pnpm install`).
    - Running linters (e.g., `pnpm lint`).
    - Running TypeScript compiler for type checking (e.g., `pnpm typecheck`).
    - (Optional placeholder for running tests, e.g., `pnpm test`).
  - The workflow status (pass/fail) is visible on GitHub for pushes and PRs.
