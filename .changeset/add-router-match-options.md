---
'@cookbook/pathkit': major
---

Add new route matching options for router-style integrations.

New match options:

- `end`: controls whether a route must match the full path or can match a path prefix.
- `sensitive`: controls case-sensitive matching.
- `wildcardFormat`: controls whether wildcard params are returned as a `string` or `string[]`.
- `decode`: controls whether matched params are returned raw, decoded with `decodeURIComponent`, or decoded with a custom function.

Successful match results now include the consumed `path`, which is required for prefix-based middleware mounting.

Wildcard parameters can now be returned as arrays by passing `wildcardFormat: 'array'`.

Params are still returned raw by default. Pass `decode: true` to decode params with `decodeURIComponent`, or pass a custom decoder function with `decode: (value) => value`.

This is marked as a major change because successful match results have an expanded return shape and wildcard params can now be typed as `string[]` when `wildcardFormat: 'array'` is used.
