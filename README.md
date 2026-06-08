# `@cookbook/pathkit`

[![npm version](https://img.shields.io/npm/v/@cookbook/pathkit.svg)](https://www.npmjs.com/package/@cookbook/pathkit)
[![npm downloads](https://img.shields.io/npm/dm/@cookbook/pathkit.svg)](https://www.npmjs.com/package/@cookbook/pathkit)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@cookbook/pathkit)](https://bundlephobia.com/package/@cookbook/pathkit)
[![CI](https://github.com/the-cookbook/pathkit/actions/workflows/ci.yml/badge.svg)](https://github.com/the-cookbook/pathkit/actions/workflows/ci.yml)

A lightweight route compiler, matcher, tokenizer, and validation toolkit for JavaScript and TypeScript.

`@cookbook/pathkit` provides a predictable and extensible route pattern system with support for:

- Route compilation
- Route matching
- Route tokenization
- Route validation
- Optional parameters
- Wildcard parameters
- Runtime constraints
- Custom constraints
- Custom delimiters
- Parameter type enforcement
- Strict match validation
- TypeScript support
- ESM and CommonJS

---

# Table of Contents

- [Installation](#installation)
- [Inspiration](#inspiration)
- [Comparison with `path-to-regexp`](#comparison-with-path-to-regexp)
- [Features](#features)
- [Route Syntax](#route-syntax)
  - [Named Parameters](#named-parameters)
  - [Optional Parameters](#optional-parameters)
  - [Wildcard Parameters](#wildcard-parameters)
  - [Optional Wildcards](#optional-wildcards)
  - [Constraints](#constraints)
  - [Multiple Constraints](#multiple-constraints)
- [API](#api)
  - [compile()](#compile)
    - [Signature](#signature)
    - [Example](#example)
    - [Optional Parameters](#optional-parameters-1)
    - [Wildcards](#wildcards)
    - [Constraints](#constraints-1)
  - [Compile Options](#compile-options)
    - [delimiter](#delimiter)
    - [prune](#prune)
  - [match()](#match)
    - [Signature](#signature-1)
    - [Example](#example-1)
    - [Failed Match](#failed-match)
    - [Strict Match](#strict-match)
    - [Optional Parameters](#optional-parameters-2)
    - [Wildcards](#wildcards-1)
  - [Match Options](#match-options)
    - [delimiter](#delimiter-1)
    - [trailing](#trailing)
    - [strict](#strict)
  - [tokenize()](#tokenize)
    - [Signature](#signature-2)
    - [Example](#example-2)
  - [validateRoute()](#validateroute)
    - [Signature](#signature-3)
    - [Example](#example-3)
- [Built-in Constraints](#built-in-constraints)
  - [ConstraintValidation API](#constraintvalidation-api)
  - [decimal](#decimal)
  - [int](#int)
  - [uuid](#uuid)
  - [min](#min)
  - [max](#max)
  - [range](#range)
  - [minlength](#minlength)
  - [maxlength](#maxlength)
  - [list](#list)
  - [regex](#regex)
- [Custom Constraints](#custom-constraints)
  - [createConstraint](#createConstraint)
  - [registerConstraint()](#registerconstraint)
  - [unregisterConstraint()](#unregisterconstraint)
  - [hasConstraint()](#hasconstraint)
  - [getConstraint()](#getconstraint)
  - [resetConstraints()](#resetconstraints)
- [TypeScript](#typescript)
  - [Route Segments](#route-segments)
  - [Constraints](#constraints-2)
  - [Match Results](#match-results)
- [Module Imports](#module-imports)
  - [Root Import](#root-import)
  - [Constraint Namespace](#constraint-namespace)
  - [Deep Imports](#deep-imports)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Design Goals](#design-goals)
- [License](#license)

---

# Installation

```bash
pnpm add @cookbook/pathkit
```

```bash
npm install @cookbook/pathkit
```

```bash
yarn add @cookbook/pathkit
```

---

# Inspiration

`@cookbook/pathkit` is heavily inspired by the Microsoft ASP.NET route template syntax and route constraint system.

Reference:

- ASP.NET Core Route Constraints Documentation
  [https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-9.0#route-constraints](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-9.0#route-constraints)

Examples:

```txt
/users/{id}
/users/{id:int}
/files/{*path}
/posts/{slug:regex([a-z0-9-]+)}
```

The goal is to provide a powerful and expressive route syntax for JavaScript and TypeScript applications while keeping the implementation lightweight and framework agnostic.

---

# Comparison with `path-to-regexp`

| Feature                            | @cookbook/pathkit | path-to-regexp                  |
| ---------------------------------- | ----------------- | ------------------------------- |
| Route compilation                  | Yes               | Yes                             |
| Route matching                     | Yes               | Yes                             |
| Route tokenization                 | Yes               | Partial                         |
| Route validation                   | Yes               | No                              |
| Runtime constraint system          | Yes               | No                              |
| Built-in constraints               | Yes               | No                              |
| Custom constraints                 | Yes               | Limited/custom parsing required |
| Optional parameters                | Yes               | Yes                             |
| Wildcard parameters                | Yes               | Yes                             |
| Parameter type enforcement         | Yes               | No                              |
| Strict match validation            | Yes               | No                              |
| TypeScript-first API               | Yes               | Partial                         |
| Framework agnostic                 | Yes               | Yes                             |
| Zero dependencies                  | Yes               | No                              |
| Runtime-safe constraint validation | Yes               | No                              |

`path-to-regexp` focuses primarily on transforming path patterns into regular expressions.

`@cookbook/pathkit` focuses on complete route tooling:

- Route parsing
- Validation
- Runtime-safe constraints
- Typed route segments
- Route compilation
- Route matching
- Extensibility through runtime constraint registration

---

# Features

- Zero dependencies
- Small runtime footprint
- Runtime-safe route validation
- Extensible constraint registry
- Functional API
- Framework agnostic
- SSR compatible
- ESM + CommonJS exports
- Strong TypeScript support
- Optional strict matching for debugging constraint failures

---

# Route Syntax

## Named Parameters

```txt
/users/{id}
```

## Optional Parameters

```txt
/users/{id?}
```

## Wildcard Parameters

```txt
/files/{*path}
```

## Optional Wildcards

```txt
/files/{*path?}
```

## Constraints

```txt
/users/{id:int}
/users/{id:uuid}
/products/{price:decimal:min(1):max(10)}
/products/{slug:minlength(3):maxlength(50)}
/posts/{slug:regex([a-z0-9-]+)}
/search/{type:list(view|expanded|details)}
```

Constraints can validate the parameter type, the numeric value, the value length, or a custom pattern.

## Multiple Constraints

```txt
/users/{id:int:range(1,100)}
/products/{price:decimal:min(1):max(10)}
/products/{slug:minlength(3):maxlength(50)}
```

---

# API

# compile()

Compiles a route pattern into a function.

## Signature

```ts
interface CompileOptions {
  delimiter?: string;
  prune?: 'all' | 'duplication' | 'trailing' | false;
}

type TypeOrArray<T> = T | T[];

interface CompileParams {
  [key: string]: TypeOrArray<string | number | boolean> | null | undefined;
}

declare const compile: (
  route: string,
  options?: CompileOptions,
) => (params?: CompileParams) => string;
```

## Example

```ts
import { compile } from '@cookbook/pathkit';

const toUser = compile('/users/{id}');

toUser({ id: 10 });

// /users/10
```

---

## Optional Parameters

```ts
const toSearch = compile('/search/{term?}');

toSearch();

// /search

toSearch({ term: 'hello' });

// /search/hello
```

---

## Wildcards

```ts
const toFile = compile('/files/{*path}');

toFile({
  path: ['users', 'john', 'avatar.png'],
});

// /files/users/john/avatar.png
```

---

## Constraints

```ts
const toPage = compile('/page/{type:list(home|dashboard)}');

toPage({ type: 'home' });

// /page/home
```

Invalid values throw:

```ts
toPage({ type: 'settings' });

// Error:
// Parameter "type" must be one of: home, dashboard
```

---

# Compile Options

## delimiter

Changes the route segment delimiter used for wildcard joins and route normalization.

```ts
compile('namespace.{*path}', {
  delimiter: '.',
})({
  path: ['frontend', 'typescript', 'routing'],
});

// namespace.frontend.typescript.routing
```

This is useful for non-slash route styles such as:

- dot-separated namespaces
- event routing
- CLI command patterns
- message topics
- internal identifiers

---

## prune

Controls route cleanup behavior after compilation.

Available values:

```ts
'all';
'duplication';
'trailing';
false;
```

### `'all'`

Removes duplicated delimiters and trailing delimiters.

```ts
compile('/hello//world/', {
  prune: 'all',
})();

// /hello/world
```

---

### `'duplication'`

Removes only duplicated delimiters.

```ts
compile('/hello//world/', {
  prune: 'duplication',
})();

// /hello/world/
```

---

### `'trailing'`

Removes only trailing delimiters.

```ts
compile('/hello//world/', {
  prune: 'trailing',
})();

// /hello//world
```

---

### `false`

Disables all cleanup behavior.

```ts
compile('/hello//world/', {
  prune: false,
})();

// /hello//world/
```

---

# match()

Matches a route pattern against a path.

By default, `match()` is router-safe: constraint validation failures return a failed match instead of throwing. This makes it suitable for trying multiple route candidates.

Use `strict: true` when you want constraint validation errors to be thrown for debugging or development tooling.

## Signature

```ts
interface MatchOptions {
  delimiter?: string;
  trailing?: boolean;
  strict?: boolean;
}

type MatchedParam = Record<string, string | string[] | null | undefined>;

interface MatchResult {
  match: boolean;
  params: MatchedParam | null;
}

declare const match: (route: string, options?: MatchOptions) => (path: string) => MatchResult;
```

## Example

```ts
import { match } from '@cookbook/pathkit';

const matcher = match('/users/{id:int}');

matcher('/users/42');
```

Returns:

```ts
{
  match: true,
  params: {
    id: '42',
  },
}
```

---

## Failed Match

```ts
matcher('/users/abc');
```

Returns:

```ts
{
  match: false,
  params: null,
}
```

---

## Strict Match

By default, invalid constrained values return a failed match:

```ts
const matcher = match('/users/{id:int}');

matcher('/users/abc');
```

Returns:

```ts
{
  match: false,
  params: null,
}
```

Enable `strict` mode to throw constraint validation errors:

```ts
const strictMatcher = match('/users/{id:int}', {
  strict: true,
});

strictMatcher('/users/abc');
```

Throws:

```txt
[Constraint] Parameter "id" must be a number, instead got 'string'
```

This is useful for development tools, tests, debugging, and cases where an invalid constrained value should be treated as an application error instead of a non-match.

---

## Optional Parameters

```ts
const matcher = match('/search/{term?}');

matcher('/search');
```

Returns:

```ts
{
  match: true,
  params: {},
}
```

---

## Wildcards

```ts
const matcher = match('/files/{*path}');

matcher('/files/users/john/avatar.png');
```

Returns:

```ts
{
  match: true,
  params: {
    path: 'users/john/avatar.png',
  },
}
```

---

# Match Options

## delimiter

Supports non-slash route styles.

```ts
const matcher = match('.users.{id}', {
  delimiter: '.',
});

matcher('.users.10');
```

---

## trailing

Controls trailing delimiter matching.

```ts
match('/hello/{name}', {
  trailing: false,
});
```

---

## strict

Controls whether constraint validation errors are thrown.

Default:

```ts
strict: false;
```

When `strict` is disabled, constraint validation failures return:

```ts
{
  match: false,
  params: null,
}
```

When `strict` is enabled, constraint validation failures are thrown:

```ts
match('/users/{id:int}', {
  strict: true,
})('/users/abc');
```

Throws:

```txt
[Constraint] Parameter "id" must be a number, instead got 'string'
```

---

# tokenize()

Tokenizes a route pattern into route segments.

## Signature

```ts
type TokenType = 'literal' | 'parameter';

interface Constraint {
  type: string;
  params: string;
}

interface LiteralSegment {
  type: 'literal';
  value: string;
}

interface ParameterSegment {
  type: 'parameter';
  name: string;
  wildcard: boolean;
  optional: boolean;
  constraints: Constraint[];
}

type RouteSegment = LiteralSegment | ParameterSegment;

declare const tokenize: (route: string) => RouteSegment[];
```

## Example

```ts
import { tokenize } from '@cookbook/pathkit';

tokenize('/users/{id:int}');
```

Returns:

```ts
[
  {
    type: 'literal',
    value: '/users/',
  },
  {
    type: 'parameter',
    name: 'id',
    wildcard: false,
    optional: false,
    constraints: [
      {
        type: 'int',
        params: '',
      },
    ],
  },
];
```

---

# validateRoute()

Validates route patterns before runtime usage.

## Signature

```ts
declare const validateRoute: (route: string) => void;
```

## Example

```ts
import { validateRoute } from '@cookbook/pathkit';

validateRoute('/users/{id:int}');
```

Invalid routes throw descriptive errors.

```ts
validateRoute('/users/{id:unknown}');

// Error:
// [Constraint]: Unknown constraint type: "unknown"
```

---

# Built-in Constraints

Constraints validate parameter values during `compile()` and `match()`.

Each constraint can also provide:

- `verify()` to validate the route constraint configuration itself
- `toRegExp()` to generate the matching pattern used by `match()`

---

## ConstraintValidation API

```ts
interface ConstraintValidation {
  (paramName: string, value: string | number | boolean | undefined, params: string): void;

  verify(paramName: string, params: string): void;

  toRegExp(params: string): string;
}
```

---

## `decimal`

Validates that a parameter is a decimal.

### Syntax

```txt
{price:decimal}
```

### Example

```txt
/products/by-price/{price:decimal}
```

### Valid

```txt
/products/1
/products/1.5
/products/42
/products/9000
/products/200.99
```

### Invalid

```txt
/products/abc
/products/foo-1
```

### Notes

- Does not accept constraint parameters

---

## `int`

Validates that a parameter is an integer.

### Syntax

```txt
{id:int}
```

### Example

```txt
/users/{id:int}
```

### Valid

```txt
/users/1
/users/42
/users/9000
```

### Invalid

```txt
/users/abc
/users/1.5
/users/foo-1
```

### Notes

- Does not accept constraint parameters
- Uses `\d+` as its match pattern
- Runtime validation is also applied during `compile()` and during `match()` when a path candidate matches the generated pattern

---

## `uuid`

Validates that a parameter value matches the canonical UUID format.

### Syntax

```txt
{id:uuid}
```

### Example

```txt
/users/{id:uuid}
```

### Valid

```txt
/users/550e8400-e29b-41d4-a716-446655440000
/users/00000000-0000-0000-0000-000000000000
/users/7d444840-9dc0-11d1-b245-5ffdce74fad2
```

### Invalid

```txt
/users/abc
/users/550e8400e29b41d4a716446655440000
/users/550e8400-e29b-41d4-a716
/users/zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz
```

### Notes

- Does not accept constraint parameters
- Validates the standard hyphenated UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Matches UUID-like values such as UUID v1, v3, v4, and v5 when they use the canonical format
- Does not enforce a specific UUID version

---

## `min`

Validates that a numeric parameter value is greater than or equal to a minimum value.

### Syntax

```txt
{param:min(value)}
```

### Example

```txt
/products/{price:decimal:min(1)}
```

### Valid

```txt
/products/1
/products/9.99
/products/10
```

### Invalid

```txt
/products/0
/products/0.99
/products/abc
```

### Notes

- The argument is required
- The argument must be numeric
- The comparison is inclusive
- Values are validated numerically
- Usually combined with `int` or `decimal` to enforce numeric route matching

---

## `max`

Validates that a numeric parameter value is less than or equal to a maximum value.

### Syntax

```txt
{param:max(value)}
```

### Example

```txt
/products/{price:decimal:max(10)}
```

### Valid

```txt
/products/1
/products/9.99
/products/10
```

### Invalid

```txt
/products/10.01
/products/11
/products/abc
```

### Notes

- The argument is required
- The argument must be numeric
- The comparison is inclusive
- Values are validated numerically
- Usually combined with `int` or `decimal` to enforce numeric route matching

---

## `range`

Validates that a numeric parameter is inside an inclusive range.

### Syntax

```txt
{id:range(min,max)}
```

### Example

```txt
/users/{id:range(1,100)}
```

### Valid

```txt
/users/1
/users/50
/users/100
```

### Invalid

```txt
/users/0
/users/101
/users/abc
```

### Notes

- `min` and `max` are required
- The range is inclusive
- Values are validated numerically

---

## `minlength`

Validates that a parameter value has at least the specified number of characters.

### Syntax

```txt
{param:minlength(length)}
```

### Example

```txt
/products/{slug:minlength(3)}
```

### Valid

```txt
/products/foo
/products/product-123
/products/águia
/products/你好世界
```

### Invalid

```txt
/products/a
/products/ab
```

### Notes

- The argument is required
- The argument must be a positive integer
- Validates the parameter value length, not its numeric value
- Can be combined with `maxlength` to enforce a bounded length

---

## `maxlength`

Validates that a parameter value has no more than the specified number of characters.

### Syntax

```txt
{param:maxlength(length)}
```

### Example

```txt
/products/{slug:maxlength(50)}
```

### Valid

```txt
/products/foo
/products/product-123
/products/águia
/products/你好世界
```

### Invalid

```txt
/products/this-slug-is-too-long
```

### Notes

- The argument is required
- The argument must be a positive integer
- Validates the parameter value length, not its numeric value
- Can be combined with `minlength` to enforce a bounded length

---

## `list`

Validates that a parameter matches one item from a pipe-separated list.

### Syntax

```txt
{param:list(item1|item2|item3)}
```

### Example

```txt
/search/{type:list(view|expanded|details)}
```

### Valid

```txt
/search/view
/search/expanded
/search/details
```

### Invalid

```txt
/search/grid
/search/detail
```

### Notes

- Items are separated with `|`
- Matching is exact
- List values are also used to generate the matcher RegExp

---

## `regex`

Validates that a parameter matches a custom regular expression.

### Syntax

```txt
{param:regex(pattern)}
```

### Example

```txt
/posts/{slug:regex([a-z0-9-]+)}
```

### Valid

```txt
/posts/hello-world
/posts/post-123
```

### Invalid

```txt
/posts/HelloWorld
/posts/hello_world
```

### Notes

- The regex is used by both `compile()` validation and `match()` route matching
- Do not include route delimiters unless the parameter is intended to match them
- For cross-segment matching, use a wildcard parameter instead

---

# Custom Constraints

Custom constraints are registered globally at runtime.

A custom constraint must be created using `createConstraint`.

## `createConstraint`

Creates a custom parameter constraint implementation.

### Signature

```ts
declare const createConstraint = ({
  parse,
  verify,
  toRegExp,
}: {
  parse: (...args: Parameters<ConstraintValidation>) => void;
  verify: ConstraintValidation['verify'];
  toRegExp: ConstraintValidation['toRegExp'];
}) => ConstraintValidation;
```

### Methods

#### `parse`

Implements the runtime validation logic for the parameter value.

This method is executed when the route parameter is matched and receives:

- `paramName`: parameter name
- `value`: extracted parameter value
- `params`: constraint configuration value

Throw an error if the parameter value is invalid.

#### `verify`

Validates the constraint configuration itself.

Use this method to ensure the constraint declaration is valid and correctly formatted before `parse` is executed.

Typical use cases include:

- validating constraint arguments
- rejecting unsupported parameters
- validating parameter formatting

#### `toRegExp`

Returns the regular expression pattern used to extract and match the parameter value from the route.

The returned value must be a valid regex pattern string without delimiters.

### Example

```ts
import { createConstraint } from '@cookbook/pathkit';

const slug = createConstraint({
  parse: (paramName, value) => {
    if (typeof value !== 'string') {
      throw new Error(`Parameter "${paramName}" must be a string`);
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error(`Parameter "${paramName}" must be a valid slug`);
    }
  },

  verify: (paramName, params) => {
    if (params.trim().length) {
      throw new Error(
        `[Constraint] Constraint 'slug' declared for '${paramName}' does not accept parameters, ` +
          `but received '${params}'.`,
      );
    }
  },

  toRegExp: () => '[a-z0-9-]+',
});
```

Note: `verify` is called automatically before `parse` is executed.

---

## registerConstraint()

Registers or replaces a constraint.

### Signature

```ts
declare const registerConstraint: (name: string, constraint: ConstraintValidation) => void;
```

If a constraint with the same name already exists, it is replaced.

### Example

```ts
import { match, registerConstraint } from '@cookbook/pathkit';

registerConstraint('slug', slug);

const matcher = match('/posts/{slug:slug}');

matcher('/posts/hello-world');
```

Returns:

```ts
{
  match: true,
  params: {
    slug: 'hello-world',
  },
}
```

Invalid values return a failed match by default:

```ts
matcher('/posts/heiß');
```

Returns:

```ts
{
  match: false,
  params: null,
}
```

Use strict mode to throw the custom constraint error:

```ts
const strictMatcher = match('/posts/{slug:slug}', {
  strict: true,
});

strictMatcher('/posts/heiß');
```

Throws:

```txt
Parameter "slug" must be a valid slug
```

---

## unregisterConstraint()

Removes a runtime constraint.

### Signature

```ts
declare const unregisterConstraint: (name: string) => void;
```

### Example

```ts
import { unregisterConstraint } from '@cookbook/pathkit';

unregisterConstraint('slug');
```

---

## hasConstraint()

Checks whether a constraint exists.

### Signature

```ts
declare const hasConstraint: (name: string) => boolean;
```

### Example

```ts
import { hasConstraint } from '@cookbook/pathkit';

hasConstraint('slug');
```

---

## getConstraint()

Returns a registered constraint.

### Signature

```ts
declare const getConstraint: (name: string) => ConstraintValidation | undefined;
```

### Example

```ts
import { getConstraint } from '@cookbook/pathkit';

const constraint = getConstraint('slug');
```

---

## resetConstraints()

Restores the built-in constraint registry and removes runtime customizations.

Useful for tests.

### Signature

```ts
declare const resetConstraints: () => void;
```

---

# TypeScript

## Route Segments

```ts
import type { RouteSegment, LiteralSegment, ParameterSegment } from '@cookbook/pathkit';
```

---

## Constraints

```ts
import type { Constraint, ConstraintValidation } from '@cookbook/pathkit';
```

---

## Match Results

```ts
import type { MatchedParam } from '@cookbook/pathkit';
```

---

# Module Imports

## Root Import

```ts
import { compile, match, tokenize, validateRoute } from '@cookbook/pathkit';
```

---

## Constraint Namespace

```ts
import { constraints } from '@cookbook/pathkit';

constraints.registerConstraint(...);
```

---

## Deep Imports

```ts
import match from '@cookbook/pathkit/match';
import compile from '@cookbook/pathkit/compile';
```

---

# Error Handling

All validation and parsing errors use standard `Error` instances with descriptive messages.

## compile()

`compile()` throws when required params are missing or provided params do not satisfy constraints.

```txt
[Compile] Missing required parameter: id
```

```txt
Parameter "page" must be one of: home, dashboard
```

## match()

`match()` returns failed matches by default when a path does not match the route or does not satisfy route constraints.

```ts
{
  match: false,
  params: null,
}
```

With `strict: true`, constraint validation errors are thrown instead of being converted into failed matches.

```txt
[Constraint] Parameter "id" must be a number, instead got 'string'
```

## tokenize() / validateRoute()

Invalid route patterns and invalid constraint declarations throw.

```txt
[Tokenize] Invalid route pattern: Unexpected token
```

```txt
[Constraint]: Unknown constraint type: "unknown"
```

---

# Examples

See the [`examples`](./examples) directory for complete real-world usage examples.

---

# Design Goals

- Predictable behavior
- Minimal abstractions
- Runtime safety
- Composable APIs
- Framework independence
- Extensibility through constraints
- Small API surface

---

# License

MIT
