---
'@cookbook/pathkit': patch
---

Fix `regex` path constraint validation to require full segment matches.

Previously, the `regex` constraint validator used the provided expression directly with `RegExp.test(...)`, which allowed partial substring matches. For example, `[a-z0-9-]+` incorrectly accepted `Post` because the substring `ost` matched.

The validator now uses the constraint's sanitized `toRegExp(...)` source and anchors it as a full-segment match with `^(?:...)$`. This aligns runtime constraint validation with path matching behavior and prevents invalid path params from passing validation.
