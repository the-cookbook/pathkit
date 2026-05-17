# `@cookbook/pathkit` Examples

Real-world usage examples for `@cookbook/pathkit`.

## Structure

- `basics/` — core API usage
- `constraints/` — built-in and custom constraints
- `routing/` — router-like usage, API gateways, middleware, fallback handling
- `applications/` — navigation, SSR, sitemap, breadcrumbs, localization
- `testing/` — test isolation and error handling

Most examples use root imports:

```ts
import { compile, match } from '@cookbook/pathkit';
```

Deep imports are also supported:

```ts
import match from '@cookbook/pathkit/match';
import compile from '@cookbook/pathkit/compile';
```
