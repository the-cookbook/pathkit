---
"@cookbook/pathkit": minor
---

**Improved version:**

**Improved version:**

Add support for minimum- and maximum-length route parameters through the new `minlength` and `maxlength` constraints.

Usage:

```txt
/product/{slug:minlength(3)}
/product/{slug:maxlength(50)}
/product/{slug:minlength(3):maxlength(50)}
```

Both constraints expect a positive integer argument. `minlength` validates that the route parameter value has at least the specified number of characters, while `maxlength` validates that it has no more than the specified number of characters.
