---
"@cookbook/pathkit": patch
---

Fix `match` strict mode so routes with constrained parameters throw validation errors instead of returning a failed match.

On the previous released `v2.0.0`, constraint regexes could prevent a route from matching before strict constraint validation ran. Strict mode now allows structurally matching constrained parameters first, then validates the captured values and throws when a constraint fails.
