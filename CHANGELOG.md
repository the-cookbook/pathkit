# @cookbook/pathkit

## 1.0.0

### Major Changes

- f35b7e8: Add new route matching options for router-style integrations.

  New match options:
  - `end`: controls whether a route must match the full path or can match a path prefix.
  - `sensitive`: controls case-sensitive matching.
  - `wildcardFormat`: controls whether wildcard params are returned as a `string` or `string[]`.
  - `decode`: controls whether matched params are returned raw, decoded with `decodeURIComponent`, or decoded with a custom function.

  Successful match results now include the consumed `path`, which is required for prefix-based middleware mounting.

  Wildcard parameters can now be returned as arrays by passing `wildcardFormat: 'array'`.

  Params are still returned raw by default. Pass `decode: true` to decode params with `decodeURIComponent`, or pass a custom decoder function with `decode: (value) => value`.

  This is marked as a major change because successful match results have an expanded return shape and wildcard params can now be typed as `string[]` when `wildcardFormat: 'array'` is used.

## 0.4.1

### Patch Changes

- db577c1: Improve `regex` constraint normalization when generating route match patterns.

  The `regex` constraint now removes wrapping `^` and unescaped trailing `$` anchors from the provided regex source before composing the final route matcher.

  Examples:

  ```txt
  /posts/{slug:regex(^[a-z0-9-]+$)}
  /posts/{slug:regex([a-z0-9-]+)}
  ```

## 0.4.0

### Minor Changes

- dcc0878: Add support for numeric value constraints with the new `min` and `max` constraints.

  Examples:

  ```ts
  {
    pattern: '/products/{value:decimal:max(10)}',
    path: '/products/9.99',
    matches: {
      match: true,
      params: { value: '9.99' },
    },
  }

  {
    pattern: '/products/{value:decimal:min(1)}',
    path: '/products/9.99',
    matches: {
      match: true,
      params: { value: '9.99' },
    },
  }

  {
    pattern: '/products/{value:decimal:min(1):max(10)}',
    path: '/products/9.99',
    matches: {
      match: true,
      params: { value: '9.99' },
    },
  }
  ```

  Both constraints expect a numeric argument and validate the route parameter value itself.

  `min` validates that the parameter value is greater than or equal to the specified number, while `max` validates that it is less than or equal to the specified number.

  These constraints are different from `minlength` and `maxlength`, which validate the length of the parameter value instead.

- 21e7658: Add support for minimum- and maximum-length route parameters through the new `minlength` and `maxlength` constraints.

  Usage:

  ```txt
  /product/{slug:minlength(3)}
  /product/{slug:maxlength(50)}
  /product/{slug:minlength(3):maxlength(50)}
  ```

  Both constraints expect a positive integer argument. `minlength` validates that the route parameter value has at least the specified number of characters, while `maxlength` validates that it has no more than the specified number of characters.

- 64d4844: Add support for UUID route parameters with the new `uuid` constraint.

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

### Patch Changes

- 21e7658: Fix decimal constraint validation to accept negative values and add tests coverage.
- 4953807: Fix int constraint validation to accept negative values and add tests coverage.

## 0.3.1

### Patch Changes

- bc195cf: Fix `regex` path constraint validation to require full segment matches.

  Previously, the `regex` constraint validator used the provided expression directly with `RegExp.test(...)`, which allowed partial substring matches. For example, `[a-z0-9-]+` incorrectly accepted `Post` because the substring `ost` matched.

  The validator now uses the constraint's sanitized `toRegExp(...)` source and anchors it as a full-segment match with `^(?:...)$`. This aligns runtime constraint validation with path matching behavior and prevents invalid path params from passing validation.

## 0.3.0

### Minor Changes

- 016d837: Add support for decimal route parameters through the new `decimal` constraint.

  The `range` constraint now validates numeric values more broadly, supporting both integers and decimals instead of only integer-like values.
