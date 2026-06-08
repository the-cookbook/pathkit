---
'@cookbook/pathkit': minor
---

Add support for UUID route parameters with the new `uuid` constraint.

Examples:

```ts
{
  pattern: '/users/{id:uuid}',
  path: '/users/7d444840-9dc0-11d1-b245-5ffdce74fad2',
  matches: {
    match: true,
    params: { id: '7d444840-9dc0-11d1-b245-5ffdce74fad2' },
  },
}
```

The `uuid` constraint validates that the route parameter value matches the canonical UUID format:

```txt
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

This constraint accepts UUID-like values such as UUID v1, v3, v4, and v5, as long as they use the standard hyphenated UUID format.
