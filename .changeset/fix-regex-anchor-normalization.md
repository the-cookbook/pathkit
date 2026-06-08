---
'@cookbook/pathkit': patch
---

Improve `regex` constraint normalization when generating route match patterns.

The `regex` constraint now removes wrapping `^` and unescaped trailing `$` anchors from the provided regex source before composing the final route matcher.

Examples:

```txt
/posts/{slug:regex(^[a-z0-9-]+$)}
/posts/{slug:regex([a-z0-9-]+)}
```
