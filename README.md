# @the-cookbook/pathkit

A lightweight route compiler, matcher, tokenizer, and validation toolkit for JavaScript and TypeScript.

`@the-cookbook/pathkit` provides a predictable route pattern system with support for:

* Route compilation
* Route matching
* Route tokenization
* Route validation
* Optional parameters
* Wildcard parameters
* Runtime constraints
* Custom constraints
* Custom delimiters
* TypeScript support
* ESM and CommonJS

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

`@the-cookbook/pathkit` is heavily inspired by the Microsoft ASP.NET route template syntax:

* ASP.NET Core Route Constraints Documentation [https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-9.0#route-constraints](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-9.0#route-constraints)

Examples:

```txt
/users/{id}
/users/{id:int}
/files/{*path}
/posts/{slug:regex([a-z0-9-]+)}
```

The goal is to provide a familiar and expressive route syntax for JavaScript and TypeScript applications while keeping the implementation lightweight and framework agnostic.

---

# Comparison with path-to-regexp

| Feature                            | @the-cookbook/pathkit | path-to-regexp                  |
| ---------------------------------- | --------------------- | ------------------------------- |
| Microsoft-style route syntax       | Yes                   | No                              |
| Runtime route compilation          | Yes                   | Yes                             |
| Route matching                     | Yes                   | Yes                             |
| Route tokenization                 | Yes                   | Partial                         |
| Route validation                   | Yes                   | No                              |
| Runtime constraint system          | Yes                   | No                              |
| Built-in constraints               | Yes                   | No                              |
| Custom constraints                 | Yes                   | Limited/custom parsing required |
| Optional parameters                | Yes                   | Yes                             |
| Wildcard parameters                | Yes                   | Yes                             |
| TypeScript-first API               | Yes                   | Partial                         |
| Framework agnostic                 | Yes                   | Yes                             |
| Zero dependencies                  | Yes                   | No                              |
| Runtime-safe constraint validation | Yes                   | No                              |

`path-to-regexp` focuses primarily on transforming path patterns into regular expressions.

`@the-cookbook/pathkit` focuses on complete route tooling:

* Route parsing
* Validation
* Runtime-safe constraints
* Typed route segments
* Route compilation
* Route matching
* Extensibility through runtime constraint registration

---

# Features

* Zero dependencies
* Small runtime footprint
* Runtime-safe route validation
* Extensible constraint registry
* Functional API
* Framework agnostic
* SSR compatible
* ESM + CommonJS exports
* Strong TypeScript support

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

## compile()

Compiles a route pattern into a function.

### Signature

```ts
compile(route, options?) => (params?) => string
```

### Example

```ts
import { compile } from '@the-cookbook/pathkit';

const toUser = compile('/users/{id}');

toUser({ id: 10 });
// /users/10
```

### Optional Parameters

```ts
const toSearch = compile('/search/{term?}');

toSearch();
// /search

toSearch({ term: 'hello' });
// /search/hello
```

### Wildcards

```ts
const toFile = compile('/files/{*path}');

toFile({
  path: ['users', 'john', 'avatar.png'],
});

// /files/users/john/avatar.png
```

### Constraints

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

## Compile Options

### delimiter

Changes the array join delimiter.

```ts
compile('/tags/{*path}', {
  delimiter: '.',
});
```

### prune

Controls route cleanup behavior.

Available values:

```ts
'all'
'duplication'
'trailing'
false
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

### Signature

```ts
match(route, options?) => (path) => MatchResult
```

### Example

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

### Failed Match

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

## Match Options

### delimiter

Supports non-slash route styles.

```ts
const matcher = match('.users.{id}', {
  delimiter: '.',
});

matcher('.users.10');
```

### trailing

Controls trailing delimiter matching.

```ts
match('/hello/{name}', {
  trailing: false,
});
```

---

# tokenize()

Tokenizes a route pattern into route segments.

### Signature

```ts
tokenize(route) => RouteSegment[]
```

### Example

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
]
```

---

# validateRoute()

Validates route patterns before runtime usage.

### Signature

```ts
validateRoute(route) => void
```

### Example

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

## int

Matches integer values.

```txt
/users/{id:int}
```

---

## range

Matches numeric ranges.

```txt
/users/{id:range(1,100)}
```

---

## list

Matches values from a predefined list.

```txt
/search/{type:list(view|expanded|details)}
```

---

## regex

Matches custom regular expressions.

```txt
/posts/{slug:regex([a-z0-9-]+)}
```

---

# Custom Constraints

Custom constraints can be registered globally at runtime.

## registerConstraint()

### Example

```ts
import {
  registerConstraint,
} from '@the-cookbook/pathkit';

registerConstraint(
  'slug',
  Object.assign(
    (
      param: string,
      value: string | number | boolean | undefined,
    ) => {
      if (typeof value !== 'string') {
        throw new Error(
          `Parameter "${param}" must be a string`,
        );
      }

      if (!/^[a-z0-9-]+$/.test(value)) {
        throw new Error(
          `Parameter "${param}" must be a valid slug`,
        );
      }
    },
    {
      verify: () => undefined,

      toRegExp: () => '[a-z0-9-]+',
    },
  ),
);
```

Usage:

```ts
const matcher = match('/posts/{slug:slug}');

matcher('/posts/hello-world');
```

---

## unregisterConstraint()

Removes a runtime constraint.

```ts
import {
  unregisterConstraint,
} from '@the-cookbook/pathkit';

unregisterConstraint('slug');
```

---

## hasConstraint()

Checks whether a constraint exists.

```ts
import {
  hasConstraint,
} from '@the-cookbook/pathkit';

hasConstraint('slug');
```

---

## getConstraint()

Returns a registered constraint.

```ts
import {
  getConstraint,
} from '@the-cookbook/pathkit';

const constraint = getConstraint('slug');
```

---

# TypeScript

## Route Segments

```ts
import type {
  RouteSegment,
  LiteralSegment,
  ParameterSegment,
} from '@the-cookbook/pathkit';
```

---

## Constraints

```ts
import type {
  Constraint,
  ConstraintValidation,
} from '@the-cookbook/pathkit';
```

---

## Match Results

```ts
import type {
  MatchedParam,
} from '@the-cookbook/pathkit';
```

---

# Module Imports

## Root Import

```ts
import {
  compile,
  match,
  tokenize,
  validateRoute,
} from '@the-cookbook/pathkit';
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

* Predictable behavior
* Minimal abstractions
* Runtime safety
* Composable APIs
* Framework independence
* Extensibility through constraints
* Small API surface

---

# License

MIT
