---
'@cookbook/pathkit': minor
---

Add support for numeric value constraints with the new `min` and `max` constraints.

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
