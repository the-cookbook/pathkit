# Pathkit

A modern starter repository for publishing a TypeScript library to npm.

## Stack

- TypeScript with strict compiler settings
- Rollup for ESM, CommonJS, source maps, and bundled declarations
- Vitest for unit tests and coverage
- ESLint flat config with TypeScript-aware rules
- Prettier formatting
- GitHub Actions CI
- npm provenance-ready publishing config

## Getting started

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Development scripts

```bash
npm run build         # Clean and build dist output
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run coverage      # Run tests with coverage report
npm run typecheck     # Type-check without emitting files
npm run lint          # Run ESLint
npm run format        # Format files with Prettier
```

## Publishing

1. Update `package.json`:
   - `name`
   - `description`
   - `author`
   - `repository`
   - `homepage`
   - `bugs`
2. Log in to npm:

```bash
npm login
```

3. Build and inspect the package:

```bash
npm run build
npm pack --dry-run
```

4. Publish:

```bash
npm publish
```

For scoped public packages, keep:

```json
"publishConfig": {
  "access": "public",
  "provenance": true
}
```

## Example

```ts
import { createGreeting } from '@your-scope/typescript-npm-package-starter';

createGreeting({ name: 'World' });
```

## Project structure

```text
.
├── src/
│   └── index.ts
├── test/
│   └── index.test.ts
├── rollup.config.mjs
├── vitest.config.ts
├── tsconfig.json
├── tsconfig.build.json
├── eslint.config.js
└── package.json
```
