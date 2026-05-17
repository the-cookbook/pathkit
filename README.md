# `@the-cookbook/pathkit`

A lightweight route compiler, matcher, tokenizer, and validation toolkit for JavaScript and TypeScript.

`@the-cookbook/pathkit` provides a predictable and extensible route pattern system with support for:

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
    - [Optional Parameters](#optional-parameters-2)
    - [Wildcards](#wildcards-1)
  - [Match Options](#match-options)
    - [delimiter](#delimiter-1)
    - [trailing](#trailing)
  - [tokenize()](#tokenize)
    - [Signature](#signature-2)
    - [Example](#example-2)
  - [validateRoute()](#validateroute)
    - [Signature](#signature-3)
    - [Example](#example-3)
- [Built-in Constraints](#built-in-constraints)
  - [ConstraintValidation API](#constraintvalidation-api)
  - [int](#int)
  - [range](#range)
  - [list](#list)
  - [regex](#regex)
- [Custom Constraints](#custom-constraints)
  - [ConstraintValidation](#constraintvalidation)
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
- [Design Goals](#design-goals)
- [License](#license)

---

# Installation

```bash
pnpm add @the-cookbook/pathkit
```

```bash
npm install @the-cookbook/pathkit
```

```bash
yarn add @the-cookbook/pathkit
```

---

# Inspiration

`@the-cookbook/pathkit` is heavily inspired by the Microsoft ASP.NET route template syntax and route constraint system.

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

| Feature                            | @the-cookbook/pathkit | path-to-regexp                  |
| ---------------------------------- | --------------------- | ------------------------------- |
| Route compilation                  | Yes                   | Yes                             |
| Route matching                     | Yes                   | Yes                             |
| Route tokenization                 | Yes                   | Partial                         |
| Route validation                   | Yes                   | No                              |
| Runtime constraint system          | Yes                   | No                              |
| Built-in constraints               | Yes                   | No                              |
| Custom constraints                 | Yes                   | Limited/custom parsing required |
| Optional parameters                | Yes                   | Yes                             |
| Wildcard parameters                | Yes                   | Yes                             |
| Parameter type enforcement         | Yes                   | No                              |
| TypeScript-first API               | Yes                   | Partial                         |
| Framework agnostic                 | Yes                   | Yes                             |
| Zero dependencies                  | Yes                   | No                              |
| Runtime-safe constraint validation | Yes                   | No                              |

`path-to-regexp` focuses primarily on transforming path patterns into regular expressions.

`@the-cookbook/pathkit` focuses on complete route tooling:

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
/posts/{slug:regex([a-z0-9-]+)}
/search/{type:list(view|expanded|details)}
```

## Multiple Constraints

```txt
/users/{id:int:range(1,100)}
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
import { compile } from '@the-cookbook/pathkit';

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

Changes the array join delimiter.

```ts
compile('/tags/{*path}', {
  delimiter: '.',
});
```

---

## prune

Controls route cleanup behavior.

Available values:

```ts
'all';
'duplication';
'trailing';
false;
```

Example:

```ts
compile('/hello//world/', {
  prune: 'all',
});
```

---

# match()

Matches a route pattern against a path.

## Signature

```ts
interface MatchOptions {
  delimiter?: string;
  trailing?: boolean;
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
import { match } from '@the-cookbook/pathkit';

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
import { tokenize } from '@the-cookbook/pathkit';

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
import { validateRoute } from '@the-cookbook/pathkit';

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

## int

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

---

## range

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

## list

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

## regex

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

A custom constraint must implement `ConstraintValidation`.

## ConstraintValidation

```ts
interface ConstraintValidation {
  (paramName: string, value: string | number | boolean | undefined, params: string): void;

  verify(paramName: string, params: string): void;

  toRegExp(params: string): string;
}
```

---

## registerConstraint()

Registers or replaces a constraint.

### Signature

```ts
declare const registerConstraint: (name: string, constraint: ConstraintValidation) => void;
```

### Example

```ts
import { match, registerConstraint, type ConstraintValidation } from '@the-cookbook/pathkit';

const slug: ConstraintValidation = Object.assign(
  (param: string, value: string | number | boolean | undefined) => {
    if (typeof value !== 'string') {
      throw new Error(`Parameter "${param}" must be a string`);
    }

    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error(`Parameter "${param}" must be a valid slug`);
    }
  },
  {
    verify: () => undefined,

    toRegExp: () => '[a-z0-9-]+',
  },
);

registerConstraint('slug', slug);

const matcher = match('/posts/{slug:slug}');

matcher('/posts/hello-world');
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
import { unregisterConstraint } from '@the-cookbook/pathkit';

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
import { hasConstraint } from '@the-cookbook/pathkit';

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
import { getConstraint } from '@the-cookbook/pathkit';

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
import type { RouteSegment, LiteralSegment, ParameterSegment } from '@the-cookbook/pathkit';
```

---

## Constraints

```ts
import type { Constraint, ConstraintValidation } from '@the-cookbook/pathkit';
```

---

## Match Results

```ts
import type { MatchedParam } from '@the-cookbook/pathkit';
```

---

# Module Imports

## Root Import

```ts
import { compile, match, tokenize, validateRoute } from '@the-cookbook/pathkit';
```

---

## Constraint Namespace

```ts
import {
  constraints,
} from '@the-cookbook/pathkit';

constraints.registerConstraint(...);
```

---

## Deep Imports

```ts
import match from '@the-cookbook/pathkit/match';
import compile from '@the-cookbook/pathkit/compile';
```

---

# Error Handling

All validation and parsing errors throw standard `Error` instances with descriptive messages.

Example:

```txt
[Compile] Missing required parameter: id
```

```txt
[Tokenize] Invalid route pattern: Unexpected token
```

```txt
Parameter "page" must be one of: home, dashboard
```

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
